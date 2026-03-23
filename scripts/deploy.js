import hre from 'hardhat';
import fs from 'fs';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const { ethers, network } = hre;
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Network:', network.name, 'ChainId:', network.config.chainId);

  // Deploy Mock USDT for testing (on testnets, use existing USDT)
  console.log('\nDeploying Mock USDT...');
  const MockUSDT = await ethers.getContractFactory('MockUSDT');
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log('✓ Mock USDT deployed to:', usdtAddress);
  
  await sleep(3000); // Wait 3 seconds between deployments

  // Deploy BillingRegistry
  console.log('\nDeploying BillingRegistry...');
  const BillingRegistry = await ethers.getContractFactory('BillingRegistry');
  const billingRegistry = await BillingRegistry.deploy();
  await billingRegistry.waitForDeployment();
  const billingRegistryAddress = await billingRegistry.getAddress();
  console.log('✓ BillingRegistry deployed to:', billingRegistryAddress);
  
  await sleep(3000);

  // Deploy PaymentStream
  console.log('\nDeploying PaymentStream...');
  const PaymentStream = await ethers.getContractFactory('PaymentStream');
  const paymentStream = await PaymentStream.deploy(
    usdtAddress,
    deployer.address // fee recipient
  );
  await paymentStream.waitForDeployment();
  const paymentStreamAddress = await paymentStream.getAddress();
  console.log('✓ PaymentStream deployed to:', paymentStreamAddress);
  
  await sleep(3000);

  // Set PaymentStream in BillingRegistry
  console.log('\nSetting PaymentStream in BillingRegistry...');
  await (await billingRegistry.setPaymentStreamContract(paymentStreamAddress)).wait();
  console.log('✓ PaymentStream contract set in BillingRegistry');
  
  await sleep(3000);

  // Deploy sample AgentWallet
  console.log('\nDeploying sample AgentWallet...');
  const AgentWallet = await ethers.getContractFactory('AgentWallet');
  const agentWallet = await AgentWallet.deploy(
    deployer.address, // owner
    deployer.address, // operator
    usdtAddress,
    paymentStreamAddress
  );
  await agentWallet.waitForDeployment();
  const agentWalletAddress = await agentWallet.getAddress();
  console.log('✓ Sample AgentWallet deployed to:', agentWalletAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    usdt: usdtAddress,
    billingRegistry: billingRegistryAddress,
    paymentStream: paymentStreamAddress,
    sampleAgentWallet: agentWalletAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n========================================');
  console.log('Deployment saved to deployment.json');
  console.log('========================================');
  console.log('\nContract Addresses:');
  console.log('===================');
  console.log(`USDT:              ${deploymentInfo.usdt}`);
  console.log(`BillingRegistry:   ${deploymentInfo.billingRegistry}`);
  console.log(`PaymentStream:     ${deploymentInfo.paymentStream}`);
  console.log(`Sample AgentWallet:${deploymentInfo.sampleAgentWallet}`);
  
  // Also write to frontend .env
  const frontendEnv = `# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=2

# Contract Addresses (Base Sepolia)
VITE_PAYMENT_STREAM_ADDRESS=${paymentStreamAddress}
VITE_BILLING_REGISTRY_ADDRESS=${billingRegistryAddress}
VITE_USDT_ADDRESS=${usdtAddress}

# RPC URL
VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
`;
  fs.writeFileSync('frontend/.env', frontendEnv);
  console.log('\n✓ Frontend .env updated with contract addresses');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });