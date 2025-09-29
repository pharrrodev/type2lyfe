import { test, expect } from '@playwright/test';

test.describe('UI Flow Test', () => {
  test('Test actual UI glucose logging flow', async ({ page }) => {
    console.log('🧪 Testing actual UI glucose logging flow...');

    // Listen for console messages to see if addGlucoseReading is called
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

    // Go to Dashboard to start fresh
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);

    // Click the plus button
    console.log('➕ Clicking plus button...');
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    
    // Take screenshot of modal
    await page.screenshot({ path: 'modal-opened.png', fullPage: true });
    
    // Wait for modal to be visible
    await page.waitForSelector('text=What would you like to log?', { state: 'visible' });
    console.log('✅ Modal opened');
    
    // Look for all glucose-related buttons/text
    const allGlucoseElements = await page.locator('text=Glucose').all();
    console.log(`Found ${allGlucoseElements.length} elements with "Glucose" text`);
    
    // Try to find the correct Glucose button in the modal
    const modalGlucoseButton = page.locator('div[role="dialog"] button').filter({ hasText: 'Glucose' });
    const modalGlucoseCount = await modalGlucoseButton.count();
    console.log(`Found ${modalGlucoseCount} Glucose buttons in modal`);
    
    if (modalGlucoseCount > 0) {
      console.log('🩸 Clicking Glucose button in modal...');
      await modalGlucoseButton.first().click();
      await page.waitForTimeout(2000);
      
      // Check if glucose modal opened
      const glucoseModalVisible = await page.locator('input[type="number"]').count() > 0;
      console.log(`Glucose modal opened: ${glucoseModalVisible}`);
      
      if (glucoseModalVisible) {
        // Fill glucose value
        const testValue = '177';
        console.log(`Filling glucose value: ${testValue}`);
        await page.fill('input[type="number"]', testValue);
        
        // Take screenshot before saving
        await page.screenshot({ path: 'glucose-modal-filled.png', fullPage: true });
        
        // Click Save button
        const saveButtons = await page.locator('button:has-text("Save"), button:has-text("Add"), button:has-text("Submit")').all();
        console.log(`Found ${saveButtons.length} save buttons`);
        
        if (saveButtons.length > 0) {
          console.log('💾 Clicking Save button...');
          await saveButtons[0].click();
          await page.waitForTimeout(3000); // Wait for API call and state update
          
          // Check if modal closed
          const modalStillOpen = await page.locator('text=What would you like to log?').count() > 0;
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
          await page.screenshot({ path: 'final-activity-page.png', fullPage: true });
          
          // Results
          console.log('\n📊 UI FLOW TEST RESULTS:');
          console.log(`Initial entries: ${initialEntries}`);
          console.log(`Final entries: ${finalEntries}`);
          console.log(`Entry count increased: ${finalEntries > initialEntries}`);
          console.log(`Test value visible: ${testValueFound > 0}`);
          
          if (finalEntries > initialEntries && testValueFound > 0) {
            console.log('✅ UI FLOW WORKING: Glucose readings appear immediately in Recent Activity!');
          } else if (testValueFound > 0) {
            console.log('⚠️ PARTIAL SUCCESS: Value found but entry count didn\'t increase (might be pagination)');
          } else {
            console.log('❌ UI FLOW NOT WORKING: Glucose reading not appearing in Recent Activity');
          }
        } else {
          console.log('❌ No save button found');
        }
      } else {
        console.log('❌ Glucose modal did not open');
      }
    } else {
      console.log('❌ No Glucose button found in modal');
      
      // Debug: show what buttons are available
      const allButtons = await page.locator('div[role="dialog"] button').all();
      console.log(`Available buttons in modal: ${allButtons.length}`);
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`Button ${i + 1}: "${buttonText}"`);
      }
    }
  });
});
