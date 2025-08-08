// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./ReentrancyGuard.sol";

/**
 * @title IPMarketplace
 * @dev A comprehensive marketplace for intellectual property NFTs with features like:
 * - IP NFT minting with metadata and licensing terms
 * - Access-based purchasing (users buy access to IP, not ownership)
 * - Auction system with time-based bidding
 * - Lottery system for random IP distribution
 * - Royalties and revenue sharing
 * - Escrow functionality for secure transactions
 */
contract IPMarketplace is ReentrancyGuard {
    // ============ STATE VARIABLES ============
    
    struct IPMetadata {
        string name;
        string description;
        string category;
        string contentHash; // IPFS hash of the actual IP content
        string licenseTerms;
        uint256 price; // Price for access in wei
        uint256 totalSupply; // Total access tokens available
        uint256 soldTokens; // Number of access tokens sold
        address creator;
        bool active;
        uint256 createdAt;
    }
    
    struct AccessToken {
        uint256 ipTokenId;
        address owner;
        uint256 purchaseTime;
        uint256 expiryTime; // 0 means permanent access
        bool active;
    }
    
    struct Auction {
        uint256 ipTokenId;
        address seller;
        uint256 startingBid;
        uint256 currentBid;
        address currentBidder;
        uint256 endTime;
        bool active;
        bool settled;
    }
    
    struct Lottery {
        uint256 ipTokenId;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 soldTickets;
        uint256 drawTime;
        address winner;
        bool active;
        bool drawn;
        mapping(uint256 => address) tickets;
        mapping(address => uint256[]) userTickets;
    }
    
    // ============ MAPPINGS ============
    
    mapping(uint256 => IPMetadata) public ipTokens;
    mapping(uint256 => AccessToken) public accessTokens;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Lottery) public lotteries;
    mapping(address => uint256[]) public creatorTokens;
    mapping(address => uint256[]) public userAccessTokens;
    mapping(uint256 => mapping(address => bool)) public hasAccess;
    
    // ============ COUNTERS ============
    
    uint256 public nextIPTokenId = 1;
    uint256 public nextAccessTokenId = 1;
    uint256 public nextAuctionId = 1;
    uint256 public nextLotteryId = 1;
    
    // ============ CONSTANTS ============
    
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 public constant MAX_ROYALTY = 1000; // 10%
    uint256 public constant BASIS_POINTS = 10000;
    
    address public platformWallet;
    
    // ============ EVENTS ============
    
    event IPCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string category,
        uint256 price,
        uint256 totalSupply
    );
    
    event AccessPurchased(
        uint256 indexed accessTokenId,
        uint256 indexed ipTokenId,
        address indexed buyer,
        uint256 price
    );
    
    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed ipTokenId,
        address indexed seller,
        uint256 startingBid,
        uint256 endTime
    );
    
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionSettled(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 amount
    );
    
    event LotteryCreated(
        uint256 indexed lotteryId,
        uint256 indexed ipTokenId,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 drawTime
    );
    
    event LotteryTicketPurchased(
        uint256 indexed lotteryId,
        address indexed buyer,
        uint256 ticketNumber
    );
    
    event LotteryDrawn(
        uint256 indexed lotteryId,
        address indexed winner,
        uint256 winningTicket
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyCreator(uint256 tokenId) {
        require(ipTokens[tokenId].creator == msg.sender, "Not the creator");
        _;
    }
    
    modifier validIPToken(uint256 tokenId) {
        require(ipTokens[tokenId].active, "IP token does not exist or inactive");
        _;
    }
    
    modifier activeAuction(uint256 auctionId) {
        require(auctions[auctionId].active, "Auction not active");
        require(block.timestamp < auctions[auctionId].endTime, "Auction ended");
        _;
    }
    
    modifier activeLottery(uint256 lotteryId) {
        require(lotteries[lotteryId].active, "Lottery not active");
        require(block.timestamp < lotteries[lotteryId].drawTime, "Lottery ended");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }
    
    // ============ IP CREATION ============
    
    /**
     * @dev Create a new IP NFT with metadata and licensing terms
     */
    function createIP(
        string memory _name,
        string memory _description,
        string memory _category,
        string memory _contentHash,
        string memory _licenseTerms,
        uint256 _price,
        uint256 _totalSupply
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_contentHash).length > 0, "Content hash required");
        require(_price > 0, "Price must be greater than 0");
        require(_totalSupply > 0, "Total supply must be greater than 0");
        
        uint256 tokenId = nextIPTokenId++;
        
        ipTokens[tokenId] = IPMetadata({
            name: _name,
            description: _description,
            category: _category,
            contentHash: _contentHash,
            licenseTerms: _licenseTerms,
            price: _price,
            totalSupply: _totalSupply,
            soldTokens: 0,
            creator: msg.sender,
            active: true,
            createdAt: block.timestamp
        });
        
        creatorTokens[msg.sender].push(tokenId);
        
        emit IPCreated(tokenId, msg.sender, _name, _category, _price, _totalSupply);
        
        return tokenId;
    }
    
    // ============ ACCESS PURCHASING ============
    
    /**
     * @dev Purchase access to an IP token
     */
    function buyAccess(uint256 _ipTokenId, uint256 _duration) external payable validIPToken(_ipTokenId) nonReentrant {
        IPMetadata storage ip = ipTokens[_ipTokenId];
        require(ip.soldTokens < ip.totalSupply, "All access tokens sold");
        require(msg.value >= ip.price, "Insufficient payment");
        
        uint256 accessTokenId = nextAccessTokenId++;
        uint256 expiryTime = _duration > 0 ? block.timestamp + _duration : 0; // 0 = permanent
        
        accessTokens[accessTokenId] = AccessToken({
            ipTokenId: _ipTokenId,
            owner: msg.sender,
            purchaseTime: block.timestamp,
            expiryTime: expiryTime,
            active: true
        });
        
        hasAccess[_ipTokenId][msg.sender] = true;
        userAccessTokens[msg.sender].push(accessTokenId);
        ip.soldTokens++;
        
        // Calculate fees and royalties based on actual price
        uint256 platformFee = (ip.price * PLATFORM_FEE) / BASIS_POINTS;
        uint256 creatorAmount = ip.price - platformFee;
        
        // Transfer payments
        (bool platformSuccess,) = platformWallet.call{value: platformFee}("");
        require(platformSuccess, "Platform fee transfer failed");
        
        (bool creatorSuccess,) = ip.creator.call{value: creatorAmount}("");
        require(creatorSuccess, "Creator payment failed");
        
        // Refund excess payment
        if (msg.value > ip.price) {
            (bool refundSuccess,) = payable(msg.sender).call{value: msg.value - ip.price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit AccessPurchased(accessTokenId, _ipTokenId, msg.sender, ip.price);
    }
    
    // ============ AUCTION SYSTEM ============
    
    /**
     * @dev Create an auction for an IP token
     */
    function createAuction(
        uint256 _ipTokenId,
        uint256 _startingBid,
        uint256 _duration
    ) external validIPToken(_ipTokenId) onlyCreator(_ipTokenId) returns (uint256) {
        require(_startingBid > 0, "Starting bid must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        uint256 auctionId = nextAuctionId++;
        uint256 endTime = block.timestamp + _duration;
        
        auctions[auctionId] = Auction({
            ipTokenId: _ipTokenId,
            seller: msg.sender,
            startingBid: _startingBid,
            currentBid: 0,
            currentBidder: address(0),
            endTime: endTime,
            active: true,
            settled: false
        });
        
        emit AuctionCreated(auctionId, _ipTokenId, msg.sender, _startingBid, endTime);
        
        return auctionId;
    }
    
    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 _auctionId) external payable activeAuction(_auctionId) nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(
            msg.value >= auction.startingBid && msg.value > auction.currentBid,
            "Bid too low"
        );
        
        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            (bool success,) = auction.currentBidder.call{value: auction.currentBid}("");
            require(success, "Failed to refund previous bidder");
        }
        
        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;
        
        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }
    
    /**
     * @dev Settle an auction (can be called by anyone after auction ends)
     */
    function settleAuction(uint256 _auctionId) external nonReentrant {
        Auction storage auction = auctions[_auctionId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");
        require(!auction.settled, "Auction already settled");
        
        auction.active = false;
        auction.settled = true;
        
        if (auction.currentBidder != address(0)) {
            // Grant access to winner
            uint256 accessTokenId = nextAccessTokenId++;
            accessTokens[accessTokenId] = AccessToken({
                ipTokenId: auction.ipTokenId,
                owner: auction.currentBidder,
                purchaseTime: block.timestamp,
                expiryTime: 0, // Permanent access
                active: true
            });
            
            hasAccess[auction.ipTokenId][auction.currentBidder] = true;
            userAccessTokens[auction.currentBidder].push(accessTokenId);
            
            // Calculate and distribute payment
            uint256 platformFee = (auction.currentBid * PLATFORM_FEE) / BASIS_POINTS;
            uint256 sellerAmount = auction.currentBid - platformFee;
            
            (bool platformSuccess,) = platformWallet.call{value: platformFee}("");
            require(platformSuccess, "Platform fee transfer failed");
            
            (bool sellerSuccess,) = auction.seller.call{value: sellerAmount}("");
            require(sellerSuccess, "Seller payment failed");
            
            emit AuctionSettled(_auctionId, auction.currentBidder, auction.currentBid);
        }
    }
    
    // ============ LOTTERY SYSTEM ============
    
    /**
     * @dev Create a lottery for an IP token
     */
    function createLottery(
        uint256 _ipTokenId,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        uint256 _duration
    ) external validIPToken(_ipTokenId) onlyCreator(_ipTokenId) returns (uint256) {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(_maxTickets > 0, "Max tickets must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        
        uint256 lotteryId = nextLotteryId++;
        uint256 drawTime = block.timestamp + _duration;
        
        // Initialize lottery struct (mapping fields will be initialized separately)
        Lottery storage lottery = lotteries[lotteryId];
        lottery.ipTokenId = _ipTokenId;
        lottery.ticketPrice = _ticketPrice;
        lottery.maxTickets = _maxTickets;
        lottery.soldTickets = 0;
        lottery.drawTime = drawTime;
        lottery.winner = address(0);
        lottery.active = true;
        lottery.drawn = false;
        
        emit LotteryCreated(lotteryId, _ipTokenId, _ticketPrice, _maxTickets, drawTime);
        
        return lotteryId;
    }
    
    /**
     * @dev Buy lottery tickets
     */
    function buyLotteryTickets(uint256 _lotteryId, uint256 _numTickets) external payable activeLottery(_lotteryId) nonReentrant {
        Lottery storage lottery = lotteries[_lotteryId];
        require(_numTickets > 0, "Must buy at least one ticket");
        require(lottery.soldTickets + _numTickets <= lottery.maxTickets, "Not enough tickets available");
        require(msg.value >= lottery.ticketPrice * _numTickets, "Insufficient payment");
        
        for (uint256 i = 0; i < _numTickets; i++) {
            uint256 ticketNumber = lottery.soldTickets;
            lottery.tickets[ticketNumber] = msg.sender;
            lottery.userTickets[msg.sender].push(ticketNumber);
            lottery.soldTickets++;
            
            emit LotteryTicketPurchased(_lotteryId, msg.sender, ticketNumber);
        }
        
        // Refund excess payment
        uint256 totalCost = lottery.ticketPrice * _numTickets;
        if (msg.value > totalCost) {
            (bool success,) = msg.sender.call{value: msg.value - totalCost}("");
            require(success, "Refund failed");
        }
    }
    
    /**
     * @dev Draw the lottery winner (can be called by anyone after draw time)
     */
    function drawLottery(uint256 _lotteryId) external nonReentrant {
        Lottery storage lottery = lotteries[_lotteryId];
        require(lottery.active, "Lottery not active");
        require(block.timestamp >= lottery.drawTime, "Draw time not reached");
        require(!lottery.drawn, "Lottery already drawn");
        require(lottery.soldTickets > 0, "No tickets sold");
        
        lottery.active = false;
        lottery.drawn = true;
        
        // Simple pseudo-random number generation (not production-ready)
        uint256 winningTicket = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender
        ))) % lottery.soldTickets;
        
        address winner = lottery.tickets[winningTicket];
        lottery.winner = winner;
        
        // Grant access to winner
        uint256 accessTokenId = nextAccessTokenId++;
        accessTokens[accessTokenId] = AccessToken({
            ipTokenId: lottery.ipTokenId,
            owner: winner,
            purchaseTime: block.timestamp,
            expiryTime: 0, // Permanent access
            active: true
        });
        
        hasAccess[lottery.ipTokenId][winner] = true;
        userAccessTokens[winner].push(accessTokenId);
        
        // Calculate and distribute revenue
        uint256 totalRevenue = lottery.ticketPrice * lottery.soldTickets;
        uint256 platformFee = (totalRevenue * PLATFORM_FEE) / BASIS_POINTS;
        uint256 creatorAmount = totalRevenue - platformFee;
        
        (bool platformSuccess,) = platformWallet.call{value: platformFee}("");
        require(platformSuccess, "Platform fee transfer failed");
        
        (bool creatorSuccess,) = ipTokens[lottery.ipTokenId].creator.call{value: creatorAmount}("");
        require(creatorSuccess, "Creator payment failed");
        
        emit LotteryDrawn(_lotteryId, winner, winningTicket);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Check if user has access to an IP token
     */
    function checkAccess(uint256 _ipTokenId, address _user) external view returns (bool) {
        return hasAccess[_ipTokenId][_user];
    }
    
    /**
     * @dev Get all IP tokens created by a user
     */
    function getCreatorTokens(address _creator) external view returns (uint256[] memory) {
        return creatorTokens[_creator];
    }
    
    /**
     * @dev Get all access tokens owned by a user
     */
    function getUserAccessTokens(address _user) external view returns (uint256[] memory) {
        return userAccessTokens[_user];
    }
    
    /**
     * @dev Get lottery tickets owned by a user
     */
    function getUserLotteryTickets(uint256 _lotteryId, address _user) external view returns (uint256[] memory) {
        return lotteries[_lotteryId].userTickets[_user];
    }
    
    /**
     * @dev Get IP token details
     */
    function getIPToken(uint256 _tokenId) external view returns (IPMetadata memory) {
        return ipTokens[_tokenId];
    }
    
    /**
     * @dev Get access token details
     */
    function getAccessToken(uint256 _accessTokenId) external view returns (AccessToken memory) {
        return accessTokens[_accessTokenId];
    }
    
    /**
     * @dev Get auction details
     */
    function getAuction(uint256 _auctionId) external view returns (Auction memory) {
        return auctions[_auctionId];
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update platform wallet (only current platform wallet can call)
     */
    function updatePlatformWallet(address _newWallet) external {
        require(msg.sender == platformWallet, "Only platform wallet can update");
        require(_newWallet != address(0), "Invalid wallet address");
        platformWallet = _newWallet;
    }
    
    /**
     * @dev Emergency pause for specific IP token (only creator)
     */
    function pauseIPToken(uint256 _tokenId) external onlyCreator(_tokenId) {
        ipTokens[_tokenId].active = false;
    }
    
    /**
     * @dev Emergency unpause for specific IP token (only creator)
     */
    function unpauseIPToken(uint256 _tokenId) external onlyCreator(_tokenId) {
        ipTokens[_tokenId].active = true;
    }
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        revert("Direct payments not accepted");
    }
}
