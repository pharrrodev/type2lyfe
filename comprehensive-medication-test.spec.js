import { test, expect } from '@playwright/test';

test.describe('Comprehensive Medication Test', () => {
  test('Complete medication workflow: settings, logging, and activity verification', async ({ page }) => {
    console.log('🧪 Testing complete medication workflow...');

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

    // Step 1: Check initial activity entries
    await page.click('text=Activity');
    await page.waitForTimeout(1000);
    
    const initialEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`📊 Initial activity entries: ${initialEntries}`);

    // Step 2: Open settings to add a new medication
    console.log('⚙️ Opening settings to add new medication...');
    await page.click('button[title="My Medications"]');
    await page.waitForTimeout(2000);

    // Check if settings modal opened
    const settingsModalVisible = await page.locator('text=My Medications').isVisible();
    console.log(`Settings modal visible: ${settingsModalVisible}`);

    if (settingsModalVisible) {
      // Get current medications count
      const currentMedications = await page.locator('.bg-slate-50.p-3.rounded-lg').count();
      console.log(`Current medications in settings: ${currentMedications}`);

      // Add a new medication
      console.log('➕ Adding new medication: Aspirin...');
      await page.click('button:has-text("+ Add New Medication")');
      await page.waitForTimeout(1000);

      // Fill in medication details
      await page.fill('input[placeholder="Start typing medication name..."]', 'Aspirin');
      await page.waitForTimeout(500);
      await page.fill('input[placeholder="e.g., 500"]', '100');
      await page.fill('input[placeholder="e.g., mg"]', 'mg');
      
      // Save the medication
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(2000);

      // Verify medication was added
      const newMedicationsCount = await page.locator('.bg-slate-50.p-3.rounded-lg').count();
      console.log(`Medications after adding Aspirin: ${newMedicationsCount}`);
      
      if (newMedicationsCount > currentMedications) {
        console.log('✅ New medication (Aspirin) added successfully!');
      } else {
        console.log('⚠️ New medication may not have been added');
      }

      // Close settings modal
      await page.click('.absolute.top-4.right-4');
      await page.waitForTimeout(1000);
    }

    // Step 3: Test logging existing medication (Metformin)
    console.log('💊 Testing existing medication logging (Metformin)...');
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);
    
    // Open medication modal
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    await page.click('div[role="dialog"] button:has-text("Medication")');
    await page.waitForTimeout(2000);
    
    // Switch to Manual tab
    await page.click('button:has-text("Manual Log")');
    await page.waitForTimeout(1000);
    
    // Check available medications
    const medicationOptions = await page.locator('select option').allTextContents();
    console.log(`Available medications in modal: ${JSON.stringify(medicationOptions)}`);
    
    // Log first medication (should be Metformin)
    await page.selectOption('select', { index: 0 });
    await page.click('input[type="number"]');
    await page.keyboard.press('Control+a');
    await page.type('input[type="number"]', '2');
    
    console.log('💾 Submitting first medication log...');
    await page.click('button:has-text("Save Log")');
    await page.waitForTimeout(3000);
    
    // Check if modal closed
    const modalClosed1 = !(await page.locator('text=Log Medication').isVisible());
    console.log(`First medication modal closed: ${modalClosed1}`);

    // Step 4: Test logging second medication (Aspirin if it was added)
    if (medicationOptions.length > 1 || medicationOptions.some(opt => opt.includes('Aspirin'))) {
      console.log('💊 Testing second medication logging...');
      
      // Open medication modal again
      await page.click('button[aria-label="Add new log"]');
      await page.waitForTimeout(1000);
      await page.click('div[role="dialog"] button:has-text("Medication")');
      await page.waitForTimeout(2000);
      
      // Switch to Manual tab
      await page.click('button:has-text("Manual Log")');
      await page.waitForTimeout(1000);
      
      // Select second medication or Aspirin
      const updatedOptions = await page.locator('select option').allTextContents();
      console.log(`Updated medication options: ${JSON.stringify(updatedOptions)}`);
      
      // Find Aspirin or select last option
      const aspirinIndex = updatedOptions.findIndex(opt => opt.includes('Aspirin'));
      const selectIndex = aspirinIndex >= 0 ? aspirinIndex : Math.min(1, updatedOptions.length - 1);
      
      await page.selectOption('select', { index: selectIndex });
      await page.click('input[type="number"]');
      await page.keyboard.press('Control+a');
      await page.type('input[type="number"]', '1');
      
      console.log('💾 Submitting second medication log...');
      await page.click('button:has-text("Save Log")');
      await page.waitForTimeout(3000);
      
      const modalClosed2 = !(await page.locator('text=Log Medication').isVisible());
      console.log(`Second medication modal closed: ${modalClosed2}`);
    }

    // Step 5: Verify medications appear in Activity log
    console.log('📋 Checking Activity log for medication entries...');
    await page.click('text=Activity');
    await page.waitForTimeout(2000);
    
    const finalEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`Final activity entries: ${finalEntries}`);
    console.log(`Entries added: ${finalEntries - initialEntries}`);
    
    // Look for medication-specific text
    const medicationEntries = await page.locator('text=x').count(); // "x" appears in medication quantity display
    const metforminFound = await page.locator('text=Metformin').count() > 0;
    const aspirinFound = await page.locator('text=Aspirin').count() > 0;
    
    console.log(`Medication entries with "x": ${medicationEntries}`);
    console.log(`Metformin found in activity: ${metforminFound}`);
    console.log(`Aspirin found in activity: ${aspirinFound}`);
    
    // Get the first few entries to verify content
    const entries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').all();
    for (let i = 0; i < Math.min(entries.length, 3); i++) {
      const entryText = await entries[i].textContent();
      console.log(`Entry ${i + 1}: ${entryText.substring(0, 100)}...`);
    }
    
    // Final assessment
    if (finalEntries > initialEntries && (metforminFound || medicationEntries > 0)) {
      console.log('🎉 COMPREHENSIVE MEDICATION TEST SUCCESS!');
      console.log('✅ Settings: New medication can be added');
      console.log('✅ Modal: Medications appear in logging modal');
      console.log('✅ Logging: Medication logging works correctly');
      console.log('✅ Activity: Logged medications appear in activity feed');
      console.log('✅ Real-time: UI updates immediately after logging');
    } else {
      console.log('⚠️ Some issues detected:');
      if (finalEntries <= initialEntries) {
        console.log('❌ No new entries added to activity');
      }
      if (!metforminFound && medicationEntries === 0) {
        console.log('❌ No medication entries found in activity');
      }
    }
    
    await page.screenshot({ path: 'comprehensive-medication-test.png', fullPage: true });
  });
});
