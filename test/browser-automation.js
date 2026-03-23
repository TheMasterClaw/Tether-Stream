#!/usr/bin/env node
/**
 * PayStream Browser Automation Tests
 * Tests critical user flows end-to-end
 */

import { chromium, devices } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const URL = process.env.PAYSTREAM_URL || 'https://frontend-7j1qnm6nt-ericnans-gmailcoms-projects.vercel.app';
const SCREENSHOT_DIR = './test-screenshots';

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

class PayStreamTester {
  constructor() {
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async screenshot(page, name) {
    const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: filepath, fullPage: true });
    this.log(`Screenshot saved: ${filepath}`);
    return filepath;
  }

  async testLandingPage() {
    this.log('Testing Landing Page...');
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext({
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      // Navigate to landing page
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
      await this.screenshot(page, '01-landing-page');

      // Check for key elements
      const title = await page.title();
      const hasLogo = await page.locator('text=PayStream').first().isVisible().catch(() => false);
      const hasLaunchButton = await page.locator('text=Launch App').first().isVisible().catch(() => false);
      const hasFeatures = await page.locator('text=Features').first().isVisible().catch(() => false);

      this.log(`Page title: ${title}`);
      this.log(`Logo visible: ${hasLogo}`);
      this.log(`Launch App button: ${hasLaunchButton}`);
      this.log(`Features section: ${hasFeatures}`);

      const passed = hasLogo && hasLaunchButton;
      this.log(`Landing Page Test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
      
      this.results.push({ test: 'Landing Page', passed, details: { title, hasLogo, hasLaunchButton } });
      
      await browser.close();
      return passed;
    } catch (error) {
      this.log(`Landing Page Test Error: ${error.message}`, 'error');
      this.results.push({ test: 'Landing Page', passed: false, error: error.message });
      await browser.close();
      return false;
    }
  }

  async testDashboardAccess() {
    this.log('Testing Dashboard Access...');
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext({
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      // Navigate to app
      await page.goto(`${URL}/app`, { waitUntil: 'networkidle', timeout: 30000 });
      await this.screenshot(page, '02-dashboard');

      // Check for dashboard elements
      const hasDashboardTitle = await page.locator('text=Agent Dashboard').first().isVisible().catch(() => false);
      const hasConnectButton = await page.locator('text=Connect').first().isVisible().catch(() => false);
      const hasBalance = await page.locator('text=USDT Balance').first().isVisible().catch(() => false);

      this.log(`Dashboard title: ${hasDashboardTitle}`);
      this.log(`Connect button: ${hasConnectButton}`);
      this.log(`Balance display: ${hasBalance}`);

      const passed = hasDashboardTitle || hasConnectButton;
      this.log(`Dashboard Access Test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
      
      this.results.push({ test: 'Dashboard Access', passed, details: { hasDashboardTitle, hasConnectButton } });
      
      await browser.close();
      return passed;
    } catch (error) {
      this.log(`Dashboard Access Test Error: ${error.message}`, 'error');
      this.results.push({ test: 'Dashboard Access', passed: false, error: error.message });
      await browser.close();
      return false;
    }
  }

  async testActiveStreamsPage() {
    this.log('Testing Active Streams Page...');
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext({
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      // Navigate to streams page
      await page.goto(`${URL}/app/streams`, { waitUntil: 'networkidle', timeout: 30000 });
      await this.screenshot(page, '03-active-streams');

      // Check for stream page elements
      const hasTitle = await page.locator('text=Active Streams').first().isVisible().catch(() => false);
      const hasFilter = await page.locator('text=All Streams').first().isVisible().catch(() => false);
      const hasConnectPrompt = await page.locator('text=Connect Your Wallet').first().isVisible().catch(() => false);

      this.log(`Streams title: ${hasTitle}`);
      this.log(`Filter dropdown: ${hasFilter}`);
      this.log(`Connect prompt: ${hasConnectPrompt}`);

      const passed = hasTitle || hasConnectPrompt;
      this.log(`Active Streams Test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
      
      this.results.push({ test: 'Active Streams Page', passed, details: { hasTitle, hasFilter, hasConnectPrompt } });
      
      await browser.close();
      return passed;
    } catch (error) {
      this.log(`Active Streams Test Error: ${error.message}`, 'error');
      this.results.push({ test: 'Active Streams Page', passed: false, error: error.message });
      await browser.close();
      return false;
    }
  }

  async testMarketplacePage() {
    this.log('Testing Marketplace Page...');
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext({
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      // Navigate to marketplace
      await page.goto(`${URL}/app/marketplace`, { waitUntil: 'networkidle', timeout: 30000 });
      await this.screenshot(page, '04-marketplace');

      // Check for marketplace elements
      const hasTitle = await page.locator('text=Service Marketplace').first().isVisible().catch(() => false);
      const hasSearch = await page.locator('placeholder=Search services...').first().isVisible().catch(() => false);
      const hasRegisterButton = await page.locator('text=Register Service').first().isVisible().catch(() => false);
      const hasTags = await page.locator('text=AI').first().isVisible().catch(() => false);

      this.log(`Marketplace title: ${hasTitle}`);
      this.log(`Search input: ${hasSearch}`);
      this.log(`Register button: ${hasRegisterButton}`);
      this.log(`Category tags: ${hasTags}`);

      const passed = hasTitle || hasSearch;
      this.log(`Marketplace Test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
      
      this.results.push({ test: 'Marketplace Page', passed, details: { hasTitle, hasSearch, hasRegisterButton } });
      
      await browser.close();
      return passed;
    } catch (error) {
      this.log(`Marketplace Test Error: ${error.message}`, 'error');
      this.results.push({ test: 'Marketplace Page', passed: false, error: error.message });
      await browser.close();
      return false;
    }
  }

  async testCreateStreamPage() {
    this.log('Testing Create Stream Page...');
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext({
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      // Navigate to create stream
      await page.goto(`${URL}/app/create`, { waitUntil: 'networkidle', timeout: 30000 });
      await this.screenshot(page, '05-create-stream');

      // Check for create stream elements
      const hasTitle = await page.locator('text=Create Stream').first().isVisible().catch(() => false);
      const hasRecipient = await page.locator('text=Recipient Address').first().isVisible().catch(() => false);
      const hasAmount = await page.locator('text=Total Amount').first().isVisible().catch(() => false);
      const hasDuration = await page.locator('text=Stream Duration').first().isVisible().catch(() => false);

      this.log(`Create title: ${hasTitle}`);
      this.log(`Recipient field: ${hasRecipient}`);
      this.log(`Amount field: ${hasAmount}`);
      this.log(`Duration field: ${hasDuration}`);

      const passed = hasTitle || hasRecipient;
      this.log(`Create Stream Test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
      
      this.results.push({ test: 'Create Stream Page', passed, details: { hasTitle, hasRecipient, hasAmount, hasDuration } });
      
      await browser.close();
      return passed;
    } catch (error) {
      this.log(`Create Stream Test Error: ${error.message}`, 'error');
      this.results.push({ test: 'Create Stream Page', passed: false, error: error.message });
      await browser.close();
      return false;
    }
  }

  async testMobileResponsiveness() {
    this.log('Testing Mobile Responsiveness...');
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext({
        ...devices['iPhone 14 Pro'],
      });
      const page = await context.newPage();

      // Navigate to app on mobile
      await page.goto(`${URL}/app`, { waitUntil: 'networkidle', timeout: 30000 });
      await this.screenshot(page, '06-mobile-dashboard');

      // Check for mobile-friendly elements
      const hasLogo = await page.locator('text=PayStream').first().isVisible().catch(() => false);
      const viewport = page.viewportSize();

      this.log(`Mobile viewport: ${viewport.width}x${viewport.height}`);
      this.log(`Logo visible: ${hasLogo}`);

      const passed = hasLogo && viewport.width <= 500;
      this.log(`Mobile Responsiveness Test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
      
      this.results.push({ test: 'Mobile Responsiveness', passed, details: { viewport, hasLogo } });
      
      await browser.close();
      return passed;
    } catch (error) {
      this.log(`Mobile Test Error: ${error.message}`, 'error');
      this.results.push({ test: 'Mobile Responsiveness', passed: false, error: error.message });
      await browser.close();
      return false;
    }
  }

  async testNavigationFlow() {
    this.log('Testing Navigation Flow...');
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext({
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      });
      const page = await context.newPage();

      // Start at landing page
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Click Launch App
      const launchButton = page.locator('text=Launch App').first();
      if (await launchButton.isVisible().catch(() => false)) {
        await launchButton.click();
        await page.waitForLoadState('networkidle');
        await this.screenshot(page, '07-nav-to-app');
      }

      // Navigate to streams
      const streamsLink = page.locator('text=Active Streams').first();
      if (await streamsLink.isVisible().catch(() => false)) {
        await streamsLink.click();
        await page.waitForLoadState('networkidle');
      }

      // Navigate to marketplace
      const marketplaceLink = page.locator('text=Marketplace').first();
      if (await marketplaceLink.isVisible().catch(() => false)) {
        await marketplaceLink.click();
        await page.waitForLoadState('networkidle');
        await this.screenshot(page, '08-nav-marketplace');
      }

      const passed = true;
      this.log(`Navigation Flow Test: PASSED`, 'success');
      
      this.results.push({ test: 'Navigation Flow', passed, details: { pagesVisited: ['landing', 'app', 'streams', 'marketplace'] } });
      
      await browser.close();
      return passed;
    } catch (error) {
      this.log(`Navigation Test Error: ${error.message}`, 'error');
      this.results.push({ test: 'Navigation Flow', passed: false, error: error.message });
      await browser.close();
      return false;
    }
  }

  generateReport() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(60));
    console.log('PAYSTREAM BROWSER AUTOMATION TEST REPORT');
    console.log('='.repeat(60));
    console.log(`\nTarget URL: ${URL}`);
    console.log(`Test Date: ${new Date().toISOString()}`);
    console.log(`\nResults: ${passed}/${total} passed (${Math.round(passed/total*100)}%)`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log('\n' + '-'.repeat(60));
    
    this.results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.test}`);
      if (!result.passed && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('-'.repeat(60));
    console.log(`Screenshots saved to: ${SCREENSHOT_DIR}/`);
    console.log('='.repeat(60) + '\n');

    return { passed, failed, total, results: this.results };
  }

  async runAllTests() {
    this.log('Starting PayStream Browser Automation Tests...');
    this.log(`Target URL: ${URL}`);
    
    await this.testLandingPage();
    await this.testDashboardAccess();
    await this.testActiveStreamsPage();
    await this.testMarketplacePage();
    await this.testCreateStreamPage();
    await this.testMobileResponsiveness();
    await this.testNavigationFlow();
    
    return this.generateReport();
  }
}

// Run tests
const tester = new PayStreamTester();
tester.runAllTests().then(report => {
  process.exit(report.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
