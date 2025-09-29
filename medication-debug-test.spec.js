import { test, expect } from '@playwright/test';

test.describe('Medication Debug Test', () => {
  test('Debug medication logging with detailed console output', async ({ page }) => {
    console.log('🔍 Debugging medication logging with detailed output...');

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
      // Open medication modal
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
          
          // Check current state
          const medicationValue = await page.locator('select').inputValue();
          const quantityValue = await page.locator('input[type="number"]').inputValue();
          console.log(`Current medication: "${medicationValue}"`);
          console.log(`Current quantity: "${quantityValue}"`);
          
          // Get all medication options
          const options = await page.locator('select option').allTextContents();
          console.log(`Available medications: ${JSON.stringify(options)}`);
          
          // Try to change quantity to 3
          await page.click('input[type="number"]');
          await page.keyboard.press('Control+a');
          await page.type('input[type="number"]', '3');
          await page.waitForTimeout(500);
          
          const newQuantityValue = await page.locator('input[type="number"]').inputValue();
          console.log(`New quantity value: "${newQuantityValue}"`);
          
          // Check for any error messages
          const errorVisible = await page.locator('text=Please select a valid medication and quantity').isVisible();
          console.log(`Error message visible: ${errorVisible}`);
          
          if (errorVisible) {
            console.log('❌ Error message is showing - investigating...');
            
            // Try selecting a different medication
            if (options.length > 1) {
              await page.selectOption('select', { index: 0 });
              await page.waitForTimeout(500);
              
              const errorStillVisible = await page.locator('text=Please select a valid medication and quantity').isVisible();
              console.log(`Error still visible after selecting medication: ${errorStillVisible}`);
            }
          }
          
          // Try submitting
          console.log('💾 Attempting to submit medication log...');
          await page.click('button:has-text("Save Log")');
          await page.waitForTimeout(2000);
          
          // Check if modal closed or if there are still errors
          const modalStillOpen = await page.locator('text=Log Medication').isVisible();
          console.log(`Modal still open after submit: ${modalStillOpen}`);
          
          if (modalStillOpen) {
            // Check for error messages
            const finalError = await page.locator('.text-red-500').textContent();
            if (finalError) {
              console.log(`Final error message: "${finalError}"`);
            }
          } else {
            console.log('✅ Modal closed - medication logged successfully!');
          }
        }
      }
    }
    
    await page.screenshot({ path: 'medication-debug.png', fullPage: true });
  });
});
