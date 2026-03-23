// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PaymentStream
 * @dev Enables continuous USDT streaming between AI agents
 * Stream payments flow linearly over time and can be withdrawn at any time
 */
contract PaymentStream is ReentrancyGuard, Ownable {
    
    IERC20 public usdt;
    
    struct Stream {
        address sender;
        address recipient;
        uint256 depositAmount;
        uint256 withdrawnAmount;
        uint256 startTime;
        uint256 endTime;
        uint256 ratePerSecond;
        bool isActive;
        string serviceId;
    }
    
    mapping(bytes32 => Stream) public streams;
    mapping(address => bytes32[]) public senderStreams;
    mapping(address => bytes32[]) public recipientStreams;
    
    uint256 public streamCount;
    uint256 public constant MIN_STREAM_DURATION = 1 minutes;
    uint256 public constant MAX_STREAM_DURATION = 365 days;
    uint256 public platformFeeBps = 25; // 0.25%
    address public feeRecipient;
    
    event StreamCreated(
        bytes32 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 startTime,
        uint256 endTime,
        string serviceId
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
    
    event StreamCompleted(bytes32 indexed streamId);
    
    constructor(address _usdt, address _feeRecipient) Ownable(msg.sender) {
        require(_usdt != address(0), "Invalid USDT address");
        require(_feeRecipient != address(0), "Invalid fee recipient");
        usdt = IERC20(_usdt);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a new payment stream
     * @param recipient Address receiving the stream
     * @param amount Total amount to stream
     * @param duration Duration of the stream in seconds
     * @param serviceId Identifier for the service being paid for
     */
    function createStream(
        address recipient,
        uint256 amount,
        uint256 duration,
        string calldata serviceId
    ) external nonReentrant returns (bytes32 streamId) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot stream to self");
        require(amount > 0, "Amount must be greater than 0");
        require(duration >= MIN_STREAM_DURATION, "Duration too short");
        require(duration <= MAX_STREAM_DURATION, "Duration too long");
        
        // Calculate fee
        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 depositAmount = amount - fee;
        
        // Transfer USDT from sender (includes fee)
        require(
            usdt.transferFrom(msg.sender, address(this), amount),
            "USDT transfer failed"
        );
        
        // Transfer fee to fee recipient
        if (fee > 0) {
            require(usdt.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        
        // Generate unique stream ID
        streamId = keccak256(
            abi.encodePacked(
                msg.sender,
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
            sender: msg.sender,
            recipient: recipient,
            depositAmount: depositAmount,
            withdrawnAmount: 0,
            startTime: startTime,
            endTime: endTime,
            ratePerSecond: ratePerSecond,
            isActive: true,
            serviceId: serviceId
        });
        
        senderStreams[msg.sender].push(streamId);
        recipientStreams[recipient].push(streamId);
        streamCount++;
        
        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            depositAmount,
            startTime,
            endTime,
            serviceId
        );
        
        return streamId;
    }
    
    /**
     * @dev Calculate current available balance for withdrawal
     */
    function availableBalance(bytes32 streamId) public view returns (uint256) {
        Stream storage stream = streams[streamId];
        
        if (!stream.isActive) return 0;
        
        uint256 currentTime = block.timestamp > stream.endTime 
            ? stream.endTime 
            : block.timestamp;
        
        if (currentTime <= stream.startTime) return 0;
        
        uint256 elapsed = currentTime - stream.startTime;
        uint256 totalAvailable = elapsed * stream.ratePerSecond;
        
        if (totalAvailable > stream.depositAmount) {
            totalAvailable = stream.depositAmount;
        }
        
        return totalAvailable - stream.withdrawnAmount;
    }
    
    /**
     * @dev Withdraw available funds from a stream
     */
    function withdraw(bytes32 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        
        require(stream.isActive, "Stream not active");
        require(msg.sender == stream.recipient, "Only recipient can withdraw");
        
        uint256 amount = availableBalance(streamId);
        require(amount > 0, "No funds available");
        
        stream.withdrawnAmount += amount;
        
        // Check if stream is completed
        if (block.timestamp >= stream.endTime || 
            stream.withdrawnAmount >= stream.depositAmount) {
            stream.isActive = false;
            emit StreamCompleted(streamId);
        }
        
        require(usdt.transfer(stream.recipient, amount), "Withdrawal failed");
        
        emit StreamWithdrawn(streamId, stream.recipient, amount);
    }
    
    /**
     * @dev Cancel an active stream (only sender)
     */
    function cancelStream(bytes32 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        
        require(stream.isActive, "Stream not active");
        require(msg.sender == stream.sender, "Only sender can cancel");
        
        uint256 recipientAmount = availableBalance(streamId);
        uint256 remainingAmount = stream.depositAmount - stream.withdrawnAmount - recipientAmount;
        
        stream.isActive = false;
        stream.withdrawnAmount = stream.depositAmount;
        
        // Pay recipient their earned amount
        if (recipientAmount > 0) {
            require(usdt.transfer(stream.recipient, recipientAmount), "Recipient transfer failed");
            emit StreamWithdrawn(streamId, stream.recipient, recipientAmount);
        }
        
        // Return remaining to sender
        if (remainingAmount > 0) {
            require(usdt.transfer(stream.sender, remainingAmount), "Refund failed");
        }
        
        emit StreamCancelled(streamId, stream.sender, remainingAmount);
    }
    
    /**
     * @dev Get full stream details
     */
    function getStream(bytes32 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }
    
    /**
     * @dev Get all streams for a sender
     */
    function getSenderStreams(address sender) external view returns (bytes32[] memory) {
        return senderStreams[sender];
    }
    
    /**
     * @dev Get all streams for a recipient
     */
    function getRecipientStreams(address recipient) external view returns (bytes32[] memory) {
        return recipientStreams[recipient];
    }
    
    /**
     * @dev Calculate total value locked in active streams
     */
    function getTotalValueLocked() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 500, "Fee too high"); // Max 5%
        platformFeeBps = newFeeBps;
    }
    
    /**
     * @dev Update fee recipient (only owner)
     */
    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        require(newFeeRecipient != address(0), "Invalid address");
        feeRecipient = newFeeRecipient;
    }
}