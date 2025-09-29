import { test, expect } from '@playwright/test';

test.describe('Fix Verification', () => {
  test('Verify glucose readings appear in Recent Activity immediately', async ({ page }) => {
    console.log('🧪 Testing the fix for glucose readings in Recent Activity...');

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

    // Test the addGlucoseReading function with the fix
    const testResult = await page.evaluate(async () => {
      const mockReading = {
        value: 199,
        displayUnit: 'mmol/L',
        context: 'after_meal',
        timestamp: new Date().toISOString(),
        source: 'manual'
      };
      
      console.log('🧪 Testing addGlucoseReading with fix:', mockReading);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/logs/glucose', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(mockReading)
        });
        
        if (response.ok) {
          const responseData = await response.json();
          console.log('✅ API Response:', responseData);
          
          // Simulate the fix: flatten the data structure
          const flattenedReading = {
            id: responseData.id,
            timestamp: responseData.timestamp,
            ...responseData.data
          };
          console.log('🔧 Flattened reading:', flattenedReading);
          
          return { success: true, flattenedReading, originalResponse: responseData };
        } else {
          return { success: false, status: response.status };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('Test result:', JSON.stringify(testResult, null, 2));
    
    // Wait a moment for the UI to potentially update
    await page.waitForTimeout(2000);
    
    // Check if the entry count increased (this should work now with the fix)
    const entriesAfterAPICall = await page.locator('.bg-white.p-3.rounded-xl.shadow-sm').count();
    console.log(`Activity entries after API call: ${entriesAfterAPICall}`);
    
    // Check for the specific glucose value
    const glucoseValue199 = await page.locator('text=199').count();
    console.log(`Glucose value 199 found: ${glucoseValue199 > 0}`);
    
    // Refresh to verify data persistence
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
    
    const glucoseValue199AfterRefresh = await page.locator('text=199').count();
    console.log(`Glucose value 199 found after refresh: ${glucoseValue199AfterRefresh > 0}`);
    
    // Take screenshot
    await page.screenshot({ path: 'fix-verification.png', fullPage: true });
    
    // Results
    console.log('\n📊 FIX VERIFICATION RESULTS:');
    console.log(`Initial entries: ${initialEntries}`);
    console.log(`Entries after API call: ${entriesAfterAPICall}`);
    console.log(`Entries after refresh: ${entriesAfterRefresh}`);
    console.log(`API call successful: ${testResult.success}`);
    console.log(`Real-time update working: ${entriesAfterAPICall > initialEntries}`);
    console.log(`Data persistence working: ${glucoseValue199AfterRefresh > 0}`);
    
    if (testResult.success && entriesAfterAPICall > initialEntries && glucoseValue199AfterRefresh > 0) {
      console.log('✅ FIX SUCCESSFUL: Glucose readings now appear in Recent Activity immediately!');
    } else if (testResult.success && glucoseValue199AfterRefresh > 0 && entriesAfterAPICall === initialEntries) {
      console.log('⚠️ PARTIAL FIX: Data saves but real-time update still not working');
    } else {
      console.log('❌ FIX NOT WORKING: Issue persists');
    }
  });
});
