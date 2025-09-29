import { test, expect } from '@playwright/test';

test.describe('Modal State Debug Test', () => {
  
  test('Check if both meal and glucose modals are open simultaneously', async ({ page }) => {
    console.log('🔍 Debugging modal state conflicts...');

    // Navigate and login
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Login
    await page.fill('input[type="email"]', 'frontend@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('✅ Logged in successfully');

    // Check initial state - no modals should be open
    const initialGlucoseModal = await page.locator('text=Glucose Reading').isVisible();
    const initialMealModal = await page.locator('text=Meal Photo').isVisible();
    
    console.log(`Initial glucose modal visible: ${initialGlucoseModal}`);
    console.log(`Initial meal modal visible: ${initialMealModal}`);

    // Open action sheet
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);

    // Click Meal button
    console.log('\n🍽️ Clicking Meal button...');
    await page.click('button:has-text("Meal")');
    await page.waitForTimeout(2000);

    // Check which modals are now open
    const afterMealClickGlucoseModal = await page.locator('text=Glucose Reading').isVisible();
    const afterMealClickMealModal = await page.locator('text=Meal Photo').isVisible();
    const afterMealClickPhotoTab = await page.locator('button:has-text("Photo")').isVisible();
    
    console.log(`After clicking Meal - Glucose modal visible: ${afterMealClickGlucoseModal}`);
    console.log(`After clicking Meal - Meal modal visible: ${afterMealClickMealModal}`);
    console.log(`After clicking Meal - Photo tab visible: ${afterMealClickPhotoTab}`);

    // Check for any glucose-related elements that might be hidden but still active
    const glucoseElements = await page.locator('input[placeholder*="glucose"]').count();
    const mealElements = await page.locator('text=Upload Photo').count();
    
    console.log(`Glucose-related elements found: ${glucoseElements}`);
    console.log(`Meal-related elements found: ${mealElements}`);

    // Check if there are multiple modals in the DOM
    const allModals = await page.locator('[role="dialog"]').count();
    const allModalBackdrops = await page.locator('.fixed.inset-0').count();
    
    console.log(`Total modals in DOM: ${allModals}`);
    console.log(`Total modal backdrops: ${allModalBackdrops}`);

    // Check for any hidden glucose modals
    const hiddenGlucoseModals = await page.locator('text=Glucose Reading').count();
    const hiddenMealModals = await page.locator('text=Meal Photo').count();
    
    console.log(`Total glucose modal elements (including hidden): ${hiddenGlucoseModals}`);
    console.log(`Total meal modal elements (including hidden): ${hiddenMealModals}`);

    console.log('\n🎯 MODAL STATE DEBUG RESULTS:');
    console.log('=====================================');
    
    if (afterMealClickGlucoseModal && afterMealClickMealModal) {
      console.log('🚨 ISSUE FOUND: Both glucose and meal modals are open simultaneously!');
      console.log('   This explains why both analyses are being triggered.');
    } else if (afterMealClickGlucoseModal && !afterMealClickMealModal) {
      console.log('🚨 ISSUE FOUND: Glucose modal opened instead of meal modal!');
      console.log('   The action sheet routing is incorrect.');
    } else if (!afterMealClickGlucoseModal && afterMealClickMealModal) {
      console.log('✅ CORRECT: Only meal modal is open.');
      console.log('   The issue must be elsewhere - possibly shared event handlers.');
    } else {
      console.log('🚨 ISSUE FOUND: No modals opened at all!');
      console.log('   The action sheet is not working correctly.');
    }

    if (allModals > 1) {
      console.log(`⚠️  Multiple modals detected in DOM: ${allModals}`);
    }

    if (hiddenGlucoseModals > 0 && hiddenMealModals > 0) {
      console.log('⚠️  Both glucose and meal modal elements exist in DOM');
      console.log('   This could cause event handler conflicts');
    }

    await page.screenshot({ path: 'modal-state-debug.png', fullPage: true });
  });
});
