import { test, expect } from '@playwright/test';

test.describe('Direct Modal Test', () => {
  test('Test glucose modal by directly setting state', async ({ page }) => {
    console.log('🧪 Testing glucose modal by directly setting state...');

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

    // Try to directly trigger the glucose modal state
    console.log('🔧 Attempting to directly set glucose modal state...');
    
    const directStateResult = await page.evaluate(() => {
      // Try to find the React component and trigger the state change
      const mainContainer = document.querySelector('div.h-full.flex.flex-col.bg-slate-50');
      if (mainContainer) {
        // Look for React fiber
        const keys = Object.keys(mainContainer);
        const reactKey = keys.find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
        
        if (reactKey) {
          const fiber = mainContainer[reactKey];
          console.log('Found React fiber:', !!fiber);
          
          // Try to find the component with the glucose modal state
          let currentFiber = fiber;
          let attempts = 0;
          while (currentFiber && attempts < 20) {
            if (currentFiber.memoizedState) {
              console.log('Found component with state');
              // This is a hack - we can't directly manipulate React state safely
              return 'Found component with state but cannot safely manipulate';
            }
            currentFiber = currentFiber.return || currentFiber.child;
            attempts++;
          }
        }
      }
      return 'Could not find React component with state';
    });
    
    console.log('Direct state result:', directStateResult);

    // Instead, let's test if the modal component itself works by checking if it's imported correctly
    console.log('🔍 Checking if GlucoseLogModal component is available...');
    
    // Check if the modal would render if the state was true
    const modalComponentCheck = await page.evaluate(() => {
      // Look for any glucose-related text or components in the page source
      const pageHTML = document.documentElement.innerHTML;
      const hasGlucoseModal = pageHTML.includes('GlucoseLogModal') || pageHTML.includes('Glucose Reading');
      const hasModalStructure = pageHTML.includes('role="dialog"');
      
      return {
        hasGlucoseModal,
        hasModalStructure,
        totalDialogs: document.querySelectorAll('[role="dialog"]').length
      };
    });
    
    console.log('Modal component check:', modalComponentCheck);

    // Let's try a different approach - simulate the exact click sequence with more debugging
    console.log('🔄 Trying click sequence with detailed debugging...');
    
    // Add state change listener
    await page.evaluate(() => {
      window.stateChanges = [];
      
      // Override console.log to capture state changes
      const originalLog = console.log;
      console.log = function(...args) {
        if (args[0] && args[0].includes && args[0].includes('glucose')) {
          window.stateChanges.push(args.join(' '));
        }
        originalLog.apply(console, args);
      };
    });

    // Click plus button
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(500);
    
    // Check if action sheet is open
    const actionSheetOpen = await page.locator('text=What would you like to log?').isVisible();
    console.log(`Action sheet open: ${actionSheetOpen}`);
    
    if (actionSheetOpen) {
      // Click glucose button with more specific selector
      const glucoseButton = page.locator('div[role="dialog"] button').filter({ hasText: 'Glucose' });
      const glucoseButtonExists = await glucoseButton.count() > 0;
      console.log(`Glucose button exists: ${glucoseButtonExists}`);
      
      if (glucoseButtonExists) {
        console.log('🩸 Clicking glucose button with detailed tracking...');
        
        // Add click event listener
        await page.evaluate(() => {
          document.addEventListener('click', (e) => {
            if (e.target.textContent && e.target.textContent.includes('Glucose')) {
              console.log('🔍 Glucose button clicked!', e.target);
            }
          });
        });
        
        await glucoseButton.click();
        await page.waitForTimeout(2000);
        
        // Check state changes
        const stateChanges = await page.evaluate(() => window.stateChanges);
        console.log('State changes captured:', stateChanges);
        
        // Check modal state again
        const finalModalCheck = await page.evaluate(() => {
          return {
            dialogs: document.querySelectorAll('[role="dialog"]').length,
            numberInputs: document.querySelectorAll('input[type="number"]').length,
            glucoseText: document.body.innerHTML.includes('Glucose Reading'),
            actionSheetVisible: document.body.innerHTML.includes('What would you like to log?')
          };
        });
        
        console.log('Final modal check:', finalModalCheck);
        
        // Take screenshot
        await page.screenshot({ path: 'direct-modal-test.png', fullPage: true });
        
        console.log('\n📊 DIRECT MODAL TEST RESULTS:');
        console.log(`Action sheet opens: ${actionSheetOpen ? '✅' : '❌'}`);
        console.log(`Glucose button exists: ${glucoseButtonExists ? '✅' : '❌'}`);
        console.log(`Glucose modal appears: ${finalModalCheck.numberInputs > 0 ? '✅' : '❌'}`);
        console.log(`Action sheet closes: ${!finalModalCheck.actionSheetVisible ? '✅' : '❌'}`);
        
        if (finalModalCheck.numberInputs === 0 && !finalModalCheck.actionSheetVisible) {
          console.log('🔍 ISSUE: Action sheet closes but glucose modal doesn\'t open');
          console.log('🔧 This suggests the setIsGlucoseModalOpen(true) call is not working');
        }
      }
    }
  });
});
