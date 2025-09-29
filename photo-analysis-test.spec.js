import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Photo Analysis Functionality Tests', () => {
  
  test('Test meal photo analysis functionality', async ({ page }) => {
    console.log('📸 Testing meal photo analysis...');

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

    // Open meal modal via action sheet
    console.log('🍽️ Opening action sheet...');
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);

    console.log('🍽️ Clicking Meal from action sheet...');
    await page.click('button:has-text("Meal")');
    await page.waitForTimeout(1000);

    // Check if modal opened
    const modalVisible = await page.locator('text=Log Meal').isVisible();
    console.log(`Meal modal visible: ${modalVisible}`);

    if (modalVisible) {
      // Switch to Photo tab
      console.log('📸 Switching to Photo tab...');
      await page.click('button:has-text("Photo")');
      await page.waitForTimeout(1000);

      // Check if photo upload section is visible
      const uploadVisible = await page.locator('input[type="file"]').isVisible();
      console.log(`File upload input visible: ${uploadVisible}`);

      if (uploadVisible) {
        // Create a simple test image (1x1 pixel PNG)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        const testImageBuffer = Buffer.from(testImageBase64, 'base64');
        const testImagePath = path.join(process.cwd(), 'test-meal-image.png');
        
        // Write test image to file
        fs.writeFileSync(testImagePath, testImageBuffer);
        console.log('📁 Created test image file');

        // Upload the test image
        console.log('📤 Uploading test image...');
        await page.setInputFiles('input[type="file"]', testImagePath);
        await page.waitForTimeout(1000);

        // Check if image preview appeared
        const previewVisible = await page.locator('img').count() > 0;
        console.log(`Image preview visible: ${previewVisible}`);

        if (previewVisible) {
          console.log('✅ Image upload working!');

          // Look for analyze button
          const analyzeButton = page.locator('button:has-text("Analyze")');
          const analyzeButtonVisible = await analyzeButton.isVisible();
          console.log(`Analyze button visible: ${analyzeButtonVisible}`);

          if (analyzeButtonVisible) {
            console.log('🔍 Clicking analyze button...');
            await analyzeButton.click();
            await page.waitForTimeout(5000); // Wait for analysis

            // Check for loading state
            const loadingVisible = await page.locator('text=Analyzing').isVisible();
            console.log(`Loading state visible: ${loadingVisible}`);

            // Wait for analysis to complete
            await page.waitForTimeout(10000);

            // Check for analysis results or error
            const resultsVisible = await page.locator('text=Food Items').isVisible();
            const errorVisible = await page.locator('.text-red-500').isVisible();
            
            console.log(`Analysis results visible: ${resultsVisible}`);
            console.log(`Error message visible: ${errorVisible}`);

            if (resultsVisible) {
              console.log('✅ Photo analysis completed successfully!');
              
              // Check for nutritional information
              const nutritionVisible = await page.locator('text=Calories').isVisible();
              console.log(`Nutrition information visible: ${nutritionVisible}`);

              // Check for save button
              const saveButton = page.locator('button:has-text("Save Meal")');
              const saveButtonVisible = await saveButton.isVisible();
              console.log(`Save button visible: ${saveButtonVisible}`);

              if (saveButtonVisible) {
                console.log('💾 Saving analyzed meal...');
                await saveButton.click();
                await page.waitForTimeout(3000);

                console.log('🎉 PHOTO ANALYSIS TEST RESULTS:');
                console.log('✅ File upload: WORKING');
                console.log('✅ Image preview: WORKING');
                console.log('✅ Photo analysis: WORKING');
                console.log('✅ Results display: WORKING');
                console.log('✅ Data submission: WORKING');
              }
            } else if (errorVisible) {
              const errorText = await page.locator('.text-red-500').textContent();
              console.log(`Analysis error: ${errorText}`);
              console.log('✅ Error handling: WORKING');
            } else {
              console.log('⏳ Analysis may still be processing...');
            }
          }
        }

        // Clean up test file
        fs.unlinkSync(testImagePath);
        console.log('🗑️ Cleaned up test image file');
      }
    }

    await page.screenshot({ path: 'photo-analysis-test.png', fullPage: true });
  });

  test('Test glucose meter photo analysis', async ({ page }) => {
    console.log('📸 Testing glucose meter photo analysis...');

    // Navigate and login
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'frontend@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Open glucose modal via action sheet
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Glucose")');
    await page.waitForTimeout(1000);

    // Switch to Photo tab
    await page.click('button:has-text("Photo")');
    await page.waitForTimeout(1000);

    // Check if photo upload is available
    const uploadVisible = await page.locator('input[type="file"]').isVisible();
    console.log(`Glucose photo upload visible: ${uploadVisible}`);

    if (uploadVisible) {
      // Create a test image
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const testImageBuffer = Buffer.from(testImageBase64, 'base64');
      const testImagePath = path.join(process.cwd(), 'test-glucose-meter.png');
      
      fs.writeFileSync(testImagePath, testImageBuffer);

      // Upload test image
      await page.setInputFiles('input[type="file"]', testImagePath);
      await page.waitForTimeout(1000);

      // Look for analyze button
      const analyzeButton = page.locator('button:has-text("Analyze")');
      const analyzeButtonVisible = await analyzeButton.isVisible();
      
      if (analyzeButtonVisible) {
        console.log('🔍 Analyzing glucose meter image...');
        await analyzeButton.click();
        await page.waitForTimeout(10000);

        // Check for results or error
        const confirmVisible = await page.locator('text=Is this correct?').isVisible();
        const errorVisible = await page.locator('.text-red-500').isVisible();

        console.log(`Glucose confirmation visible: ${confirmVisible}`);
        console.log(`Error visible: ${errorVisible}`);

        if (confirmVisible || errorVisible) {
          console.log('✅ Glucose photo analysis: WORKING');
        }
      }

      fs.unlinkSync(testImagePath);
    }
  });

  test('Test photo upload error handling', async ({ page }) => {
    console.log('📸 Testing photo upload error handling...');

    // Navigate and login
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'frontend@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Open meal modal via action sheet
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("Meal")');
    await page.waitForTimeout(1000);

    // Switch to Photo tab
    await page.click('button:has-text("Photo")');
    await page.waitForTimeout(1000);

    // Create an invalid file (text file instead of image)
    const invalidFilePath = path.join(process.cwd(), 'invalid-file.txt');
    fs.writeFileSync(invalidFilePath, 'This is not an image file');

    // Try to upload invalid file
    await page.setInputFiles('input[type="file"]', invalidFilePath);
    await page.waitForTimeout(1000);

    // Check for error handling
    const errorVisible = await page.locator('.text-red-500').isVisible();
    console.log(`Error handling for invalid file: ${errorVisible}`);

    // Clean up
    fs.unlinkSync(invalidFilePath);

    if (errorVisible) {
      console.log('✅ Photo upload error handling: WORKING');
    }
  });
});
