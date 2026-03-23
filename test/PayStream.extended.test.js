import { expect } from 'chai';
import hre from 'hardhat';
const { ethers, network } = hre;

describe('PayStream - Extended Tests', function () {
  let usdt, paymentStream, billingRegistry, agentWallet;
  let owner, sender, recipient, operator, feeRecipient;

  beforeEach(async function () {
    [owner, sender, recipient, operator, feeRecipient] = await ethers.getSigners();

    // Deploy Mock USDT
    const MockUSDT = await ethers.getContractFactory('MockUSDT');
    usdt = await MockUSDT.deploy();

    // Deploy BillingRegistry
    const BillingRegistry = await ethers.getContractFactory('BillingRegistry');
    billingRegistry = await BillingRegistry.deploy();

    // Deploy PaymentStream
    const PaymentStream = await ethers.getContractFactory('PaymentStream');
    paymentStream = await PaymentStream.deploy(
      await usdt.getAddress(),
      feeRecipient.address
    );

    // Set PaymentStream in BillingRegistry
    await billingRegistry.setPaymentStreamContract(await paymentStream.getAddress());

    // Deploy AgentWallet
    const AgentWallet = await ethers.getContractFactory('AgentWallet');
    agentWallet = await AgentWallet.deploy(
      owner.address,
      operator.address,
      await usdt.getAddress(),
      await paymentStream.getAddress()
    );

    // Mint USDT to sender
    await usdt.mint(sender.address, ethers.parseUnits('10000', 6));
    await usdt.mint(owner.address, ethers.parseUnits('5000', 6));
  });

  describe('PaymentStream - Extended', function () {
    it('Should prevent creating stream with invalid recipient', async function () {
      await expect(
        paymentStream.connect(sender).createStream(
          ethers.ZeroAddress,
          ethers.parseUnits('1000', 6),
          3600,
          'test-service'
        )
      ).to.be.revertedWith('Invalid recipient');
    });

    it('Should prevent creating stream to self', async function () {
      await expect(
        paymentStream.connect(sender).createStream(
          sender.address,
          ethers.parseUnits('1000', 6),
          3600,
          'test-service'
        )
      ).to.be.revertedWith('Cannot stream to self');
    });

    it('Should prevent creating stream with zero amount', async function () {
      await expect(
        paymentStream.connect(sender).createStream(
          recipient.address,
          0,
          3600,
          'test-service'
        )
      ).to.be.revertedWith('Amount must be greater than 0');
    });

    it('Should prevent creating stream with duration too short', async function () {
      await expect(
        paymentStream.connect(sender).createStream(
          recipient.address,
          ethers.parseUnits('1000', 6),
          30, // less than 1 minute
          'test-service'
        )
      ).to.be.revertedWith('Duration too short');
    });

    it('Should prevent non-recipient from withdrawing', async function () {
      const amount = ethers.parseUnits('3600', 6);
      await usdt.connect(sender).approve(await paymentStream.getAddress(), amount);
      
      const tx = await paymentStream.connect(sender).createStream(
        recipient.address,
        amount,
        3600,
        'test-service'
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === 'StreamCreated'
      );
      const streamId = event.args.streamId;

      await network.provider.send('evm_increaseTime', [1800]);
      await network.provider.send('evm_mine');

      await expect(
        paymentStream.connect(sender).withdraw(streamId)
      ).to.be.revertedWith('Only recipient can withdraw');
    });

    it('Should allow getting sender streams', async function () {
      const amount = ethers.parseUnits('1000', 6);
      await usdt.connect(sender).approve(await paymentStream.getAddress(), amount);
      
      await paymentStream.connect(sender).createStream(
        recipient.address,
        amount,
        3600,
        'test-service'
      );

      const streams = await paymentStream.getSenderStreams(sender.address);
      expect(streams.length).to.equal(1);
    });

    it('Should allow getting recipient streams', async function () {
      const amount = ethers.parseUnits('1000', 6);
      await usdt.connect(sender).approve(await paymentStream.getAddress(), amount);
      
      await paymentStream.connect(sender).createStream(
        recipient.address,
        amount,
        3600,
        'test-service'
      );

      const streams = await paymentStream.getRecipientStreams(recipient.address);
      expect(streams.length).to.equal(1);
    });

    it('Should calculate correct platform fee', async function () {
      const amount = ethers.parseUnits('10000', 6);
      await usdt.connect(sender).approve(await paymentStream.getAddress(), amount);
      
      const feeRecipientBalanceBefore = await usdt.balanceOf(feeRecipient.address);
      
      await paymentStream.connect(sender).createStream(
        recipient.address,
        amount,
        3600,
        'test-service'
      );

      const feeRecipientBalanceAfter = await usdt.balanceOf(feeRecipient.address);
      const fee = feeRecipientBalanceAfter - feeRecipientBalanceBefore;
      
      // 0.25% fee
      const expectedFee = (amount * 25n) / 10000n;
      expect(fee).to.equal(expectedFee);
    });

    it('Should allow owner to update platform fee', async function () {
      await paymentStream.setPlatformFee(50); // 0.5%
      expect(await paymentStream.platformFeeBps()).to.equal(50);
    });

    it('Should prevent non-owner from updating platform fee', async function () {
      await expect(
        paymentStream.connect(sender).setPlatformFee(50)
      ).to.be.revertedWithCustomError(paymentStream, 'OwnableUnauthorizedAccount');
    });

    it('Should prevent setting fee too high', async function () {
      await expect(
        paymentStream.setPlatformFee(600) // 6% > 5% max
      ).to.be.revertedWith('Fee too high');
    });

    it('Should allow owner to update fee recipient', async function () {
      await paymentStream.setFeeRecipient(recipient.address);
      expect(await paymentStream.feeRecipient()).to.equal(recipient.address);
    });

    it('Should get total value locked', async function () {
      const amount = ethers.parseUnits('1000', 6);
      await usdt.connect(sender).approve(await paymentStream.getAddress(), amount);
      
      await paymentStream.connect(sender).createStream(
        recipient.address,
        amount,
        3600,
        'test-service'
      );

      const tvl = await paymentStream.getTotalValueLocked();
      expect(tvl).to.be.gt(0);
    });
  });

  describe('AgentWallet - Extended', function () {
    it('Should set operator correctly', async function () {
      await agentWallet.setOperator(recipient.address);
      expect(await agentWallet.agentOperator()).to.equal(recipient.address);
    });

    it('Should prevent non-owner from setting operator', async function () {
      await expect(
        agentWallet.connect(sender).setOperator(recipient.address)
      ).to.be.revertedWithCustomError(agentWallet, 'OwnableUnauthorizedAccount');
    });

    it('Should set daily limit correctly', async function () {
      const limit = ethers.parseUnits('1000', 6);
      await agentWallet.setDailyLimit(limit);
      
      const limits = await agentWallet.paymentLimits();
      expect(limits.dailyLimit).to.equal(limit);
    });

    it('Should allow operator to send payment', async function () {
      // Deposit first
      const depositAmount = ethers.parseUnits('2000', 6);
      await usdt.approve(await agentWallet.getAddress(), depositAmount);
      await agentWallet.deposit(depositAmount);

      // Set daily limit
      await agentWallet.setDailyLimit(depositAmount);

      // Send payment as operator
      const paymentAmount = ethers.parseUnits('500', 6);
      const recipientBalanceBefore = await usdt.balanceOf(recipient.address);
      
      await agentWallet.connect(operator).sendPayment(recipient.address, paymentAmount);
      
      const recipientBalanceAfter = await usdt.balanceOf(recipient.address);
      expect(recipientBalanceAfter - recipientBalanceBefore).to.equal(paymentAmount);
    });

    it('Should prevent exceeding daily limit', async function () {
      // Deposit first
      const depositAmount = ethers.parseUnits('2000', 6);
      await usdt.approve(await agentWallet.getAddress(), depositAmount);
      await agentWallet.deposit(depositAmount);

      // Set low daily limit
      await agentWallet.setDailyLimit(ethers.parseUnits('100', 6));

      // Try to send payment exceeding limit
      await expect(
        agentWallet.connect(operator).sendPayment(recipient.address, ethers.parseUnits('500', 6))
      ).to.be.revertedWith('Daily limit exceeded');
    });

    it('Should withdraw all funds correctly', async function () {
      const depositAmount = ethers.parseUnits('2000', 6);
      await usdt.approve(await agentWallet.getAddress(), depositAmount);
      await agentWallet.deposit(depositAmount);

      const ownerBalanceBefore = await usdt.balanceOf(owner.address);
      await agentWallet.withdrawAll();
      const ownerBalanceAfter = await usdt.balanceOf(owner.address);

      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(depositAmount);
    });

    it('Should get wallet stats correctly', async function () {
      const depositAmount = ethers.parseUnits('2000', 6);
      await usdt.approve(await agentWallet.getAddress(), depositAmount);
      await agentWallet.deposit(depositAmount);

      const stats = await agentWallet.getStats();
      expect(stats.balance).to.equal(depositAmount);
      expect(stats.received).to.equal(depositAmount);
    });

    it('Should get approved recipients list', async function () {
      await agentWallet.configureAutoStream(
        recipient.address,
        ethers.parseUnits('1000', 6),
        3600,
        true
      );

      const recipients = await agentWallet.getApprovedRecipients();
      expect(recipients).to.include(recipient.address);
    });
  });

  describe('BillingRegistry - Extended', function () {
    it('Should update service correctly', async function () {
      // Register service first
      await billingRegistry.registerService(
        'Test Service',
        'Description',
        'https://api.example.com',
        0,
        ethers.parseUnits('1', 6),
        60,
        3600,
        ['test']
      );

      const services = await billingRegistry.getProviderServices(owner.address);
      const serviceId = services[0];

      // Update service
      await billingRegistry.updateService(
        serviceId,
        ethers.parseUnits('2', 6),
        true,
        'Updated description',
        'https://api.updated.com'
      );

      const service = await billingRegistry.getService(serviceId);
      expect(service.rate).to.equal(ethers.parseUnits('2', 6));
    });

    it('Should prevent non-provider from updating service', async function () {
      // Register service
      await billingRegistry.registerService(
        'Test Service',
        'Description',
        'https://api.example.com',
        0,
        ethers.parseUnits('1', 6),
        60,
        3600,
        ['test']
      );

      const services = await billingRegistry.getProviderServices(owner.address);
      const serviceId = services[0];

      // Try to update as different user
      await expect(
        billingRegistry.connect(sender).updateService(
          serviceId,
          ethers.parseUnits('2', 6),
          true,
          '',
          ''
        )
      ).to.be.revertedWith('Not provider');
    });

    it('Should search services by keyword', async function () {
      await billingRegistry.registerService(
        'AI Image Generator',
        'Generate images with AI',
        'https://api.example.com',
        0,
        ethers.parseUnits('1', 6),
        60,
        3600,
        ['AI', 'Image']
      );

      await billingRegistry.registerService(
        'Data Analytics',
        'Analyze your data',
        'https://api2.example.com',
        1,
        ethers.parseUnits('10', 6),
        0,
        0,
        ['Data']
      );

      const results = await billingRegistry.searchServices('AI');
      expect(results.length).to.equal(1);
    });

    it('Should get services by tag', async function () {
      await billingRegistry.registerService(
        'Service 1',
        'Description',
        'https://api1.example.com',
        0,
        ethers.parseUnits('1', 6),
        60,
        3600,
        ['AI', 'Premium']
      );

      await billingRegistry.registerService(
        'Service 2',
        'Description',
        'https://api2.example.com',
        1,
        ethers.parseUnits('10', 6),
        0,
        0,
        ['AI', 'Basic']
      );

      const aiServices = await billingRegistry.getServicesByTag('AI');
      expect(aiServices.length).to.equal(2);

      const premiumServices = await billingRegistry.getServicesByTag('Premium');
      expect(premiumServices.length).to.equal(1);
    });

    it('Should calculate cost correctly', async function () {
      await billingRegistry.registerService(
        'Test Service',
        'Description',
        'https://api.example.com',
        0, // Per second
        ethers.parseUnits('1', 6), // 1 USDT per second
        60,
        3600,
        ['test']
      );

      const services = await billingRegistry.getProviderServices(owner.address);
      const serviceId = services[0];

      const cost = await billingRegistry.calculateCost(serviceId, 100); // 100 seconds
      expect(cost).to.equal(ethers.parseUnits('100', 6));
    });

    it('Should prevent registering service with rate too low', async function () {
      await expect(
        billingRegistry.registerService(
          'Cheap Service',
          'Description',
          'https://api.example.com',
          0,
          100, // Less than minServiceRate (1 USDT)
          60,
          3600,
          ['test']
        )
      ).to.be.revertedWith('Rate too low');
    });

    it('Should prevent registering service with invalid duration', async function () {
      await expect(
        billingRegistry.registerService(
          'Invalid Service',
          'Description',
          'https://api.example.com',
          0,
          ethers.parseUnits('1', 6),
          3600, // min > max
          60,
          ['test']
        )
      ).to.be.revertedWith('Invalid durations');
    });

    it('Should get marketplace stats', async function () {
      await billingRegistry.registerService(
        'Service 1',
        'Description',
        'https://api1.example.com',
        0,
        ethers.parseUnits('1', 6),
        60,
        3600,
        ['test']
      );

      await billingRegistry.registerService(
        'Service 2',
        'Description',
        'https://api2.example.com',
        1,
        ethers.parseUnits('10', 6),
        0,
        0,
        ['test2']
      );

      const stats = await billingRegistry.getMarketplaceStats();
      expect(stats.totalServices).to.equal(2);
      expect(stats.totalProviders).to.equal(1);
    });

    it('Should allow owner to set minimum service rate', async function () {
      await billingRegistry.setMinServiceRate(ethers.parseUnits('5', 6));
      expect(await billingRegistry.minServiceRate()).to.equal(ethers.parseUnits('5', 6));
    });

    it('Should get active services with pagination', async function () {
      // Register multiple services
      for (let i = 0; i < 5; i++) {
        await billingRegistry.registerService(
          `Service ${i}`,
          'Description',
          'https://api.example.com',
          0,
          ethers.parseUnits('1', 6),
          60,
          3600,
          ['test']
        );
      }

      const page1 = await billingRegistry.getActiveServices(0, 3);
      expect(page1.length).to.equal(3);

      const page2 = await billingRegistry.getActiveServices(3, 3);
      expect(page2.length).to.equal(2);
    });
  });
});
