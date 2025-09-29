import { test, expect } from '@playwright/test';

test.describe('Glucose to Recent Activity Debug', () => {
  test('Debug glucose logging to Recent Activity flow', async ({ page }) => {
    console.log('🔍 Debugging glucose logging to Recent Activity...');

    // Listen for console messages to track data flow
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

    // First, check initial state of Recent Activity
    console.log('📊 Checking initial Recent Activity state...');
    await page.click('text=Activity');
    await page.waitForTimeout(1000);
    
    const initialEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`Initial activity entries: ${initialEntries}`);
    
    // Check if there's a "No recent activity" message
    const noActivityMsg = await page.locator('text=No recent activity').count();
    console.log(`"No recent activity" message visible: ${noActivityMsg > 0}`);

    // Add debug logging to track state
    await page.evaluate(() => {
      console.log('🔍 Adding debug hooks to track state changes...');
      
      // Hook into React state updates if possible
      window.debugGlucoseState = () => {
        const mainApp = document.querySelector('[data-testid="main-app"]') || document.querySelector('div.h-full.flex.flex-col.bg-slate-50');
        if (mainApp && mainApp._reactInternalFiber) {
          console.log('React fiber found, attempting to access state...');
        }
        return 'Debug hook installed';
      };
      
      console.log(window.debugGlucoseState());
    });

    // Now add a glucose reading
    console.log('🩸 Adding glucose reading...');
    
    // Go to dashboard first to ensure we're in a clean state
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);
    
    // Click the plus button
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    
    // Wait for modal to be fully visible and clickable
    await page.waitForSelector('text=What would you like to log?', { state: 'visible' });
    
    // Try clicking Glucose with more specific selector
    const glucoseButtons = await page.locator('text=Glucose').all();
    console.log(`Found ${glucoseButtons.length} Glucose buttons`);
    
    // Click the Glucose button in the modal (not the stats)
    await page.locator('div[role="dialog"] button:has-text("Glucose")').first().click();
    await page.waitForTimeout(1000);
    
    // Wait for glucose modal to open
    await page.waitForSelector('input[type="number"]', { state: 'visible' });
    
    // Fill glucose value
    const glucoseValue = '142';
    await page.fill('input[type="number"]', glucoseValue);
    console.log(`Filled glucose value: ${glucoseValue}`);
    
    // Click Save button
    await page.click('button:has-text("Save"), button:has-text("Add")');
    await page.waitForTimeout(3000); // Wait longer for API call and state update
    
    console.log('✅ Glucose reading submitted, checking Recent Activity...');
    
    // Navigate to Activity page
    await page.click('text=Activity');
    await page.waitForTimeout(2000);
    
    // Check if new entry appears
    const finalEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`Final activity entries: ${finalEntries}`);
    
    // Check for the specific glucose value in the activity
    const glucoseEntryText = await page.locator(`text=${glucoseValue}`).count();
    console.log(`Glucose value "${glucoseValue}" found in activity: ${glucoseEntryText > 0}`);
    
    // Check for glucose-related text
    const glucoseTypeText = await page.locator('text=Glucose, text=glucose').count();
    console.log(`Glucose type text found: ${glucoseTypeText > 0}`);
    
    // Get all text content from activity page for debugging
    const activityPageText = await page.locator('div.flex-grow.space-y-3').textContent();
    console.log('Activity page content:', activityPageText.substring(0, 200));
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'glucose-activity-debug.png', fullPage: true });
    
    // Check if the entry count increased
    const entryIncreased = finalEntries > initialEntries;
    console.log(`Entry count increased: ${entryIncreased} (${initialEntries} -> ${finalEntries})`);
    
    // Final verification
    if (!entryIncreased && glucoseEntryText === 0) {
      console.log('❌ ISSUE FOUND: Glucose reading not appearing in Recent Activity');
      console.log('🔍 Possible causes:');
      console.log('  1. State not updating after API call');
      console.log('  2. combinedLogs not including new glucose reading');
      console.log('  3. ActivityPage not re-rendering with new data');
      console.log('  4. LogEntry component not rendering glucose entries correctly');
    } else {
      console.log('✅ Glucose reading successfully appears in Recent Activity');
    }
  });
});
