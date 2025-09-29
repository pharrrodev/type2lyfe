import { test, expect } from '@playwright/test';

test.describe('Button Click Debug', () => {
  test('Debug Save Log button click', async ({ page }) => {
    console.log('🔍 Debugging Save Log button click...');

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

    // Open glucose modal
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);
    await page.click('div[role="dialog"] button:has-text("Glucose")');
    await page.waitForTimeout(2000);
    
    // Switch to Manual tab
    await page.click('button:has-text("Manual")');
    await page.waitForTimeout(1000);
    
    // Fill form
    await page.fill('input[type="number"]', '188');
    await page.selectOption('select', 'after_meal');
    
    // Take screenshot before clicking Save
    await page.screenshot({ path: 'before-save-click.png', fullPage: true });
    
    // Check if Save Log button exists and is visible
    const saveButtonExists = await page.locator('button:has-text("Save Log")').count();
    console.log(`Save Log button exists: ${saveButtonExists > 0}`);
    
    if (saveButtonExists > 0) {
      const saveButtonVisible = await page.locator('button:has-text("Save Log")').isVisible();
      console.log(`Save Log button visible: ${saveButtonVisible}`);
      
      if (saveButtonVisible) {
        const saveButtonEnabled = await page.locator('button:has-text("Save Log")').isEnabled();
        console.log(`Save Log button enabled: ${saveButtonEnabled}`);
        
        // Check button attributes
        const buttonAttributes = await page.locator('button:has-text("Save Log")').evaluate(el => ({
          type: el.getAttribute('type'),
          disabled: el.disabled,
          className: el.className,
          textContent: el.textContent
        }));
        console.log('Save button attributes:', buttonAttributes);
        
        // Try clicking with force
        console.log('🔄 Attempting to click Save Log button...');
        try {
          await page.locator('button:has-text("Save Log")').click({ force: true });
          console.log('✅ Save Log button clicked successfully');
          
          // Wait for potential async operations
          await page.waitForTimeout(3000);
          
          // Check if modal is still open
          const modalStillOpen = await page.locator('text=Log Glucose').isVisible();
          console.log(`Modal still open after click: ${modalStillOpen}`);
          
        } catch (error) {
          console.log('❌ Failed to click Save Log button:', error.message);
        }
      } else {
        console.log('❌ Save Log button not visible');
        
        // Check if it's hidden by CSS
        const buttonStyles = await page.locator('button:has-text("Save Log")').evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            display: computed.display,
            visibility: computed.visibility,
            opacity: computed.opacity,
            pointerEvents: computed.pointerEvents
          };
        });
        console.log('Save button styles:', buttonStyles);
      }
    } else {
      console.log('❌ Save Log button does not exist');
      
      // Check what buttons are available
      const allButtons = await page.locator('button').all();
      console.log(`Total buttons found: ${allButtons.length}`);
      
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`Button ${i + 1}: "${buttonText}"`);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'button-click-debug-final.png', fullPage: true });
  });
});
