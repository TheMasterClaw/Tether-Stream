// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BillingRegistry
 * @dev Registry for AI agent services, billing rates, and service discovery
 * Enables standardized service offerings with transparent pricing
 */
contract BillingRegistry is Ownable, ReentrancyGuard {
    
    enum BillingType {
        PerSecond,      // Stream payment continuously
        PerCall,        // Pay per API call
        PerToken,       // Pay per token (for LLMs)
        Fixed,          // Fixed price service
        Hybrid          // Combination of above
    }
    
    struct Service {
        bytes32 serviceId;
        address provider;
        string name;
        string description;
        string endpoint;
        BillingType billingType;
        uint256 rate;              // Base rate (per second, per call, etc.)
        uint256 minDuration;       // Minimum stream duration
        uint256 maxDuration;       // Maximum stream duration
        bool isActive;
        uint256 totalEarned;
        uint256 totalRequests;
        uint256 ratingSum;
        uint256 ratingCount;
        string[] tags;
    }
    
    struct UsageRecord {
        bytes32 serviceId;
        address consumer;
        uint256 startTime;
        uint256 endTime;
        uint256 amountPaid;
        bool isStream;
    }
    
    // Service ID => Service details
    mapping(bytes32 => Service) public services;
    
    // Provider address => Service IDs
    mapping(address => bytes32[]) public providerServices;
    
    // Consumer => Usage history
    mapping(address => UsageRecord[]) public consumerHistory;
    
    // Provider => Earnings
    mapping(address => uint256) public providerEarnings;
    
    // Tag => Service IDs
    mapping(string => bytes32[]) public tagIndex;
    
    // All active service IDs
    bytes32[] public activeServiceIds;
    
    // Service counter
    uint256 public totalServices;
    
    // Authorized PaymentStream contract
    address public paymentStreamContract;
    
    // Platform settings
    uint256 public minServiceRate = 1e6; // 1 USDT (6 decimals)
    uint256 public platformFeeBps = 25;  // 0.25%
    
    // Reserved service IDs for common services
    mapping(string => bytes32) public standardServices;
    
    event ServiceRegistered(
        bytes32 indexed serviceId,
        address indexed provider,
        string name,
        BillingType billingType,
        uint256 rate
    );
    
    event ServiceUpdated(
        bytes32 indexed serviceId,
        uint256 newRate,
        bool isActive
    );
    
    event ServiceConsumed(
        bytes32 indexed serviceId,
        address indexed consumer,
        uint256 amount,
        bool isStream
    );
    
    event ServiceRated(
        bytes32 indexed serviceId,
        address indexed consumer,
        uint8 rating
    );
    
    event PaymentStreamContractUpdated(address newContract);
    
    modifier onlyPaymentStream() {
        require(
            msg.sender == paymentStreamContract || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Set the PaymentStream contract address
     */
    function setPaymentStreamContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid address");
        paymentStreamContract = _contract;
        emit PaymentStreamContractUpdated(_contract);
    }
    
    /**
     * @dev Register a new service
     */
    function registerService(
        string calldata name,
        string calldata description,
        string calldata endpoint,
        BillingType billingType,
        uint256 rate,
        uint256 minDuration,
        uint256 maxDuration,
        string[] calldata tags
    ) external returns (bytes32 serviceId) {
        require(bytes(name).length > 0, "Name required");
        require(rate >= minServiceRate, "Rate too low");
        require(maxDuration >= minDuration, "Invalid durations");
        
        serviceId = keccak256(
            abi.encodePacked(
                msg.sender,
                name,
                block.timestamp,
                totalServices
            )
        );
        
        services[serviceId] = Service({
            serviceId: serviceId,
            provider: msg.sender,
            name: name,
            description: description,
            endpoint: endpoint,
            billingType: billingType,
            rate: rate,
            minDuration: minDuration,
            maxDuration: maxDuration,
            isActive: true,
            totalEarned: 0,
            totalRequests: 0,
            ratingSum: 0,
            ratingCount: 0,
            tags: tags
        });
        
        providerServices[msg.sender].push(serviceId);
        activeServiceIds.push(serviceId);
        
        // Index by tags
        for (uint256 i = 0; i < tags.length; i++) {
            tagIndex[tags[i]].push(serviceId);
        }
        
        totalServices++;
        
        emit ServiceRegistered(
            serviceId,
            msg.sender,
            name,
            billingType,
            rate
        );
        
        return serviceId;
    }
    
    /**
     * @dev Update service details
     */
    function updateService(
        bytes32 serviceId,
        uint256 newRate,
        bool isActive,
        string calldata newDescription,
        string calldata newEndpoint
    ) external {
        Service storage service = services[serviceId];
        require(service.provider == msg.sender, "Not provider");
        
        if (newRate > 0) {
            require(newRate >= minServiceRate, "Rate too low");
            service.rate = newRate;
        }
        
        service.isActive = isActive;
        
        if (bytes(newDescription).length > 0) {
            service.description = newDescription;
        }
        
        if (bytes(newEndpoint).length > 0) {
            service.endpoint = newEndpoint;
        }
        
        emit ServiceUpdated(serviceId, service.rate, isActive);
    }
    
    /**
     * @dev Record service consumption (called by PaymentStream)
     */
    function recordConsumption(
        bytes32 serviceId,
        address consumer,
        uint256 amount,
        bool isStream,
        uint256 startTime,
        uint256 endTime
    ) external onlyPaymentStream {
        Service storage service = services[serviceId];
        
        service.totalEarned += amount;
        service.totalRequests++;
        providerEarnings[service.provider] += amount;
        
        consumerHistory[consumer].push(UsageRecord({
            serviceId: serviceId,
            consumer: consumer,
            startTime: startTime,
            endTime: endTime,
            amountPaid: amount,
            isStream: isStream
        }));
        
        emit ServiceConsumed(serviceId, consumer, amount, isStream);
    }
    
    /**
     * @dev Rate a service (1-5 stars, scaled to 0-100)
     */
    function rateService(bytes32 serviceId, uint8 rating) external {
        require(rating >= 1 && rating <= 5, "Rating 1-5");
        
        Service storage service = services[serviceId];
        require(service.provider != address(0), "Service not found");
        
        // Check if consumer has used this service
        bool hasUsed = false;
        UsageRecord[] storage history = consumerHistory[msg.sender];
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].serviceId == serviceId) {
                hasUsed = true;
                break;
            }
        }
        require(hasUsed, "Must use service before rating");
        
        service.ratingSum += rating * 20; // Scale to 100
        service.ratingCount++;
        
        emit ServiceRated(serviceId, msg.sender, rating);
    }
    
    /**
     * @dev Get service details
     */
    function getService(bytes32 serviceId) external view returns (Service memory) {
        return services[serviceId];
    }
    
    /**
     * @dev Get average rating for a service
     */
    function getAverageRating(bytes32 serviceId) external view returns (uint256) {
        Service storage service = services[serviceId];
        if (service.ratingCount == 0) return 0;
        return service.ratingSum / service.ratingCount;
    }
    
    /**
     * @dev Get all services by provider
     */
    function getProviderServices(address provider) external view returns (bytes32[] memory) {
        return providerServices[provider];
    }
    
    /**
     * @dev Get consumer usage history
     */
    function getConsumerHistory(address consumer) external view returns (UsageRecord[] memory) {
        return consumerHistory[consumer];
    }
    
    /**
     * @dev Get services by tag
     */
    function getServicesByTag(string calldata tag) external view returns (bytes32[] memory) {
        return tagIndex[tag];
    }
    
    /**
     * @dev Get all active services (paginated)
     */
    function getActiveServices(uint256 offset, uint256 limit) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        uint256 end = offset + limit;
        if (end > activeServiceIds.length) {
            end = activeServiceIds.length;
        }
        
        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = activeServiceIds[i];
        }
        
        return result;
    }
    
    /**
     * @dev Calculate expected cost for a service
     */
    function calculateCost(
        bytes32 serviceId,
        uint256 durationOrQuantity
    ) external view returns (uint256) {
        Service storage service = services[serviceId];
        require(service.provider != address(0), "Service not found");
        
        return service.rate * durationOrQuantity;
    }
    
    /**
     * @dev Search services by name (basic substring match)
     */
    function searchServices(string calldata keyword) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        bytes32[] memory temp = new bytes32[](activeServiceIds.length);
        uint256 count = 0;
        
        bytes memory keywordBytes = bytes(keyword);
        
        for (uint256 i = 0; i < activeServiceIds.length; i++) {
            Service storage service = services[activeServiceIds[i]];
            bytes memory nameBytes = bytes(service.name);
            
            if (_contains(nameBytes, keywordBytes)) {
                temp[count] = activeServiceIds[i];
                count++;
            }
        }
        
        bytes32[] memory result = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    /**
     * @dev Helper: Check if haystack contains needle
     */
    function _contains(bytes memory haystack, bytes memory needle) 
        internal 
        pure 
        returns (bool) 
    {
        if (needle.length == 0) return true;
        if (haystack.length < needle.length) return false;
        
        for (uint256 i = 0; i <= haystack.length - needle.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < needle.length; j++) {
                if (haystack[i + j] != needle[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        
        return false;
    }
    
    /**
     * @dev Set minimum service rate
     */
    function setMinServiceRate(uint256 newMin) external onlyOwner {
        minServiceRate = newMin;
    }
    
    /**
     * @dev Get marketplace statistics
     */
    function getMarketplaceStats() external view returns (
        uint256 totalServices,
        uint256 totalVolume,
        uint256 totalProviders
    ) {
        totalServices = activeServiceIds.length;
        
        for (uint256 i = 0; i < activeServiceIds.length; i++) {
            totalVolume += services[activeServiceIds[i]].totalEarned;
        }
        
        // Count unique providers
        address[] memory seen = new address[](activeServiceIds.length);
        uint256 unique = 0;
        for (uint256 i = 0; i < activeServiceIds.length; i++) {
            address provider = services[activeServiceIds[i]].provider;
            bool found = false;
            for (uint256 j = 0; j < unique; j++) {
                if (seen[j] == provider) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                seen[unique] = provider;
                unique++;
            }
        }
        totalProviders = unique;
    }
}