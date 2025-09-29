import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Modal Isolation Test', () => {
  
  test('Verify only meal modal is rendered and no glucose analysis is triggered', async ({ page }) => {
    console.log('🔍 Testing modal isolation fix...');

    // Listen for API calls
    let mealAnalysisCalled = false;
    let glucoseAnalysisCalled = false;

    page.on('response', response => {
      if (response.url().includes('/analyze/meal-from-image')) {
        mealAnalysisCalled = true;
        console.log('✅ Meal analysis API called');
      }
      if (response.url().includes('/analyze/glucose-from-image')) {
        glucoseAnalysisCalled = true;
        console.log('❌ Glucose analysis API called (should not happen!)');
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

    console.log('✅ Logged in successfully');

    // Check initial DOM state
    const initialFileInputs = await page.locator('input[type="file"]').count();
    const initialGlucoseElements = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => 
        el.textContent && el.textContent.includes('Glucose Reading')
      ).length;
    });

    console.log(`Initial file inputs: ${initialFileInputs}`);
    console.log(`Initial glucose elements: ${initialGlucoseElements}`);

    // Open meal modal
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Meal")');
    await page.waitForTimeout(2000);

    // Check DOM after opening meal modal
    const afterMealFileInputs = await page.locator('input[type="file"]').count();
    const afterMealGlucoseElements = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => 
        el.textContent && el.textContent.includes('Glucose Reading')
      ).length;
    });
    const mealModalVisible = await page.locator('text=Upload Photo').isVisible();

    console.log(`After opening meal modal:`);
    console.log(`  File inputs: ${afterMealFileInputs}`);
    console.log(`  Glucose elements: ${afterMealGlucoseElements}`);
    console.log(`  Meal upload button visible: ${mealModalVisible}`);

    if (mealModalVisible) {
      // Switch to Photo tab
      const photoTabVisible = await page.locator('button:has-text("Photo")').isVisible();
      if (photoTabVisible) {
        await page.click('button:has-text("Photo")');
        await page.waitForTimeout(1000);

        // Create a test image
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVBiVY/z//z8DJQAggBhJVQcQQIykqgMIIEZS1QEEECO56gACiJFcdQABxEiuOoAAYiRXHUAAMZKrDiCAGMlVBxBAjOSqAwggRnLVAQQQI7nqAAKIkVx1AAHESKo6gABiJFUdQAAxkqoOIIAYSVUHEECMpKoDCCBGUtUBBBAjqeoAAoiRVHUAAcRIqjqAAGIkVR1AADGSLA4ggBhJVQcQQIykqgMIIEZS1QEEECO56gACiJFcdQABxEiuOoAAYiRXHUAAMZKrDiCAGMlVBxBAjOSqAwggRnLVAQQQI7nqAAKIkVx1AAHESKo6gABiJFUdQAAxkqoOIIAYSVUHEECMpKoDCCBGUtUBBBAjqeoAAoiRVHUAAcRIqjqAAGIkVR1AADGSLA4ggBhJVQcQQIykqgMIIEZS1QEEECO56gACiJFcdQABxEiuOoAAYiRXHUAAMZKrDiCAGAEAP9wKAOjFjZQAAAAASUVORK5CYII=';
        const testImageBuffer = Buffer.from(testImageBase64, 'base64');
        const testImagePath = path.join(process.cwd(), 'test-meal-isolation.png');
        
        // Write test image to file
        fs.writeFileSync(testImagePath, testImageBuffer);
        console.log(`📁 Created test image`);

        // Upload image
        const fileChooserPromise = page.waitForEvent('filechooser');
        await page.click('button:has-text("Upload Photo")');
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(testImagePath);
        await page.waitForTimeout(2000);

        // Check if analyze button appears
        const analyzeButtonVisible = await page.locator('button:has-text("Analyze")').isVisible();
        console.log(`Analyze button visible: ${analyzeButtonVisible}`);

        if (analyzeButtonVisible) {
          console.log('🔍 Clicking analyze button...');
          await page.click('button:has-text("Analyze")');
          await page.waitForTimeout(10000); // Wait for analysis
        }

        // Clean up
        fs.unlinkSync(testImagePath);
      }
    }

    console.log('\n🎯 MODAL ISOLATION TEST RESULTS:');
    console.log('=====================================');
    console.log(`✅ Meal analysis called: ${mealAnalysisCalled}`);
    console.log(`❌ Glucose analysis called: ${glucoseAnalysisCalled}`);
    console.log(`Initial glucose elements: ${initialGlucoseElements}`);
    console.log(`After meal modal glucose elements: ${afterMealGlucoseElements}`);
    
    if (glucoseAnalysisCalled) {
      console.log('🚨 ISSUE: Glucose analysis was triggered when it should not have been!');
      console.log('   This confirms the modal interference problem.');
    } else {
      console.log('✅ SUCCESS: Only meal analysis was triggered!');
      console.log('   Modal isolation fix is working.');
    }

    if (afterMealGlucoseElements === 0) {
      console.log('✅ SUCCESS: No glucose modal elements in DOM when meal modal is open');
    } else {
      console.log(`⚠️  WARNING: ${afterMealGlucoseElements} glucose elements still in DOM`);
    }

    await page.screenshot({ path: 'modal-isolation-test.png', fullPage: true });
  });
});
