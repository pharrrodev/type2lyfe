import { test, expect } from '@playwright/test';

test.describe('Modal Render Test', () => {
  test('Check if glucose modal renders in DOM when state is set', async ({ page }) => {
    console.log('🔍 Testing if glucose modal renders in DOM...');

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

    // Go to Dashboard
    await page.click('text=Dashboard');
    await page.waitForTimeout(1000);

    // Check initial state
    console.log('🔍 Checking initial DOM state...');
    const initialCheck = await page.evaluate(() => {
      return {
        totalElements: document.querySelectorAll('*').length,
        dialogs: document.querySelectorAll('[role="dialog"]').length,
        glucoseText: document.body.innerHTML.includes('Log Glucose'),
        glucoseModal: document.body.innerHTML.includes('Glucose Reading'),
        numberInputs: document.querySelectorAll('input[type="number"]').length
      };
    });
    console.log('Initial DOM state:', initialCheck);

    // Click plus button and glucose button
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(500);
    await page.click('div[role="dialog"] button:has-text("Glucose")');
    await page.waitForTimeout(1000);

    // Check DOM state after clicking
    console.log('🔍 Checking DOM state after glucose button click...');
    const afterClickCheck = await page.evaluate(() => {
      return {
        totalElements: document.querySelectorAll('*').length,
        dialogs: document.querySelectorAll('[role="dialog"]').length,
        glucoseText: document.body.innerHTML.includes('Log Glucose'),
        glucoseModal: document.body.innerHTML.includes('Glucose Reading'),
        numberInputs: document.querySelectorAll('input[type="number"]').length,
        actionSheetVisible: document.body.innerHTML.includes('What would you like to log?')
      };
    });
    console.log('After click DOM state:', afterClickCheck);

    // Check if there are any hidden elements
    console.log('🔍 Checking for hidden glucose modal elements...');
    const hiddenElementsCheck = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const hiddenGlucoseElements = [];
      
      for (let el of allElements) {
        if (el.textContent && el.textContent.includes('Log Glucose')) {
          const computed = window.getComputedStyle(el);
          hiddenGlucoseElements.push({
            tagName: el.tagName,
            textContent: el.textContent.substring(0, 50),
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            zIndex: computed.zIndex,
            position: computed.position
          });
        }
      }
      
      return hiddenGlucoseElements;
    });
    console.log('Hidden glucose elements:', hiddenElementsCheck);

    // Force a re-render by waiting longer
    console.log('⏳ Waiting longer for potential re-render...');
    await page.waitForTimeout(3000);

    const finalCheck = await page.evaluate(() => {
      return {
        dialogs: document.querySelectorAll('[role="dialog"]').length,
        glucoseText: document.body.innerHTML.includes('Log Glucose'),
        numberInputs: document.querySelectorAll('input[type="number"]').length,
        actionSheetVisible: document.body.innerHTML.includes('What would you like to log?')
      };
    });
    console.log('Final DOM state:', finalCheck);

    // Try to manually trigger a React re-render
    console.log('🔄 Attempting to trigger React re-render...');
    await page.evaluate(() => {
      // Trigger a window resize event which often causes React to re-render
      window.dispatchEvent(new Event('resize'));
    });
    await page.waitForTimeout(1000);

    const afterResizeCheck = await page.evaluate(() => {
      return {
        dialogs: document.querySelectorAll('[role="dialog"]').length,
        glucoseText: document.body.innerHTML.includes('Log Glucose'),
        numberInputs: document.querySelectorAll('input[type="number"]').length
      };
    });
    console.log('After resize DOM state:', afterResizeCheck);

    // Take screenshot for debugging
    await page.screenshot({ path: 'modal-render-test.png', fullPage: true });

    console.log('\n📊 MODAL RENDER TEST RESULTS:');
    console.log(`Initial dialogs: ${initialCheck.dialogs}`);
    console.log(`After click dialogs: ${afterClickCheck.dialogs}`);
    console.log(`Final dialogs: ${finalCheck.dialogs}`);
    console.log(`Glucose modal text found: ${finalCheck.glucoseText ? '✅' : '❌'}`);
    console.log(`Number inputs found: ${finalCheck.numberInputs > 0 ? '✅' : '❌'}`);
    console.log(`Action sheet still visible: ${finalCheck.actionSheetVisible ? '⚠️' : '✅'}`);

    if (finalCheck.glucoseText && finalCheck.numberInputs === 0) {
      console.log('🔍 ISSUE: Glucose modal text found but no number inputs (CSS hiding issue)');
    } else if (!finalCheck.glucoseText) {
      console.log('🔍 ISSUE: Glucose modal not being rendered to DOM (React state issue)');
    } else {
      console.log('✅ Glucose modal rendering correctly');
    }
  });
});
