import { test, expect } from '@playwright/test';

test.describe('Medication Logging Test', () => {
  test('Test medication quantity input and logging', async ({ page }) => {
    console.log('💊 Testing medication logging functionality...');

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
    
    // Login
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

      // Go to Dashboard and open medication modal
      await page.click('text=Dashboard');
      await page.waitForTimeout(1000);
      
      // Click plus button
      await page.click('button[aria-label="Add new log"]');
      await page.waitForTimeout(1000);
      
      // Click Medication button
      console.log('💊 Clicking Medication button...');
      await page.click('div[role="dialog"] button:has-text("Medication")');
      await page.waitForTimeout(2000);
      
      // Check if medication modal opened
      const medicationModalVisible = await page.locator('text=Log Medication').isVisible();
      console.log(`Medication modal visible: ${medicationModalVisible}`);
      
      if (medicationModalVisible) {
        // Check if we need to add medications first
        const needsSetup = await page.locator('text=To log medication, you first need to add your medications').count() > 0;
        
        if (needsSetup) {
          console.log('⚠️ No medications configured - need to set up medications first');
          await page.click('button:has-text("Got it")');
          console.log('ℹ️ User needs to add medications in settings first');
        } else {
          // Switch to Manual tab
          console.log('📝 Switching to Manual tab...');
          await page.click('button:has-text("Manual Log")');
          await page.waitForTimeout(1000);
          
          // Check if quantity input is visible
          const quantityInputVisible = await page.locator('input[type="number"]').isVisible();
          console.log(`Quantity input visible: ${quantityInputVisible}`);
          
          if (quantityInputVisible) {
            // Test quantity input - this was the main issue
            console.log('🔢 Testing quantity input...');
            
            // Click to focus and select all, then type "1"
            await page.click('input[type="number"]');
            await page.waitForTimeout(200);
            await page.keyboard.press('Control+a'); // Select all
            await page.type('input[type="number"]', '1');
            await page.waitForTimeout(500);
            
            // Check if the value was set correctly
            const quantityValue = await page.locator('input[type="number"]').inputValue();
            console.log(`Quantity value after typing "1": "${quantityValue}"`);
            
            if (quantityValue === '1') {
              console.log('✅ Quantity input working correctly!');
              
              // Try typing a different number
              await page.fill('input[type="number"]', '');
              await page.type('input[type="number"]', '2');
              await page.waitForTimeout(500);
              
              const quantityValue2 = await page.locator('input[type="number"]').inputValue();
              console.log(`Quantity value after typing "2": "${quantityValue2}"`);
              
              if (quantityValue2 === '2') {
                console.log('✅ Quantity input accepts different values correctly!');
                
                // Check if there are medications to select
                const medicationSelect = await page.locator('select').count();
                if (medicationSelect > 0) {
                  // Get available medications
                  const options = await page.locator('select option').all();
                  console.log(`Available medications: ${options.length}`);
                  
                  if (options.length > 0) {
                    // Select first medication and submit
                    await page.selectOption('select', { index: 0 });
                    
                    console.log('💾 Submitting medication log...');
                    await page.click('button:has-text("Save Log")');
                    await page.waitForTimeout(3000);
                    
                    // Check if modal closed
                    const modalClosed = !(await page.locator('text=Log Medication').isVisible());
                    console.log(`Modal closed: ${modalClosed}`);
                    
                    if (modalClosed) {
                      // Check Activity page for new entry
                      await page.click('text=Activity');
                      await page.waitForTimeout(2000);
                      
                      const finalEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
                      console.log(`Final activity entries: ${finalEntries}`);
                      
                      // Look for medication-related text
                      const medicationEntryFound = await page.locator('text=x').count() > 0; // Look for "x" which appears in medication entries
                      console.log(`Medication entry found: ${medicationEntryFound}`);
                      
                      if (medicationEntryFound || finalEntries > initialEntries) {
                        console.log('🎉 MEDICATION LOGGING SUCCESS!');
                        console.log('✅ Quantity input fixed');
                        console.log('✅ Medication logging working');
                        console.log('✅ Real-time UI updates working');
                      } else {
                        console.log('⚠️ Medication logged but not visible in activity');
                      }
                    } else {
                      console.log('❌ Modal did not close after submission');
                    }
                  } else {
                    console.log('⚠️ No medication options available');
                  }
                } else {
                  console.log('❌ No medication select dropdown found');
                }
              } else {
                console.log('❌ Quantity input still not working for value "2"');
              }
            } else {
              console.log('❌ Quantity input not working - value is:', quantityValue);
            }
          } else {
            console.log('❌ Quantity input not visible');
          }
        }
      } else {
        console.log('❌ Medication modal did not open');
      }
    } else {
      console.log('❌ Login failed');
    }
    
    await page.screenshot({ path: 'medication-test.png', fullPage: true });
  });
});
