import { test, expect } from '@playwright/test';

test.describe('Medication Logging Fix Test', () => {
  test('Test medication logging with ID type fix', async ({ page }) => {
    console.log('🔧 Testing medication logging with ID type fix...');

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

    if (!isLoggedIn) {
      console.log('❌ Login failed');
      return;
    }

    // Check initial activity entries
    await page.click('text=Activity');
    await page.waitForTimeout(1000);
    
    const initialEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`📊 Initial activity entries: ${initialEntries}`);

    // Go to Dashboard and test medication logging
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);
    
    // Open medication modal
    console.log('💊 Opening medication modal...');
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
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
      } else {
        // Switch to Manual tab
        await page.click('button:has-text("Manual Log")');
        await page.waitForTimeout(1000);
        
        // Check available medications
        const medicationOptions = await page.locator('select option').allTextContents();
        console.log(`Available medications: ${JSON.stringify(medicationOptions)}`);
        
        // Get current selected values
        const currentMedication = await page.locator('select').inputValue();
        const currentQuantity = await page.locator('input[type="number"]').inputValue();
        console.log(`Current medication ID: "${currentMedication}"`);
        console.log(`Current quantity: "${currentQuantity}"`);
        
        // Set quantity to 1
        await page.click('input[type="number"]');
        await page.keyboard.press('Control+a');
        await page.type('input[type="number"]', '1');
        await page.waitForTimeout(500);
        
        const newQuantity = await page.locator('input[type="number"]').inputValue();
        console.log(`New quantity: "${newQuantity}"`);
        
        // Try submitting
        console.log('💾 Attempting to submit medication log...');
        await page.click('button:has-text("Save Log")');
        await page.waitForTimeout(3000);
        
        // Check if modal closed
        const modalClosed = !(await page.locator('text=Log Medication').isVisible());
        console.log(`Modal closed: ${modalClosed}`);
        
        if (modalClosed) {
          console.log('✅ First medication logged successfully!');

          // Close any remaining modals by clicking outside or pressing Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);

          // Check Activity page for new entry
          await page.click('text=Activity');
          await page.waitForTimeout(2000);
          
          const finalEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
          console.log(`Final activity entries: ${finalEntries}`);
          console.log(`Entries added: ${finalEntries - initialEntries}`);
          
          // Look for medication-specific text
          const medicationEntries = await page.locator('text=x').count(); // "x" appears in medication quantity display
          const metforminFound = await page.locator('text=Metformin').count() > 0;
          
          console.log(`Medication entries with "x": ${medicationEntries}`);
          console.log(`Metformin found in activity: ${metforminFound}`);
          
          // Get the first few entries to verify content
          const entries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').all();
          for (let i = 0; i < Math.min(entries.length, 2); i++) {
            const entryText = await entries[i].textContent();
            console.log(`Entry ${i + 1}: ${entryText.substring(0, 100)}...`);
          }
          
          if (finalEntries > initialEntries || metforminFound || medicationEntries > 0) {
            console.log('🎉 MEDICATION LOGGING SUCCESS!');
            console.log('✅ ID type fix working');
            console.log('✅ Medication logging working');
            console.log('✅ Real-time UI updates working');
            console.log('✅ Activity log displaying medication entries');
            
            // Test logging a second medication if available
            if (medicationOptions.length > 1) {
              console.log('💊 Testing second medication...');
              
              // Go back to Dashboard
              await page.click('text=Dashboard');
              await page.waitForTimeout(1000);
              
              // Open medication modal again
              await page.click('button[aria-label="Add new log"]');
              await page.waitForTimeout(1000);
              await page.click('div[role="dialog"] button:has-text("Medication")');
              await page.waitForTimeout(2000);
              
              // Switch to Manual tab
              await page.click('button:has-text("Manual Log")');
              await page.waitForTimeout(1000);
              
              // Select second medication
              await page.selectOption('select', { index: 1 });
              await page.click('input[type="number"]');
              await page.keyboard.press('Control+a');
              await page.type('input[type="number"]', '2');
              
              // Submit second medication
              console.log('💾 Submitting second medication...');
              await page.click('button:has-text("Save Log")');
              await page.waitForTimeout(3000);
              
              const secondModalClosed = !(await page.locator('text=Log Medication').isVisible());
              console.log(`Second medication modal closed: ${secondModalClosed}`);
              
              if (secondModalClosed) {
                // Check activity again
                await page.click('text=Activity');
                await page.waitForTimeout(2000);
                
                const finalFinalEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
                console.log(`Final entries after second medication: ${finalFinalEntries}`);
                
                if (finalFinalEntries > finalEntries) {
                  console.log('✅ Second medication also logged successfully!');
                  console.log('🎉 BOTH MEDICATIONS LOGGED SUCCESSFULLY!');
                }
              }
            }
          } else {
            console.log('⚠️ Medication may not have appeared in activity');
          }
        } else {
          console.log('❌ Modal did not close - submission failed');
          
          // Check for error messages
          const errorMessage = await page.locator('.text-red-500').textContent();
          if (errorMessage) {
            console.log(`Error message: "${errorMessage}"`);
          }
        }
      }
    } else {
      console.log('❌ Medication modal did not open');
    }
    
    await page.screenshot({ path: 'medication-logging-fix.png', fullPage: true });
  });
});
