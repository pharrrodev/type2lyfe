import { test, expect } from '@playwright/test';

test.describe('Activity State Debug', () => {
  test('Debug Recent Activity state and data flow', async ({ page }) => {
    console.log('🔍 Debugging Recent Activity state...');

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

    // Go to Activity page
    await page.click('text=Activity');
    await page.waitForTimeout(2000);
    
    // Check current state
    const activityEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`Current activity entries: ${activityEntries}`);
    
    // Get the text content of all entries
    const entries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').all();
    for (let i = 0; i < entries.length; i++) {
      const entryText = await entries[i].textContent();
      console.log(`Entry ${i + 1}: ${entryText.substring(0, 100)}...`);
    }

    // Debug the React state by injecting code
    const stateInfo = await page.evaluate(() => {
      // Try to access React state through various methods
      const mainContainer = document.querySelector('div.h-full.flex.flex-col.bg-slate-50');
      
      // Check if we can find React fiber
      let reactInfo = 'No React fiber found';
      if (mainContainer) {
        const keys = Object.keys(mainContainer);
        const reactKey = keys.find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
        if (reactKey) {
          reactInfo = 'React fiber found';
        }
      }
      
      // Check for any global state or debug info
      const globalInfo = {
        reactDevTools: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined',
        reactVersion: window.React ? window.React.version : 'Not found',
        windowKeys: Object.keys(window).filter(k => k.includes('react') || k.includes('React')).slice(0, 5)
      };
      
      return {
        reactInfo,
        globalInfo,
        mainContainerFound: !!mainContainer
      };
    });
    
    console.log('React state info:', JSON.stringify(stateInfo, null, 2));

    // Test adding a glucose reading programmatically through the API
    console.log('🧪 Testing direct API call to add glucose reading...');
    
    const apiResponse = await page.evaluate(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/logs/glucose', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            value: 155,
            unit: 'mmol/L',
            context: 'before_meal',
            timestamp: new Date().toISOString(),
            source: 'manual'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API call successful:', data);
          return { success: true, data };
        } else {
          console.log('❌ API call failed:', response.status, response.statusText);
          return { success: false, status: response.status };
        }
      } catch (error) {
        console.log('❌ API call error:', error.message);
        return { success: false, error: error.message };
      }
    });
    
    console.log('API Response:', JSON.stringify(apiResponse, null, 2));
    
    // Wait a moment for potential state updates
    await page.waitForTimeout(3000);
    
    // Check if the activity page updated
    const newActivityEntries = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`Activity entries after API call: ${newActivityEntries}`);
    
    // Check if we can see the new glucose value
    const glucoseValue155 = await page.locator('text=155').count();
    console.log(`Glucose value 155 found: ${glucoseValue155 > 0}`);
    
    // Refresh the page to see if data persists
    console.log('🔄 Refreshing page to check data persistence...');
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
    
    // Go to Activity page again
    await page.click('text=Activity');
    await page.waitForTimeout(2000);
    
    const entriesAfterRefresh = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`Activity entries after refresh: ${entriesAfterRefresh}`);
    
    const glucoseValue155AfterRefresh = await page.locator('text=155').count();
    console.log(`Glucose value 155 found after refresh: ${glucoseValue155AfterRefresh > 0}`);
    
    // Take screenshot
    await page.screenshot({ path: 'activity-state-debug.png', fullPage: true });
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`Initial entries: ${activityEntries}`);
    console.log(`Entries after API call: ${newActivityEntries}`);
    console.log(`Entries after refresh: ${entriesAfterRefresh}`);
    console.log(`API call successful: ${apiResponse.success}`);
    console.log(`New value visible immediately: ${glucoseValue155 > 0}`);
    console.log(`New value visible after refresh: ${glucoseValue155AfterRefresh > 0}`);
    
    if (apiResponse.success && glucoseValue155AfterRefresh > 0) {
      console.log('✅ Data is being saved and retrieved correctly');
      if (glucoseValue155 === 0) {
        console.log('❌ ISSUE: Data not updating in real-time UI');
        console.log('🔍 Problem: State management not updating after API calls');
      }
    } else if (apiResponse.success && glucoseValue155AfterRefresh === 0) {
      console.log('❌ ISSUE: Data not being saved to database');
    } else {
      console.log('❌ ISSUE: API call failing');
    }
  });
});
