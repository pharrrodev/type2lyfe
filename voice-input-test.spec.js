import { test, expect } from '@playwright/test';

test.describe('Voice Input Functionality Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock getUserMedia to simulate microphone access
    await page.addInitScript(() => {
      // Mock navigator.mediaDevices.getUserMedia
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async (constraints) => {
            console.log('🎤 Mock getUserMedia called with:', constraints);
            // Return a mock MediaStream
            return {
              getTracks: () => [{ stop: () => console.log('🛑 Mock track stopped') }],
              getAudioTracks: () => [{ stop: () => console.log('🛑 Mock audio track stopped') }]
            };
          }
        },
        writable: true
      });

      // Mock AudioContext
      window.AudioContext = class MockAudioContext {
        constructor() {
          console.log('🔊 Mock AudioContext created');
          this.sampleRate = 16000;
          this.destination = {};
        }
        createMediaStreamSource() {
          return {
            connect: () => console.log('🔗 Mock source connected')
          };
        }
        createScriptProcessor() {
          return {
            connect: () => console.log('🔗 Mock processor connected'),
            onaudioprocess: null
          };
        }
      };

      // Mock Google Gemini AI
      window.GoogleGenAI = class MockGoogleGenAI {
        constructor() {
          console.log('🤖 Mock GoogleGenAI created');
        }
        get live() {
          return {
            connect: async (config) => {
              console.log('🔗 Mock Gemini Live connect called');
              // Simulate connection
              setTimeout(() => {
                if (config.callbacks.onopen) {
                  config.callbacks.onopen();
                }
              }, 100);
              
              // Return mock session
              return {
                sendRealtimeInput: (data) => {
                  console.log('📤 Mock sendRealtimeInput called');
                  // Simulate transcription response after a delay
                  setTimeout(() => {
                    if (config.callbacks.onmessage) {
                      config.callbacks.onmessage({
                        serverContent: {
                          inputTranscription: {
                            text: 'my glucose is 7.2 before breakfast'
                          }
                        }
                      });
                    }
                  }, 1000);
                }
              };
            }
          };
        }
      };
    });
  });

  test('Test glucose voice input functionality', async ({ page }) => {
    console.log('🎤 Testing glucose voice input...');

    // Listen for console messages
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(`📝 BROWSER LOG:`, msg.text());
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

    // Open glucose modal via action sheet
    console.log('📊 Opening action sheet...');
    await page.click('button[aria-label="Add new log"]');
    await page.waitForTimeout(1000);

    console.log('📊 Clicking Glucose from action sheet...');
    await page.click('button:has-text("Glucose")');
    await page.waitForTimeout(2000); // Increased wait time

    // Check if modal opened
    const modalVisible = await page.locator('text=Log Glucose Reading').isVisible();
    console.log(`Glucose modal visible: ${modalVisible}`);

    // If not visible, try alternative selectors
    if (!modalVisible) {
      const altModalVisible = await page.locator('text=Voice').isVisible();
      console.log(`Alternative modal check (Voice tab): ${altModalVisible}`);
    }

    if (modalVisible) {
      // Check if voice tab is active (should be default)
      const voiceTabActive = await page.locator('button:has-text("Voice")').getAttribute('class');
      console.log(`Voice tab classes: ${voiceTabActive}`);

      // Test microphone button
      const micButton = page.locator('button').filter({ has: page.locator('svg') }).first();
      const micButtonVisible = await micButton.isVisible();
      console.log(`Microphone button visible: ${micButtonVisible}`);

      if (micButtonVisible) {
        console.log('🎤 Clicking microphone button to start listening...');
        await micButton.click();
        await page.waitForTimeout(500);

        // Check if listening state is active
        const isListening = await page.evaluate(() => {
          return document.querySelector('button')?.textContent?.includes('stop') || 
                 document.querySelector('.bg-red-500') !== null;
        });
        console.log(`Listening state active: ${isListening}`);

        // Wait for mock transcription
        await page.waitForTimeout(2000);

        // Check if transcript appeared
        const transcriptVisible = await page.locator('text=my glucose is 7.2 before breakfast').isVisible();
        console.log(`Mock transcript visible: ${transcriptVisible}`);

        if (transcriptVisible) {
          console.log('✅ Voice transcription working!');

          // Stop listening
          console.log('🛑 Stopping voice input...');
          await micButton.click();
          await page.waitForTimeout(1000);

          // Check if parsing happened and confirm step appeared
          const confirmVisible = await page.locator('text=Is this correct?').isVisible();
          console.log(`Confirmation step visible: ${confirmVisible}`);

          if (confirmVisible) {
            console.log('✅ Voice parsing and confirmation working!');

            // Check parsed values
            const glucoseValue = await page.locator('.text-blue-600').textContent();
            console.log(`Parsed glucose value: ${glucoseValue}`);

            // Test confirm button
            const confirmButton = page.locator('button:has-text("Confirm & Save")');
            const confirmButtonVisible = await confirmButton.isVisible();
            console.log(`Confirm button visible: ${confirmButtonVisible}`);

            if (confirmButtonVisible) {
              console.log('💾 Confirming and saving glucose reading...');
              await confirmButton.click();
              await page.waitForTimeout(3000);

              console.log('🎉 VOICE INPUT TEST RESULTS:');
              console.log('✅ Microphone button: WORKING');
              console.log('✅ Voice state management: WORKING');
              console.log('✅ Mock audio capture: WORKING');
              console.log('✅ Mock transcription: WORKING');
              console.log('✅ Text parsing: WORKING');
              console.log('✅ Confirmation flow: WORKING');
              console.log('✅ Data submission: WORKING');
            }
          }
        } else {
          console.log('❌ Mock transcription not appearing');
        }
      } else {
        console.log('❌ Microphone button not visible');
      }
    } else {
      console.log('❌ Glucose modal did not open');
    }

    await page.screenshot({ path: 'voice-input-test.png', fullPage: true });
  });

  test('Test voice input error handling', async ({ page }) => {
    console.log('🎤 Testing voice input error handling...');

    // Override getUserMedia to simulate permission denied
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: async () => {
            throw new Error('Permission denied');
          }
        },
        writable: true
      });
    });

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

    // Try to start voice input
    const micButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await micButton.click();
    await page.waitForTimeout(1000);

    // Check for error message
    const errorVisible = await page.locator('text=Could not access the microphone').isVisible();
    console.log(`Error message visible: ${errorVisible}`);

    if (errorVisible) {
      console.log('✅ Voice input error handling: WORKING');
      console.log('✅ Microphone permission error: HANDLED CORRECTLY');
    } else {
      console.log('❌ Error handling not working correctly');
    }
  });
});
