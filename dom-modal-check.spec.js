import { test, expect } from '@playwright/test';

test.describe('DOM Modal Check', () => {
  
  test('Check if both modals exist in DOM and have conflicting event handlers', async ({ page }) => {
    console.log('🔍 Checking DOM for modal conflicts...');

    // Navigate and login
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Login
    await page.fill('input[type="email"]', 'frontend@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('✅ Logged in successfully');

    // Check what's in the DOM before opening any modals
    const initialFileInputs = await page.locator('input[type="file"]').count();
    const initialUploadButtons = await page.locator('text=Upload Photo').count();
    
    console.log(`Initial file inputs in DOM: ${initialFileInputs}`);
    console.log(`Initial upload buttons in DOM: ${initialUploadButtons}`);

    // Open meal modal
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Meal")');
    await page.waitForTimeout(2000);

    // Check DOM after opening meal modal
    const afterMealFileInputs = await page.locator('input[type="file"]').count();
    const afterMealUploadButtons = await page.locator('text=Upload Photo').count();
    const mealModalVisible = await page.locator('text=Meal Photo').isVisible();
    const glucoseModalVisible = await page.locator('text=Glucose Reading').isVisible();
    
    console.log(`After opening meal modal:`);
    console.log(`  File inputs in DOM: ${afterMealFileInputs}`);
    console.log(`  Upload buttons in DOM: ${afterMealUploadButtons}`);
    console.log(`  Meal modal visible: ${mealModalVisible}`);
    console.log(`  Glucose modal visible: ${glucoseModalVisible}`);

    // Check if there are hidden glucose modal elements
    const allGlucoseElements = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => 
        el.textContent && (
          el.textContent.includes('Glucose Reading') ||
          el.textContent.includes('glucose') ||
          el.textContent.includes('mg/dL') ||
          el.textContent.includes('mmol/L')
        )
      ).length;
    });

    const allMealElements = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => 
        el.textContent && (
          el.textContent.includes('Meal Photo') ||
          el.textContent.includes('meal') ||
          el.textContent.includes('calories') ||
          el.textContent.includes('nutrition')
        )
      ).length;
    });

    console.log(`Total glucose-related elements in DOM: ${allGlucoseElements}`);
    console.log(`Total meal-related elements in DOM: ${allMealElements}`);

    // Check if both modals are actually rendered (even if hidden)
    const glucoseModalInDOM = await page.locator('[data-testid="glucose-modal"], .glucose-modal, *:has-text("Glucose Reading")').count();
    const mealModalInDOM = await page.locator('[data-testid="meal-modal"], .meal-modal, *:has-text("Meal Photo")').count();
    
    console.log(`Glucose modal components in DOM: ${glucoseModalInDOM}`);
    console.log(`Meal modal components in DOM: ${mealModalInDOM}`);

    // Check for multiple file input handlers
    const fileInputHandlers = await page.evaluate(() => {
      const fileInputs = document.querySelectorAll('input[type="file"]');
      let handlerCount = 0;
      fileInputs.forEach(input => {
        // Check if input has event listeners (this is a rough check)
        const events = getEventListeners ? getEventListeners(input) : {};
        if (events.change && events.change.length > 0) {
          handlerCount += events.change.length;
        }
      });
      return handlerCount;
    });

    console.log(`File input event handlers detected: ${fileInputHandlers}`);

    console.log('\n🎯 DOM MODAL CHECK RESULTS:');
    console.log('=====================================');
    
    if (afterMealFileInputs > 1) {
      console.log(`🚨 ISSUE: Multiple file inputs detected (${afterMealFileInputs})`);
      console.log('   This could cause both modals to respond to file uploads');
    }

    if (afterMealUploadButtons > 1) {
      console.log(`🚨 ISSUE: Multiple upload buttons detected (${afterMealUploadButtons})`);
      console.log('   This suggests both modals are in the DOM');
    }

    if (glucoseModalInDOM > 0 && mealModalInDOM > 0) {
      console.log('🚨 ISSUE: Both glucose and meal modals exist in DOM');
      console.log('   Even if one is hidden, both might respond to events');
    }

    if (allGlucoseElements > 0 && allMealElements > 0) {
      console.log('🚨 ISSUE: Both glucose and meal elements present');
      console.log('   This confirms both modals are rendered simultaneously');
    }

    if (fileInputHandlers > 1) {
      console.log(`🚨 ISSUE: Multiple file input handlers (${fileInputHandlers})`);
      console.log('   This could cause duplicate API calls');
    }

    await page.screenshot({ path: 'dom-modal-check.png', fullPage: true });
  });
});
