import { test, expect } from '@playwright/test';

test.describe('Complete Glucose Test', () => {
  test('Test complete glucose logging flow with manual entry', async ({ page }) => {
    console.log('🧪 Testing complete glucose logging flow...');

    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(`📝 BROWSER LOG:`, msg.text());
      } else if (msg.type() === 'error') {
        console.log(`❌ BROWSER ERROR:`, msg.text());
      }
    });

    // Navigate and login
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
    if (hasLoginForm) {
      await page.fill('input[type="email"]', 'frontend@test.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    // Go to Activity page and check initial state
    await page.click('text=Activity');
    await page.waitForTimeout(1000);
    
    const initialEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`Initial activity entries: ${initialEntries}`);

    // Go to Dashboard
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);

    // Click plus button
    console.log('➕ Clicking plus button...');
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    
    // Verify action sheet is open
    const actionSheetOpen = await page.locator('text=What would you like to log?').isVisible();
    console.log(`Action sheet open: ${actionSheetOpen}`);
    
    if (actionSheetOpen) {
      // Click Glucose button
      console.log('🩸 Clicking Glucose button...');
      await page.click('div[role="dialog"] button:has-text("Glucose")');
      await page.waitForTimeout(2000); // Wait for modal transition
      
      // Check if glucose modal is visible
      const glucoseModalVisible = await page.locator('text=Log Glucose').isVisible();
      console.log(`Glucose modal visible: ${glucoseModalVisible}`);
      
      if (glucoseModalVisible) {
        // Check which tab is active
        const voiceTabActive = await page.locator('button:has-text("Voice")').getAttribute('class');
        const manualTabActive = await page.locator('button:has-text("Manual")').getAttribute('class');
        console.log(`Voice tab active: ${voiceTabActive.includes('border-blue-600')}`);
        console.log(`Manual tab active: ${manualTabActive.includes('border-blue-600')}`);
        
        // Switch to Manual tab
        console.log('📝 Switching to Manual tab...');
        await page.click('button:has-text("Manual")');
        await page.waitForTimeout(1000);
        
        // Check if number input is now visible
        const numberInputVisible = await page.locator('input[type="number"]').isVisible();
        console.log(`Number input visible after switching to Manual: ${numberInputVisible}`);
        
        if (numberInputVisible) {
          // Fill glucose value
          const testValue = '188';
          console.log(`Filling glucose value: ${testValue}`);
          await page.fill('input[type="number"]', testValue);
          
          // Select context
          await page.selectOption('select', 'after_meal');
          
          // Take screenshot before saving
          await page.screenshot({ path: 'glucose-manual-filled.png', fullPage: true });
          
          // Submit the form
          console.log('💾 Submitting glucose reading...');
          await page.click('button:has-text("Save Log")');
          await page.waitForTimeout(3000); // Wait for API call and state update
          
          // Check if modal closed
          const modalStillOpen = await page.locator('text=Log Glucose').isVisible();
          console.log(`Modal still open: ${modalStillOpen}`);
          
          // Go to Activity page to check if entry appears
          console.log('📋 Checking Activity page...');
          await page.click('text=Activity');
          await page.waitForTimeout(2000);
          
          const finalEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
          console.log(`Final activity entries: ${finalEntries}`);
          
          // Check for the specific value
          const testValueFound = await page.locator(`text=${testValue}`).count();
          console.log(`Test value "${testValue}" found: ${testValueFound > 0}`);
          
          // Take final screenshot
          await page.screenshot({ path: 'complete-glucose-test-final.png', fullPage: true });
          
          // Results
          console.log('\n📊 COMPLETE GLUCOSE TEST RESULTS:');
          console.log(`Initial entries: ${initialEntries}`);
          console.log(`Final entries: ${finalEntries}`);
          console.log(`Entry count increased: ${finalEntries > initialEntries}`);
          console.log(`Test value visible: ${testValueFound > 0}`);
          console.log(`Modal closed after submit: ${!modalStillOpen}`);
          
          if (finalEntries > initialEntries && testValueFound > 0 && !modalStillOpen) {
            console.log('✅ COMPLETE SUCCESS: Glucose logging working perfectly!');
            console.log('✅ Real-time UI updates working!');
            console.log('✅ Recent Activity displaying new entries immediately!');
          } else if (testValueFound > 0) {
            console.log('⚠️ PARTIAL SUCCESS: Value found but some issues remain');
            if (finalEntries <= initialEntries) {
              console.log('❌ Entry count did not increase (pagination or state issue)');
            }
            if (modalStillOpen) {
              console.log('❌ Modal did not close after submit');
            }
          } else {
            console.log('❌ FAILURE: Glucose reading not appearing in Recent Activity');
          }
          
          // Test data persistence by refreshing
          console.log('\n🔄 Testing data persistence...');
          await page.reload();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          // Login again if needed
          const hasLoginFormAfterRefresh = await page.locator('input[type="email"]').count() > 0;
          if (hasLoginFormAfterRefresh) {
            await page.fill('input[type="email"]', 'frontend@test.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
          }
          
          // Go to Activity page
          await page.click('text=Activity');
          await page.waitForTimeout(2000);
          
          const entriesAfterRefresh = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
          const testValueAfterRefresh = await page.locator(`text=${testValue}`).count();
          
          console.log(`Entries after refresh: ${entriesAfterRefresh}`);
          console.log(`Test value found after refresh: ${testValueAfterRefresh > 0}`);
          
          if (testValueAfterRefresh > 0) {
            console.log('✅ DATA PERSISTENCE: Working correctly');
          } else {
            console.log('❌ DATA PERSISTENCE: Failed');
          }
          
        } else {
          console.log('❌ Number input not visible even after switching to Manual tab');
        }
      } else {
        console.log('❌ Glucose modal did not open');
      }
    } else {
      console.log('❌ Action sheet did not open');
    }
  });
});
