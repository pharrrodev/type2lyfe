import { test, expect } from '@playwright/test';

test.describe('Authentication Debug', () => {
  test('Debug authentication token and login status', async ({ page }) => {
    console.log('🔍 Debugging authentication...');

    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(`📝 BROWSER LOG:`, msg.text());
      } else if (msg.type() === 'error') {
        console.log(`❌ BROWSER ERROR:`, msg.text());
      }
    });

    // Navigate to the app
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Check authentication status
    const authStatus = await page.evaluate(() => {
      const token = localStorage.getItem('token');
      return {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : null
      };
    });
    
    console.log('Authentication status:', authStatus);
    
    // Check if login form is visible
    const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
    console.log(`Login form visible: ${hasLoginForm}`);
    
    if (hasLoginForm) {
      console.log('🔑 User not logged in, attempting login...');
      
      // Attempt login
      await page.fill('input[type="email"]', 'frontend@test.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // Check if login was successful
      const afterLoginStatus = await page.evaluate(() => {
        const token = localStorage.getItem('token');
        return {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          tokenPreview: token ? token.substring(0, 20) + '...' : null
        };
      });
      
      console.log('After login status:', afterLoginStatus);
      
      // Check if we're now on the main app
      const isOnMainApp = await page.locator('text=Dashboard').count() > 0;
      console.log(`Successfully logged in: ${isOnMainApp}`);
      
      if (isOnMainApp) {
        // Test a simple API call
        console.log('🧪 Testing API call with new token...');
        
        const apiTestResult = await page.evaluate(async () => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/logs/glucose', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            return {
              success: response.ok,
              status: response.status,
              statusText: response.statusText
            };
          } catch (error) {
            return {
              success: false,
              error: error.message
            };
          }
        });
        
        console.log('API test result:', apiTestResult);
        
        if (apiTestResult.success) {
          console.log('✅ Authentication working correctly!');
        } else {
          console.log('❌ API call still failing after fresh login');
          
          if (apiTestResult.status === 401) {
            console.log('🔍 Token might be invalid or backend auth middleware has issues');
          }
        }
      } else {
        console.log('❌ Login failed - still on login page');
      }
    } else {
      console.log('🔍 User appears to be logged in, testing API call...');
      
      const apiTestResult = await page.evaluate(async () => {
        try {
          const token = localStorage.getItem('token');
          console.log('Testing with token:', token ? 'exists' : 'missing');
          
          const response = await fetch('http://localhost:3000/api/logs/glucose', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            return {
              success: true,
              status: response.status,
              dataLength: data.length
            };
          } else {
            const errorText = await response.text();
            return {
              success: false,
              status: response.status,
              error: errorText
            };
          }
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });
      
      console.log('API test result:', apiTestResult);
      
      if (!apiTestResult.success && apiTestResult.status === 401) {
        console.log('🔧 Token appears to be expired or invalid, need to re-login');
        
        // Force logout and re-login
        await page.evaluate(() => {
          localStorage.removeItem('token');
          window.location.reload();
        });
        
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle');
        
        // Try login again
        const hasLoginFormAfterClear = await page.locator('input[type="email"]').count() > 0;
        if (hasLoginFormAfterClear) {
          console.log('🔑 Attempting fresh login...');
          await page.fill('input[type="email"]', 'frontend@test.com');
          await page.fill('input[type="password"]', 'password123');
          await page.click('button[type="submit"]');
          await page.waitForTimeout(3000);
          
          // Test API again
          const finalApiTest = await page.evaluate(async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch('http://localhost:3000/api/logs/glucose', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              return {
                success: response.ok,
                status: response.status
              };
            } catch (error) {
              return {
                success: false,
                error: error.message
              };
            }
          });
          
          console.log('Final API test result:', finalApiTest);
          
          if (finalApiTest.success) {
            console.log('✅ Fresh login successful! Authentication fixed.');
          } else {
            console.log('❌ Still getting auth errors - backend issue');
          }
        }
      }
    }
    
    await page.screenshot({ path: 'auth-debug.png', fullPage: true });
  });
});
