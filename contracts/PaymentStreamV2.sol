// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PaymentStreamV2
 * @dev Enhanced USDT streaming with pause/resume and auto-renewal
 */
contract PaymentStreamV2 is ReentrancyGuard, Ownable {
    
    IERC20 public usdt;
    
    enum StreamStatus { 
        Active,     // 0 - Stream is flowing
        Paused,     // 1 - Stream temporarily stopped
        Cancelled,  // 2 - Stream ended early
        Completed   // 3 - Stream finished naturally
    }
    
    struct Stream {
        address sender;
        address recipient;
        uint256 depositAmount;
        uint256 withdrawnAmount;
        uint256 startTime;
        uint256 endTime;
        uint256 ratePerSecond;
        StreamStatus status;
        string serviceId;
        uint256 pausedTime;      // When stream was paused (0 if never)
        uint256 totalPaused;     // Total time stream has been paused
        bool autoRenew;          // Auto-renew when completed
        uint256 renewalCount;    // How many times renewed
    }
    
    mapping(bytes32 => Stream) public streams;
    mapping(address => bytes32[]) public senderStreams;
    mapping(address => bytes32[]) public recipientStreams;
    mapping(address => mapping(address => bool)) public autoRenewalEnabled; // sender => recipient => enabled
    
    uint256 public streamCount;
    uint256 public constant MIN_STREAM_DURATION = 1 minutes;
    uint256 public constant MAX_STREAM_DURATION = 365 days;
    uint256 public platformFeeBps = 25; // 0.25%
    address public feeRecipient;
    
    // Events
    event StreamCreated(
        bytes32 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 startTime,
        uint256 endTime,
        string serviceId,
        bool autoRenew
    );
    
    event StreamWithdrawn(
        bytes32 indexed streamId,
        address indexed recipient,
        uint256 amount
    );
    
    event StreamCancelled(
        bytes32 indexed streamId,
        address indexed sender,
        uint256 remainingAmount
    );
    
    event StreamCompleted(bytes32 indexed streamId, bool autoRenewed);
    
    event StreamPaused(
        bytes32 indexed streamId,
        uint256 pausedAt,
        uint256 remainingTime
    );
    
    event StreamResumed(
        bytes32 indexed streamId,
        uint256 resumedAt,
        uint256 newEndTime
    );
    
    event StreamRenewed(
        bytes32 indexed streamId,
        bytes32 newStreamId,
        uint256 amount,
        uint256 newEndTime
    );
    
    event AutoRenewalToggled(
        address indexed sender,
        address indexed recipient,
        bool enabled
    );
    
    event NotificationSent(
        bytes32 indexed streamId,
        address indexed recipient,
        string notificationType,
        string message
    );
    
    constructor(address _usdt, address _feeRecipient) Ownable(msg.sender) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        usdt = IERC20(_usdt);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a new payment stream with optional auto-renewal
     */
    function createStream(
        address recipient,
        uint256 amount,
        uint256 duration,
        string calldata serviceId,
        bool _autoRenew
    ) external nonReentrant returns (bytes32 streamId) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot stream to self");
        require(amount > 0, "Amount must be greater than 0");
        require(duration >= MIN_STREAM_DURATION, "Duration too short");
        require(duration <= MAX_STREAM_DURATION, "Duration too long");
        
        streamId = _createStreamInternal(
            msg.sender,
            recipient,
            amount,
            duration,
            serviceId,
            _autoRenew
        );
        
        return streamId;
    }
    
    function _createStreamInternal(
        address sender,
        address recipient,
        uint256 amount,
        uint256 duration,
        string calldata serviceId,
        bool _autoRenew
    ) internal returns (bytes32 streamId) {
        // Calculate fee
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 depositAmount = amount - fee;
        
        // Transfer USDT from sender
        require(
            usdt.transferFrom(sender, address(this), amount),
            "USDT transfer failed"
        );
        
        // Transfer fee
        if (fee > 0) {
            require(usdt.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        
        // Generate stream ID
        streamId = keccak256(
            abi.encodePacked(
                sender,
                recipient,
                amount,
                block.timestamp,
                streamCount
            )
        );
        
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;
        uint256 ratePerSecond = depositAmount / duration;
        
        streams[streamId] = Stream({
            sender: sender,
            recipient: recipient,
            depositAmount: depositAmount,
            withdrawnAmount: 0,
            startTime: startTime,
            endTime: endTime,
            ratePerSecond: ratePerSecond,
            status: StreamStatus.Active,
            serviceId: serviceId,
            pausedTime: 0,
            totalPaused: 0,
            autoRenew: _autoRenew,
            renewalCount: 0
        });
        
        senderStreams[sender].push(streamId);
        recipientStreams[recipient].push(streamId);
        streamCount++;
        
        emit StreamCreated(
            streamId,
            sender,
            recipient,
            depositAmount,
            startTime,
            endTime,
            serviceId,
            _autoRenew
        );
        
        // Send notification
        emit NotificationSent(
            streamId,
            recipient,
            "STREAM_STARTED",
            "New payment stream started"
        );
        
        return streamId;
    }
    
    /**
     * @dev Calculate current available balance accounting for pauses
     */
    function availableBalance(bytes32 streamId) public view returns (uint256) {
        Stream storage stream = streams[streamId];
        
        if (stream.status != StreamStatus.Active && stream.status != StreamStatus.Paused) {
            return 0;
        }
        
        uint256 currentTime = block.timestamp;
        uint256 effectiveEndTime = stream.endTime + stream.totalPaused;
        
        if (stream.status == StreamStatus.Paused) {
            currentTime = stream.pausedTime;
        }
        
        if (currentTime > effectiveEndTime) {
            currentTime = effectiveEndTime;
        }
        
        if (currentTime <= stream.startTime) return 0;
        
        uint256 elapsed = currentTime - stream.startTime - stream.totalPaused;
        if (stream.status == StreamStatus.Paused) {
            elapsed = stream.pausedTime - stream.startTime - stream.totalPaused;
        }
        
        uint256 totalAvailable = elapsed * stream.ratePerSecond;
        
        if (totalAvailable > stream.depositAmount) {
            totalAvailable = stream.depositAmount;
        }
        
        return totalAvailable - stream.withdrawnAmount;
    }
    
    /**
     * @dev Pause an active stream
     */
    function pauseStream(bytes32 streamId) external {
        Stream storage stream = streams[streamId];
        
        require(stream.status == StreamStatus.Active, "Stream not active");
        require(
            msg.sender == stream.sender || msg.sender == stream.recipient,
            "Only sender or recipient can pause"
        );
        
        stream.status = StreamStatus.Paused;
        stream.pausedTime = block.timestamp;
        
        uint256 remainingTime = stream.endTime - block.timestamp;
        
        emit StreamPaused(streamId, block.timestamp, remainingTime);
        emit NotificationSent(
            streamId,
            stream.recipient,
            "STREAM_PAUSED",
            "Payment stream paused"
        );
    }
    
    /**
     * @dev Resume a paused stream
     */
    function resumeStream(bytes32 streamId) external {
        Stream storage stream = streams[streamId];
        
        require(stream.status == StreamStatus.Paused, "Stream not paused");
        require(
            msg.sender == stream.sender || msg.sender == stream.recipient,
            "Only sender or recipient can resume"
        );
        
        uint256 pauseDuration = block.timestamp - stream.pausedTime;
        stream.totalPaused += pauseDuration;
        stream.endTime += pauseDuration; // Extend end time by pause duration
        stream.status = StreamStatus.Active;
        stream.pausedTime = 0;
        
        emit StreamResumed(streamId, block.timestamp, stream.endTime);
        emit NotificationSent(
            streamId,
            stream.recipient,
            "STREAM_RESUMED",
            "Payment stream resumed"
        );
    }
    
    /**
     * @dev Withdraw available funds
     */
    function withdraw(bytes32 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        
        require(
            stream.status == StreamStatus.Active || stream.status == StreamStatus.Paused,
            "Stream not withdrawable"
        );
        require(msg.sender == stream.recipient, "Only recipient can withdraw");
        
        uint256 amount = availableBalance(streamId);
        require(amount > 0, "No funds available");
        
        stream.withdrawnAmount += amount;
        
        // Check if stream completed
        uint256 effectiveEndTime = stream.endTime + stream.totalPaused;
        if (block.timestamp >= effectiveEndTime || 
            stream.withdrawnAmount >= stream.depositAmount) {
            _completeStream(streamId);
        }
        
        require(usdt.transfer(stream.recipient, amount), "Withdrawal failed");
        
        emit StreamWithdrawn(streamId, stream.recipient, amount);
    }
    
    /**
     * @dev Internal function to complete a stream
     */
    function _completeStream(bytes32 streamId) internal {
        Stream storage stream = streams[streamId];
        stream.status = StreamStatus.Completed;
        
        bool autoRenewed = false;
        
        // Auto-renew if enabled and sender has approved
        if (stream.autoRenew && autoRenewalEnabled[stream.sender][stream.recipient]) {
            // Try to auto-renew with same parameters
            uint256 duration = stream.endTime - stream.startTime - stream.totalPaused;
            uint256 amount = stream.depositAmount;
            
            // Check if sender has sufficient balance and allowance
            uint256 senderBalance = usdt.balanceOf(stream.sender);
            uint256 senderAllowance = usdt.allowance(stream.sender, address(this));
            
            if (senderBalance >= amount && senderAllowance >= amount) {
                try this.createStream(
                    stream.recipient,
                    amount,
                    duration,
                    stream.serviceId,
                    true
                ) returns (bytes32 newStreamId) {
                    streams[newStreamId].renewalCount = stream.renewalCount + 1;
                    emit StreamRenewed(streamId, newStreamId, amount, streams[newStreamId].endTime);
                    autoRenewed = true;
                } catch {
                    // Auto-renew failed, just complete
                }
            }
        }
        
        emit StreamCompleted(streamId, autoRenewed);
        emit NotificationSent(
            streamId,
            stream.recipient,
            autoRenewed ? "STREAM_RENEWED" : "STREAM_COMPLETED",
            autoRenewed ? "Stream auto-renewed" : "Stream completed"
        );
    }
    
    /**
     * @dev Cancel an active or paused stream
     */
    function cancelStream(bytes32 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        
        require(
            stream.status == StreamStatus.Active || stream.status == StreamStatus.Paused,
            "Stream not cancellable"
        );
        require(msg.sender == stream.sender, "Only sender can cancel");
        
        uint256 recipientAmount = availableBalance(streamId);
        uint256 remainingAmount = stream.depositAmount - stream.withdrawnAmount - recipientAmount;
        
        stream.status = StreamStatus.Cancelled;
        stream.withdrawnAmount = stream.depositAmount;
        
        // Pay recipient
        if (recipientAmount > 0) {
            require(usdt.transfer(stream.recipient, recipientAmount), "Recipient transfer failed");
            emit StreamWithdrawn(streamId, stream.recipient, recipientAmount);
        }
        
        // Return remaining to sender
        if (remainingAmount > 0) {
            require(usdt.transfer(stream.sender, remainingAmount), "Refund failed");
        }
        
        emit StreamCancelled(streamId, stream.sender, remainingAmount);
        emit NotificationSent(
            streamId,
            stream.recipient,
            "STREAM_CANCELLED",
            "Payment stream cancelled"
        );
    }
    
    /**
     * @dev Toggle auto-renewal for a sender-recipient pair
     */
    function setAutoRenewal(address recipient, bool enabled) external {
        require(recipient != address(0), "Invalid recipient");
        autoRenewalEnabled[msg.sender][recipient] = enabled;
        emit AutoRenewalToggled(msg.sender, recipient, enabled);
    }
    
    /**
     * @dev Get stream details with current status
     */
    function getStream(bytes32 streamId) external view returns (
        address sender,
        address recipient,
        uint256 depositAmount,
        uint256 withdrawnAmount,
        uint256 startTime,
        uint256 endTime,
        uint256 ratePerSecond,
        StreamStatus status,
        string memory serviceId,
        bool autoRenew,
        uint256 remainingTime,
        uint256 availableNow
    ) {
        Stream storage s = streams[streamId];
        sender = s.sender;
        recipient = s.recipient;
        depositAmount = s.depositAmount;
        withdrawnAmount = s.withdrawnAmount;
        startTime = s.startTime;
        endTime = s.endTime + s.totalPaused;
        ratePerSecond = s.ratePerSecond;
        status = s.status;
        serviceId = s.serviceId;
        autoRenew = s.autoRenew;
        
        if (status == StreamStatus.Active) {
            uint256 effectiveEnd = s.endTime + s.totalPaused;
            remainingTime = block.timestamp < effectiveEnd ? effectiveEnd - block.timestamp : 0;
        } else if (status == StreamStatus.Paused) {
            remainingTime = s.endTime + s.totalPaused - s.pausedTime;
        } else {
            remainingTime = 0;
        }
        
        availableNow = availableBalance(streamId);
    }
    
    /**
     * @dev Get sender's streams
     */
    function getSenderStreams(address sender) external view returns (bytes32[] memory) {
        return senderStreams[sender];
    }
    
    /**
     * @dev Get recipient's streams
     */
    function getRecipientStreams(address recipient) external view returns (bytes32[] memory) {
        return recipientStreams[recipient];
    }
    
    /**
     * @dev Get all stream IDs for an address (both sender and recipient)
     */
    function getAllStreamsForAddress(address user) external view returns (bytes32[] memory) {
        bytes32[] memory sent = senderStreams[user];
        bytes32[] memory received = recipientStreams[user];
        
        bytes32[] memory all = new bytes32[](sent.length + received.length);
        
        for (uint i = 0; i < sent.length; i++) {
            all[i] = sent[i];
        }
        
        for (uint i = 0; i < received.length; i++) {
            all[sent.length + i] = received[i];
        }
        
        return all;
    }
    
    /**
     * @dev Get streams by status for an address
     */
    function getStreamsByStatus(address user, StreamStatus _status) external view returns (bytes32[] memory) {
        bytes32[] memory all = this.getAllStreamsForAddress(user);
        uint256 count = 0;
        
        // Count matching streams
        for (uint i = 0; i < all.length; i++) {
            if (streams[all[i]].status == _status) {
                count++;
            }
        }
        
        bytes32[] memory result = new bytes32[](count);
        uint256 index = 0;
        
        for (uint i = 0; i < all.length; i++) {
            if (streams[all[i]].status == _status) {
                result[index] = all[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Update platform fee
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 500, "Fee too high");
        platformFeeBps = newFeeBps;
    }
    
    /**
     * @dev Update fee recipient
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid address");
        feeRecipient = newFeeRecipient;
    }
}
