import { expect } from 'chai';
import hre from 'hardhat';
const { ethers } = hre;

describe('PaymentStream', function () {
  let paymentStream, mockUSDT, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy MockUSDT first
    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    
    // Deploy PaymentStream with required constructor args
    const PaymentStream = await ethers.getContractFactory('PaymentStream');
    paymentStream = await PaymentStream.deploy(
      await mockUSDT.getAddress(),
      owner.address // feeRecipient
    );
    await paymentStream.waitForDeployment();
  });

  it('Should deploy successfully', async function () {
    expect(await paymentStream.getAddress()).to.be.properAddress;
  });

  it('Should create a payment stream', async function () {
    // Approve tokens first
    await mockUSDT.approve(await paymentStream.getAddress(), ethers.parseUnits('100', 6));
    
    const tx = await paymentStream.createStream(
      addr1.address,
      ethers.parseUnits('10', 6),
      3600,
      'test-service'
    );
    await expect(tx).to.emit(paymentStream, 'StreamCreated');
  });
});

describe('AgentWallet', function () {
  let wallet, mockUSDT, paymentStream, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    // Deploy MockUSDT first
    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();
    
    // Deploy PaymentStream
    const PaymentStream = await ethers.getContractFactory('PaymentStream');
    paymentStream = await PaymentStream.deploy(
      await mockUSDT.getAddress(),
      owner.address
    );
    await paymentStream.waitForDeployment();
    
    // Deploy AgentWallet with required constructor args
    const AgentWallet = await ethers.getContractFactory('AgentWallet');
    wallet = await AgentWallet.deploy(
      owner.address, // _owner
      addr1.address, // _operator
      await mockUSDT.getAddress(), // _usdt
      await paymentStream.getAddress() // _paymentStream
    );
    await wallet.waitForDeployment();
  });

  it('Should deploy with correct owner', async function () {
    expect(await wallet.owner()).to.equal(owner.address);
  });
});

describe('BillingRegistry', function () {
  let registry, owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const BillingRegistry = await ethers.getContractFactory('BillingRegistry');
    registry = await BillingRegistry.deploy();
    await registry.waitForDeployment();
  });

  it('Should deploy successfully', async function () {
    expect(await registry.getAddress()).to.be.properAddress;
  });
});

describe('MockUSDT', function () {
  let usdt, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
  });

  it('Should mint tokens', async function () {
    await usdt.mint(addr1.address, ethers.parseUnits('1000', 6));
    expect(await usdt.balanceOf(addr1.address)).to.equal(ethers.parseUnits('1000', 6));
  });
});
