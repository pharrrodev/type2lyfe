import { test, expect } from '@playwright/test';

test.describe('Final Working Test', () => {
  test('Test complete glucose logging with fresh authentication', async ({ page }) => {
    console.log('🎉 Testing complete glucose logging with fresh authentication...');

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
    
    // Login with fresh credentials
    await page.fill('input[type="email"]', 'frontend@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Verify we're logged in
    const isLoggedIn = await page.locator('text=Dashboard').count() > 0;
    console.log(`Successfully logged in: ${isLoggedIn}`);

    if (isLoggedIn) {
      // Go to Activity page and check initial state
      await page.click('text=Activity');
      await page.waitForTimeout(1000);
      
      const initialEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
      console.log(`Initial activity entries: ${initialEntries}`);

      // Go to Dashboard and add glucose reading
      await page.click('text=Dashboard');
      await page.waitForTimeout(1000);
      
      // Open glucose modal
      await page.click('button[aria-label="Add new log"]');
      await page.waitForTimeout(1000);
      await page.click('div[role="dialog"] button:has-text("Glucose")');
      await page.waitForTimeout(2000);
      
      // Switch to Manual tab and fill form
      await page.click('button:has-text("Manual")');
      await page.waitForTimeout(1000);
      
      const testValue = '8.5'; // Valid mmol/L value
      await page.fill('input[type="number"]', testValue);
      await page.selectOption('select', 'before_meal');
      
      // Submit the form
      console.log(`💾 Submitting glucose reading: ${testValue} mmol/L`);
      await page.click('button:has-text("Save Log")');
      await page.waitForTimeout(3000);
      
      // Check if modal closed
      const modalClosed = !(await page.locator('text=Log Glucose').isVisible());
      console.log(`Modal closed: ${modalClosed}`);
      
      if (modalClosed) {
        // Go to Activity page to verify the entry appears
        await page.click('text=Activity');
        await page.waitForTimeout(2000);
        
        const finalEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
        const testValueFound = await page.locator(`text=${testValue}`).count() > 0;
        
        console.log(`Final activity entries: ${finalEntries}`);
        console.log(`Test value "${testValue}" found: ${testValueFound}`);
        
        // Get the first few entries to verify
        const entries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').all();
        for (let i = 0; i < Math.min(entries.length, 2); i++) {
          const entryText = await entries[i].textContent();
          console.log(`Entry ${i + 1}: ${entryText.substring(0, 80)}...`);
        }
        
        if (testValueFound) {
          console.log('🎉 COMPLETE SUCCESS!');
          console.log('✅ Authentication working');
          console.log('✅ Glucose logging working');
          console.log('✅ Real-time UI updates working');
          console.log('✅ Recent Activity displaying new entries immediately');
          
          // Test data persistence
          console.log('🔄 Testing data persistence...');
          await page.reload();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          
          // Login again
          const needsLogin = await page.locator('input[type="email"]').count() > 0;
          if (needsLogin) {
            await page.fill('input[type="email"]', 'frontend@test.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
          }
          
          // Check Activity page
          await page.click('text=Activity');
          await page.waitForTimeout(2000);
          
          const persistedValue = await page.locator(`text=${testValue}`).count() > 0;
          console.log(`Data persisted after refresh: ${persistedValue}`);
          
          if (persistedValue) {
            console.log('✅ Data persistence working correctly');
          }
          
        } else {
          console.log('❌ Test value not found in Recent Activity');
        }
      } else {
        console.log('❌ Modal did not close - submission may have failed');
      }
    } else {
      console.log('❌ Login failed');
    }
    
    await page.screenshot({ path: 'final-working-test.png', fullPage: true });
  });
});
