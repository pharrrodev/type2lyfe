import { test, expect } from '@playwright/test';

test.describe('Data Structure Debug', () => {
  test('Debug data structure mismatch', async ({ page }) => {
    console.log('🔍 Debugging data structure mismatch...');

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

    // Test the addGlucoseReading function directly
    const testResult = await page.evaluate(async () => {
      // Simulate what the modal sends
      const mockReading = {
        value: 123,
        displayUnit: 'mmol/L',
        context: 'before_meal',
        timestamp: new Date().toISOString(),
        source: 'manual'
      };
      
      console.log('🧪 Testing addGlucoseReading with mock data:', mockReading);
      
      try {
        const token = localStorage.getItem('token');
        
        // Make the API call directly (simulating what addGlucoseReading does)
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
          
          // Check the structure of the response
          const hasId = responseData.hasOwnProperty('id');
          const hasData = responseData.hasOwnProperty('data');
          const hasTimestamp = responseData.hasOwnProperty('timestamp');
          const hasType = responseData.hasOwnProperty('type');
          
          return {
            success: true,
            responseData,
            structure: {
              hasId,
              hasData,
              hasTimestamp,
              hasType,
              dataKeys: responseData.data ? Object.keys(responseData.data) : [],
              topLevelKeys: Object.keys(responseData)
            }
          };
        } else {
          const errorText = await response.text();
          console.log('❌ API Error:', response.status, errorText);
          return { success: false, error: errorText, status: response.status };
        }
      } catch (error) {
        console.log('❌ Exception:', error.message);
        return { success: false, error: error.message };
      }
    });
    
    console.log('Test Result:', JSON.stringify(testResult, null, 2));
    
    if (testResult.success) {
      console.log('\n🔍 ANALYSIS:');
      console.log('Response structure:', JSON.stringify(testResult.structure, null, 2));
      
      // Check if the response structure matches what the frontend expects
      const responseData = testResult.responseData;
      
      if (testResult.structure.hasData) {
        console.log('📊 Backend returns nested data structure');
        console.log('🔍 The issue might be that the frontend expects flat structure but backend returns nested');
        
        // Check what fields are in the nested data
        console.log('Data fields:', testResult.structure.dataKeys);
        
        // The frontend might need to flatten the structure
        const flattenedData = {
          id: responseData.id,
          timestamp: responseData.timestamp,
          ...responseData.data
        };
        
        console.log('🔧 Flattened structure would be:', flattenedData);
      } else {
        console.log('📊 Backend returns flat structure');
      }
    }
    
    // Now test what the initial data fetch returns
    console.log('\n🔍 Checking initial data structure...');
    
    const initialDataStructure = await page.evaluate(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/logs/glucose', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Initial glucose data:', data);
          
          if (data.length > 0) {
            const firstItem = data[0];
            return {
              success: true,
              firstItem,
              structure: {
                hasId: firstItem.hasOwnProperty('id'),
                hasData: firstItem.hasOwnProperty('data'),
                hasTimestamp: firstItem.hasOwnProperty('timestamp'),
                hasType: firstItem.hasOwnProperty('type'),
                topLevelKeys: Object.keys(firstItem),
                dataKeys: firstItem.data ? Object.keys(firstItem.data) : []
              }
            };
          } else {
            return { success: true, empty: true };
          }
        } else {
          return { success: false, status: response.status };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('Initial data structure:', JSON.stringify(initialDataStructure, null, 2));
    
    // Compare structures
    if (testResult.success && initialDataStructure.success && !initialDataStructure.empty) {
      const postStructure = testResult.structure;
      const getStructure = initialDataStructure.structure;
      
      console.log('\n📊 STRUCTURE COMPARISON:');
      console.log('POST response keys:', postStructure.topLevelKeys);
      console.log('GET response keys:', getStructure.topLevelKeys);
      
      const structureMatch = JSON.stringify(postStructure.topLevelKeys.sort()) === JSON.stringify(getStructure.topLevelKeys.sort());
      console.log(`Structures match: ${structureMatch}`);
      
      if (!structureMatch) {
        console.log('❌ ISSUE FOUND: POST and GET return different data structures');
        console.log('🔧 This could cause the frontend state update to fail');
      }
    }
  });
});
