// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentWallet
 * @dev Smart wallet for AI agents with automated streaming capabilities
 * Each AI agent gets its own wallet with programmable payment rules
 */
contract AgentWallet is ReentrancyGuard, Ownable {
    
    IERC20 public usdt;
    address public agentOperator;
    address public paymentStreamContract;
    
    struct AutoStreamConfig {
        address recipient;
        uint256 maxAmount;
        uint256 maxDuration;
        bool enabled;
    }
    
    mapping(address => AutoStreamConfig) public approvedRecipients;
    address[] public approvedRecipientsList;
    
    struct PaymentLimit {
        uint256 dailyLimit;
        uint256 spentToday;
        uint256 lastResetDay;
    }
    
    PaymentLimit public paymentLimits;
    
    uint256 public totalReceived;
    uint256 public totalSent;
    
    event FundsReceived(address indexed from, uint256 amount);
    event FundsSent(address indexed to, uint256 amount);
    event AutoStreamConfigured(address indexed recipient, uint256 maxAmount, uint256 maxDuration);
    event PaymentLimitUpdated(uint256 newLimit);
    
    modifier onlyOperator() {
        require(msg.sender == agentOperator || msg.sender == owner(), "Not authorized");
        _;
    }
    
    constructor(
        address _owner,
        address _operator,
        address _usdt,
        address _paymentStream
    ) Ownable(_owner) {
        require(_operator != address(0), "Invalid operator");
        require(_usdt != address(0), "Invalid USDT address");
        agentOperator = _operator;
        usdt = IERC20(_usdt);
        paymentStreamContract = _paymentStream;
    }
    
    /**
     * @dev Configure automatic streaming to a recipient
     */
    function configureAutoStream(
        address recipient,
        uint256 maxAmount,
        uint256 maxDuration,
        bool enabled
    ) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        
        if (approvedRecipients[recipient].recipient == address(0)) {
            approvedRecipientsList.push(recipient);
        }
        
        approvedRecipients[recipient] = AutoStreamConfig({
            recipient: recipient,
            maxAmount: maxAmount,
            maxDuration: maxDuration,
            enabled: enabled
        });
        
        emit AutoStreamConfigured(recipient, maxAmount, maxDuration);
    }
    
    /**
     * @dev Set daily payment limits
     */
    function setDailyLimit(uint256 newLimit) external onlyOwner {
        paymentLimits.dailyLimit = newLimit;
        emit PaymentLimitUpdated(newLimit);
    }
    
    /**
     * @dev Check and reset daily limit if needed
     */
    function _checkDailyLimit(uint256 amount) internal {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (currentDay > paymentLimits.lastResetDay) {
            paymentLimits.spentToday = 0;
            paymentLimits.lastResetDay = currentDay;
        }
        
        require(
            paymentLimits.spentToday + amount <= paymentLimits.dailyLimit,
            "Daily limit exceeded"
        );
        
        paymentLimits.spentToday += amount;
    }
    
    /**
     * @dev Initiate a stream from this wallet
     */
    function initiateStream(
        address recipient,
        uint256 amount,
        uint256 duration
    ) external onlyOperator nonReentrant returns (bytes32) {
        require(amount > 0, "Amount must be > 0");
        require(usdt.balanceOf(address(this)) >= amount, "Insufficient balance");
        
        // Check auto-stream configuration
        AutoStreamConfig memory config = approvedRecipients[recipient];
        if (config.recipient != address(0)) {
            require(config.enabled, "Recipient not enabled");
            require(amount <= config.maxAmount, "Amount exceeds max");
            require(duration <= config.maxDuration, "Duration exceeds max");
        }
        
        _checkDailyLimit(amount);
        
        // Approve PaymentStream contract
        usdt.approve(paymentStreamContract, amount);
        
        // Call PaymentStream contract (via low-level call for flexibility)
        (bool success, bytes memory result) = paymentStreamContract.call(
            abi.encodeWithSignature(
                "createStream(address,uint256,uint256,string)",
                recipient,
                amount,
                duration,
                "agent-service"
            )
        );
        
        require(success, "Stream creation failed");
        
        totalSent += amount;
        
        bytes32 streamId = abi.decode(result, (bytes32));
        return streamId;
    }
    
    /**
     * @dev Send immediate payment (non-streaming)
     */
    function sendPayment(address recipient, uint256 amount) external onlyOperator nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        
        _checkDailyLimit(amount);
        
        totalSent += amount;
        
        require(usdt.transfer(recipient, amount), "Transfer failed");
        
        emit FundsSent(recipient, amount);
    }
    
    /**
     * @dev Batch send payments
     */
    function batchSend(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOperator nonReentrant {
        require(recipients.length == amounts.length, "Length mismatch");
        require(recipients.length <= 50, "Batch too large");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        _checkDailyLimit(totalAmount);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(usdt.transfer(recipients[i], amounts[i]), "Transfer failed");
            emit FundsSent(recipients[i], amounts[i]);
        }
        
        totalSent += totalAmount;
    }
    
    /**
     * @dev Withdraw all funds to owner
     */
    function withdrawAll() external onlyOwner nonReentrant {
        uint256 balance = usdt.balanceOf(address(this));
        require(balance > 0, "No balance");
        require(usdt.transfer(owner(), balance), "Withdrawal failed");
    }
    
    /**
     * @dev Withdraw specific amount to owner
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(usdt.balanceOf(address(this)) >= amount, "Insufficient balance");
        require(usdt.transfer(owner(), amount), "Withdrawal failed");
    }
    
    /**
     * @dev Update operator address
     */
    function setOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0), "Invalid operator");
        agentOperator = newOperator;
    }
    
    /**
     * @dev Get wallet balance
     */
    function getBalance() external view returns (uint256) {
        return usdt.balanceOf(address(this));
    }
    
    /**
     * @dev Get wallet stats
     */
    function getStats() external view returns (
        uint256 balance,
        uint256 received,
        uint256 sent,
        uint256 remainingDaily
    ) {
        balance = usdt.balanceOf(address(this));
        received = totalReceived;
        sent = totalSent;
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 spent = (currentDay > paymentLimits.lastResetDay) 
            ? 0 
            : paymentLimits.spentToday;
        remainingDaily = paymentLimits.dailyLimit - spent;
    }
    
    /**
     * @dev Get all approved recipients
     */
    function getApprovedRecipients() external view returns (address[] memory) {
        return approvedRecipientsList;
    }
    
    /**
     * @dev Receive USDT
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(
            usdt.transferFrom(msg.sender, address(this), amount),
            "Deposit failed"
        );
        totalReceived += amount;
        emit FundsReceived(msg.sender, amount);
    }
    
    /**
     * @dev Allow receiving ETH (for native token support)
     */
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }
}