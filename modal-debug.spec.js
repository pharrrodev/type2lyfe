import { test, expect } from '@playwright/test';

test.describe('Modal Debug', () => {
  test('Debug glucose modal opening', async ({ page }) => {
    console.log('🔍 Debugging glucose modal opening...');

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

    // Add debug logging to track modal state
    await page.evaluate(() => {
      console.log('🔍 Adding modal state debug hooks...');
      
      // Hook into React state changes
      window.debugModalState = () => {
        const glucoseModalElements = document.querySelectorAll('[role="dialog"]');
        const inputElements = document.querySelectorAll('input[type="number"]');
        const glucoseModalTexts = document.querySelectorAll('*');
        
        let glucoseModalTextFound = false;
        glucoseModalTexts.forEach(el => {
          if (el.textContent && el.textContent.includes('Glucose Reading')) {
            glucoseModalTextFound = true;
          }
        });
        
        return {
          dialogElements: glucoseModalElements.length,
          numberInputs: inputElements.length,
          glucoseModalTextFound,
          bodyHTML: document.body.innerHTML.includes('Glucose Reading')
        };
      };
      
      console.log('Initial modal state:', window.debugModalState());
    });

    // Click the plus button
    console.log('➕ Clicking plus button...');
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    
    // Check modal state after plus button
    const modalStateAfterPlus = await page.evaluate(() => window.debugModalState());
    console.log('Modal state after plus button:', modalStateAfterPlus);
    
    // Wait for action sheet to be visible
    await page.waitForSelector('text=What would you like to log?', { state: 'visible' });
    console.log('✅ Action sheet opened');
    
    // Click Glucose button
    console.log('🩸 Clicking Glucose button...');
    await page.click('div[role="dialog"] button:has-text("Glucose")');
    await page.waitForTimeout(2000); // Wait longer for modal transition
    
    // Check modal state after glucose button
    const modalStateAfterGlucose = await page.evaluate(() => window.debugModalState());
    console.log('Modal state after glucose button:', modalStateAfterGlucose);
    
    // Check if glucose modal is in the DOM but maybe hidden
    const glucoseModalInDOM = await page.locator('text=Glucose Reading').count();
    console.log(`Glucose modal in DOM: ${glucoseModalInDOM > 0}`);
    
    // Check for any modal-related elements
    const allDialogs = await page.locator('[role="dialog"]').count();
    console.log(`Total dialog elements: ${allDialogs}`);
    
    // Check for number inputs
    const numberInputs = await page.locator('input[type="number"]').count();
    console.log(`Number inputs found: ${numberInputs}`);
    
    // Check if the glucose modal might be hidden by CSS
    if (glucoseModalInDOM > 0) {
      const glucoseModalVisible = await page.locator('text=Glucose Reading').isVisible();
      console.log(`Glucose modal visible: ${glucoseModalVisible}`);
      
      if (!glucoseModalVisible) {
        // Check the computed styles
        const modalStyles = await page.locator('text=Glucose Reading').first().evaluate(el => {
          const computed = window.getComputedStyle(el.closest('[role="dialog"]') || el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            zIndex: computed.zIndex,
            transform: computed.transform
          };
        });
        console.log('Glucose modal styles:', modalStyles);
      }
    }
    
    // Try to force open the glucose modal by calling the function directly
    console.log('🧪 Trying to force open glucose modal...');
    const forceOpenResult = await page.evaluate(() => {
      // Try to find and trigger the glucose modal state
      const mainContainer = document.querySelector('div.h-full.flex.flex-col.bg-slate-50');
      if (mainContainer) {
        // Try to find React fiber and trigger state change
        const keys = Object.keys(mainContainer);
        const reactKey = keys.find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
        if (reactKey) {
          console.log('Found React fiber, attempting to trigger glucose modal...');
          // This is a hack to try to trigger the modal
          return 'React fiber found but cannot directly manipulate state';
        }
      }
      return 'Could not find React fiber';
    });
    console.log('Force open result:', forceOpenResult);
    
    // Take screenshots for debugging
    await page.screenshot({ path: 'modal-debug-after-glucose-click.png', fullPage: true });
    
    // Final check
    const finalNumberInputs = await page.locator('input[type="number"]').count();
    console.log(`Final number inputs: ${finalNumberInputs}`);
    
    console.log('\n📊 MODAL DEBUG SUMMARY:');
    console.log(`Action sheet opens: ✅`);
    console.log(`Glucose button clickable: ✅`);
    console.log(`Glucose modal in DOM: ${glucoseModalInDOM > 0 ? '✅' : '❌'}`);
    console.log(`Glucose modal visible: ${numberInputs > 0 ? '✅' : '❌'}`);
    
    if (glucoseModalInDOM > 0 && numberInputs === 0) {
      console.log('🔍 ISSUE: Glucose modal exists in DOM but is not visible (CSS/styling issue)');
    } else if (glucoseModalInDOM === 0) {
      console.log('🔍 ISSUE: Glucose modal not being added to DOM (React state issue)');
    } else {
      console.log('✅ Glucose modal working correctly');
    }
  });
});
