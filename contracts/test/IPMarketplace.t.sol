// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Test, console} from "forge-std/Test.sol";
import "../src/IPMarketplace.sol";

contract IPMarketplaceTest is Test {
    IPMarketplace public marketplace;
    
    address public platformWallet;
    address public creator;
    address public buyer;
    address public bidder1;
    address public bidder2;
    
    // Test constants
    uint256 constant INITIAL_BALANCE = 100 ether;
    uint256 constant IP_PRICE = 1 ether;
    uint256 constant TOTAL_SUPPLY = 100;
    
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
    
    event LotteryCreated(
        uint256 indexed lotteryId,
        uint256 indexed ipTokenId,
        uint256 ticketPrice,
        uint256 maxTickets,
        uint256 drawTime
    );

    function setUp() public {
        // Setup accounts
        platformWallet = makeAddr("platformWallet");
        creator = makeAddr("creator");
        buyer = makeAddr("buyer");
        bidder1 = makeAddr("bidder1");
        bidder2 = makeAddr("bidder2");
        
        // Fund accounts
        vm.deal(creator, INITIAL_BALANCE);
        vm.deal(buyer, INITIAL_BALANCE);
        vm.deal(bidder1, INITIAL_BALANCE);
        vm.deal(bidder2, INITIAL_BALANCE);
        
        // Deploy contract
        marketplace = new IPMarketplace(platformWallet);
    }
    
    // ============ IP CREATION TESTS ============
    
    function testCreateIP() public {
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, false, true);
        emit IPCreated(1, creator, "Test IP", "Art", IP_PRICE, TOTAL_SUPPLY);
        
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "A test intellectual property",
            "Art",
            "QmTestHash123",
            "Creative Commons",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        assertEq(tokenId, 1);
        
        // Check IP metadata
        IPMarketplace.IPMetadata memory ip = marketplace.getIPToken(tokenId);
        assertEq(ip.name, "Test IP");
        assertEq(ip.description, "A test intellectual property");
        assertEq(ip.category, "Art");
        assertEq(ip.contentHash, "QmTestHash123");
        assertEq(ip.licenseTerms, "Creative Commons");
        assertEq(ip.price, IP_PRICE);
        assertEq(ip.totalSupply, TOTAL_SUPPLY);
        assertEq(ip.soldTokens, 0);
        assertEq(ip.creator, creator);
        assertTrue(ip.active);
        assertGt(ip.createdAt, 0);
        
        vm.stopPrank();
    }
    
    function testCreateIPFailures() public {
        vm.startPrank(creator);
        
        // Test empty name
        vm.expectRevert("Name required");
        marketplace.createIP("", "Description", "Art", "Hash", "License", IP_PRICE, TOTAL_SUPPLY);
        
        // Test empty content hash
        vm.expectRevert("Content hash required");
        marketplace.createIP("Name", "Description", "Art", "", "License", IP_PRICE, TOTAL_SUPPLY);
        
        // Test zero price
        vm.expectRevert("Price must be greater than 0");
        marketplace.createIP("Name", "Description", "Art", "Hash", "License", 0, TOTAL_SUPPLY);
        
        // Test zero supply
        vm.expectRevert("Total supply must be greater than 0");
        marketplace.createIP("Name", "Description", "Art", "Hash", "License", IP_PRICE, 0);
        
        vm.stopPrank();
    }
    
    // ============ ACCESS PURCHASE TESTS ============
    
    function testBuyAccess() public {
        // Create IP first
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        // Record initial balances
        uint256 creatorBalanceBefore = creator.balance;
        uint256 platformBalanceBefore = platformWallet.balance;
        uint256 buyerBalanceBefore = buyer.balance;
        
        // Buy access
        vm.startPrank(buyer);
        
        vm.expectEmit(true, true, true, true);
        emit AccessPurchased(1, tokenId, buyer, IP_PRICE);
        
        marketplace.buyAccess{value: IP_PRICE}(tokenId, 0);
        
        // Check access granted
        assertTrue(marketplace.checkAccess(tokenId, buyer));
        
        // Check access token created
        IPMarketplace.AccessToken memory accessToken = marketplace.getAccessToken(1);
        assertEq(accessToken.ipTokenId, tokenId);
        assertEq(accessToken.owner, buyer);
        assertEq(accessToken.expiryTime, 0); // Permanent access
        assertTrue(accessToken.active);
        
        // Check updated IP metadata
        IPMarketplace.IPMetadata memory ip = marketplace.getIPToken(tokenId);
        assertEq(ip.soldTokens, 1);
        
        // Check payment distribution
        uint256 expectedPlatformFee = (IP_PRICE * 250) / 10000; // 2.5%
        uint256 expectedCreatorAmount = IP_PRICE - expectedPlatformFee;
        
        assertEq(platformWallet.balance, platformBalanceBefore + expectedPlatformFee);
        assertEq(creator.balance, creatorBalanceBefore + expectedCreatorAmount);
        assertEq(buyer.balance, buyerBalanceBefore - IP_PRICE);
        
        vm.stopPrank();
    }
    
    function testBuyAccessWithOverpayment() public {
        // Create IP
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        uint256 overpayment = 2 ether;
        uint256 buyerBalanceBefore = buyer.balance;
        
        // Buy access with overpayment
        vm.prank(buyer);
        marketplace.buyAccess{value: overpayment}(tokenId, 0);
        
        // Should refund the difference
        assertEq(buyer.balance, buyerBalanceBefore - IP_PRICE);
    }
    
    function testBuyAccessFailures() public {
        // Create IP
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        vm.startPrank(buyer);
        
        // Test insufficient payment
        vm.expectRevert("Insufficient payment");
        marketplace.buyAccess{value: IP_PRICE - 1}(tokenId, 0);
        
        // Test invalid token ID
        vm.expectRevert("IP token does not exist or inactive");
        marketplace.buyAccess{value: IP_PRICE}(999, 0);
        
        vm.stopPrank();
    }
    
    // ============ AUCTION TESTS ============
    
    function testCreateAuction() public {
        // Create IP
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        uint256 startingBid = 0.5 ether;
        uint256 duration = 1 days;
        
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, true, false);
        emit AuctionCreated(1, tokenId, creator, startingBid, 0);
        
        uint256 auctionId = marketplace.createAuction(tokenId, startingBid, duration);
        
        assertEq(auctionId, 1);
        
        // Check auction details
        IPMarketplace.Auction memory auction = marketplace.getAuction(auctionId);
        assertEq(auction.ipTokenId, tokenId);
        assertEq(auction.seller, creator);
        assertEq(auction.startingBid, startingBid);
        assertEq(auction.currentBid, 0);
        assertEq(auction.currentBidder, address(0));
        assertEq(auction.endTime, block.timestamp + duration);
        assertTrue(auction.active);
        assertFalse(auction.settled);
        
        vm.stopPrank();
    }
    
    function testPlaceBid() public {
        // Create IP and auction
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        vm.prank(creator);
        uint256 auctionId = marketplace.createAuction(tokenId, 0.5 ether, 1 days);
        
        // Place first bid
        uint256 bidAmount1 = 1 ether;
        vm.startPrank(bidder1);
        
        vm.expectEmit(true, true, false, true);
        emit BidPlaced(auctionId, bidder1, bidAmount1);
        
        marketplace.placeBid{value: bidAmount1}(auctionId);
        
        // Check auction state
        IPMarketplace.Auction memory auction = marketplace.getAuction(auctionId);
        assertEq(auction.currentBid, bidAmount1);
        assertEq(auction.currentBidder, bidder1);
        
        vm.stopPrank();
        
        // Place higher bid
        uint256 bidAmount2 = 1.5 ether;
        uint256 bidder1BalanceBefore = bidder1.balance;
        
        vm.prank(bidder2);
        marketplace.placeBid{value: bidAmount2}(auctionId);
        
        // Check previous bidder was refunded
        assertEq(bidder1.balance, bidder1BalanceBefore + bidAmount1);
        
        // Check new auction state
        auction = marketplace.getAuction(auctionId);
        assertEq(auction.currentBid, bidAmount2);
        assertEq(auction.currentBidder, bidder2);
    }
    
    function testSettleAuction() public {
        // Create IP and auction
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        vm.prank(creator);
        uint256 auctionId = marketplace.createAuction(tokenId, 0.5 ether, 1 hours);
        
        // Place bid
        uint256 bidAmount = 1 ether;
        vm.prank(bidder1);
        marketplace.placeBid{value: bidAmount}(auctionId);
        
        // Fast forward time
        vm.warp(block.timestamp + 1 hours + 1);
        
        // Record balances
        uint256 creatorBalanceBefore = creator.balance;
        uint256 platformBalanceBefore = platformWallet.balance;
        
        // Settle auction
        marketplace.settleAuction(auctionId);
        
        // Check auction is settled
        IPMarketplace.Auction memory auction = marketplace.getAuction(auctionId);
        assertFalse(auction.active);
        assertTrue(auction.settled);
        
        // Check winner has access
        assertTrue(marketplace.checkAccess(tokenId, bidder1));
        
        // Check payment distribution
        uint256 expectedPlatformFee = (bidAmount * 250) / 10000;
        uint256 expectedCreatorAmount = bidAmount - expectedPlatformFee;
        
        assertEq(platformWallet.balance, platformBalanceBefore + expectedPlatformFee);
        assertEq(creator.balance, creatorBalanceBefore + expectedCreatorAmount);
    }
    
    // ============ LOTTERY TESTS ============
    
    function testCreateLottery() public {
        // Create IP
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        uint256 ticketPrice = 0.1 ether;
        uint256 maxTickets = 100;
        uint256 duration = 1 days;
        
        vm.startPrank(creator);
        
        vm.expectEmit(true, true, false, false);
        emit LotteryCreated(1, tokenId, ticketPrice, maxTickets, 0);
        
        uint256 lotteryId = marketplace.createLottery(tokenId, ticketPrice, maxTickets, duration);
        
        assertEq(lotteryId, 1);
        vm.stopPrank();
    }
    
    function testBuyLotteryTickets() public {
        // Create IP and lottery
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        uint256 ticketPrice = 0.1 ether;
        vm.prank(creator);
        uint256 lotteryId = marketplace.createLottery(tokenId, ticketPrice, 100, 1 days);
        
        // Buy tickets
        uint256 numTickets = 5;
        vm.prank(buyer);
        marketplace.buyLotteryTickets{value: ticketPrice * numTickets}(lotteryId, numTickets);
        
        // Check user tickets
        uint256[] memory userTickets = marketplace.getUserLotteryTickets(lotteryId, buyer);
        assertEq(userTickets.length, numTickets);
        for (uint256 i = 0; i < numTickets; i++) {
            assertEq(userTickets[i], i);
        }
    }
    
    function testDrawLottery() public {
        // Create IP and lottery
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        uint256 ticketPrice = 0.1 ether;
        vm.prank(creator);
        uint256 lotteryId = marketplace.createLottery(tokenId, ticketPrice, 100, 1 hours);
        
        // Buy tickets
        vm.prank(buyer);
        marketplace.buyLotteryTickets{value: ticketPrice * 10}(lotteryId, 10);
        
        // Fast forward time
        vm.warp(block.timestamp + 1 hours + 1);
        
        // Draw lottery
        marketplace.drawLottery(lotteryId);
        
        // Check winner has access
        assertTrue(marketplace.checkAccess(tokenId, buyer));
    }
    
    // ============ VIEW FUNCTION TESTS ============
    
    function testGetCreatorTokens() public {
        vm.startPrank(creator);
        
        // Create multiple IPs
        uint256 tokenId1 = marketplace.createIP("IP1", "Desc", "Art", "Hash1", "License", IP_PRICE, TOTAL_SUPPLY);
        uint256 tokenId2 = marketplace.createIP("IP2", "Desc", "Art", "Hash2", "License", IP_PRICE, TOTAL_SUPPLY);
        uint256 tokenId3 = marketplace.createIP("IP3", "Desc", "Art", "Hash3", "License", IP_PRICE, TOTAL_SUPPLY);
        
        vm.stopPrank();
        
        uint256[] memory creatorTokens = marketplace.getCreatorTokens(creator);
        assertEq(creatorTokens.length, 3);
        assertEq(creatorTokens[0], tokenId1);
        assertEq(creatorTokens[1], tokenId2);
        assertEq(creatorTokens[2], tokenId3);
    }
    
    function testGetUserAccessTokens() public {
        // Create IP
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        // Buy access multiple times
        vm.startPrank(buyer);
        marketplace.buyAccess{value: IP_PRICE}(tokenId, 0);
        
        vm.stopPrank();
        
        uint256[] memory userTokens = marketplace.getUserAccessTokens(buyer);
        assertEq(userTokens.length, 1);
        assertEq(userTokens[0], 1);
    }
    
    // ============ ADMIN FUNCTION TESTS ============
    
    function testUpdatePlatformWallet() public {
        address newWallet = makeAddr("newWallet");
        
        vm.prank(platformWallet);
        marketplace.updatePlatformWallet(newWallet);
        
        // Test with new wallet
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        uint256 newWalletBalanceBefore = newWallet.balance;
        
        vm.prank(buyer);
        marketplace.buyAccess{value: IP_PRICE}(tokenId, 0);
        
        uint256 expectedFee = (IP_PRICE * 250) / 10000;
        assertEq(newWallet.balance, newWalletBalanceBefore + expectedFee);
    }
    
    function testUpdatePlatformWalletFailure() public {
        vm.expectRevert("Only platform wallet can update");
        vm.prank(creator);
        marketplace.updatePlatformWallet(makeAddr("newWallet"));
    }
    
    function testPauseUnpauseIPToken() public {
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        // Pause token
        vm.prank(creator);
        marketplace.pauseIPToken(tokenId);
        
        IPMarketplace.IPMetadata memory ip = marketplace.getIPToken(tokenId);
        assertFalse(ip.active);
        
        // Should fail to buy access
        vm.expectRevert("IP token does not exist or inactive");
        vm.prank(buyer);
        marketplace.buyAccess{value: IP_PRICE}(tokenId, 0);
        
        // Unpause token
        vm.prank(creator);
        marketplace.unpauseIPToken(tokenId);
        
        ip = marketplace.getIPToken(tokenId);
        assertTrue(ip.active);
        
        // Should now work
        vm.prank(buyer);
        marketplace.buyAccess{value: IP_PRICE}(tokenId, 0);
        
        assertTrue(marketplace.checkAccess(tokenId, buyer));
    }
    
    // ============ EDGE CASE TESTS ============
    
    function testBuyAccessWhenSoldOut() public {
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            1 // Only 1 token available
        );
        
        // First purchase should work
        vm.prank(buyer);
        marketplace.buyAccess{value: IP_PRICE}(tokenId, 0);
        
        // Second purchase should fail
        vm.expectRevert("All access tokens sold");
        vm.prank(bidder1);
        marketplace.buyAccess{value: IP_PRICE}(tokenId, 0);
    }
    
    function testAuctionBidTooLow() public {
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        vm.prank(creator);
        uint256 auctionId = marketplace.createAuction(tokenId, 1 ether, 1 days);
        
        // Place initial bid
        vm.prank(bidder1);
        marketplace.placeBid{value: 1 ether}(auctionId);
        
        // Try to place lower bid
        vm.expectRevert("Bid too low");
        vm.prank(bidder2);
        marketplace.placeBid{value: 0.5 ether}(auctionId);
    }
    
    function testSellerCannotBid() public {
        vm.prank(creator);
        uint256 tokenId = marketplace.createIP(
            "Test IP",
            "Description",
            "Art",
            "Hash",
            "License",
            IP_PRICE,
            TOTAL_SUPPLY
        );
        
        vm.prank(creator);
        uint256 auctionId = marketplace.createAuction(tokenId, 1 ether, 1 days);
        
        vm.expectRevert("Seller cannot bid");
        vm.prank(creator);
        marketplace.placeBid{value: 1 ether}(auctionId);
    }
}
