// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console} from "forge-std/Script.sol";
import "../src/IPMarketplace.sol";

contract DeployIPMarketplace is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address platformWallet = vm.envAddress("PLATFORM_WALLET");
        
        vm.startBroadcast(deployerPrivateKey);
        
        IPMarketplace marketplace = new IPMarketplace(platformWallet);
        
        console.log("IPMarketplace deployed to:", address(marketplace));
        console.log("Platform wallet:", platformWallet);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        vm.stopBroadcast();
    }
}
