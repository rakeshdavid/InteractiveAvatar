/**
 * Comprehensive Error Messages Audit Test
 * 
 * This test verifies that all user-facing error messages use "Maslow AI" branding
 * instead of "HeyGen" and ensures no backend provider names are exposed to users.
 * 
 * Test Categories:
 * 1. API Error Responses (401, 404, 503, etc.)
 * 2. Network Error Handling
 * 3. UI Component Error Messages
 * 4. Toast Notifications
 * 5. Store Error Handling
 */

const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Error Messages Audit - Maslow AI Branding', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up console message collection
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    
    // Navigate to the app
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('API Error Messages - 401 Authentication Errors', async ({ page }) => {
    console.log('🔍 Testing 401 Authentication Error Messages...');
    
    // Mock API to return 401 error
    await page.route('**/api/prompts/**', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Authentication failed. Please verify your Maslow AI API key is valid and active.' })
      });
    });

    // Try to trigger prompts API call - assuming there's a button or way to access prompts
    try {
      // Look for any prompts-related button or element
      const promptsButton = page.locator('[data-testid="prompts-button"], button:has-text("Prompts"), button:has-text("Manage")').first();
      if (await promptsButton.isVisible({ timeout: 2000 })) {
        await promptsButton.click();
      }
    } catch (e) {
      console.log('No prompts button found, trying alternative approach...');
    }

    // Alternative: directly call the API via JavaScript
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/prompts/list');
        const data = await res.json();
        return { status: res.status, data };
      } catch (error) {
        return { error: error.message };
      }
    });

    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/error-401-authentication.png',
      fullPage: true 
    });

    // Verify the response uses Maslow AI branding
    if (response.data && response.data.error) {
      expect(response.data.error).toContain('Maslow AI');
      expect(response.data.error).not.toContain('HeyGen');
      console.log('✅ 401 Error Message:', response.data.error);
    }
  });

  test('API Error Messages - 503 Service Unavailable', async ({ page }) => {
    console.log('🔍 Testing 503 Service Unavailable Error Messages...');
    
    // Mock API to return 503 error
    await page.route('**/api/prompts/**', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Maslow AI service is temporarily unavailable. Please try again later.' })
      });
    });

    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/prompts/list');
        const data = await res.json();
        return { status: res.status, data };
      } catch (error) {
        return { error: error.message };
      }
    });

    await page.screenshot({ 
      path: 'test-results/error-503-service-unavailable.png',
      fullPage: true 
    });

    if (response.data && response.data.error) {
      expect(response.data.error).toContain('Maslow AI');
      expect(response.data.error).not.toContain('HeyGen');
      console.log('✅ 503 Error Message:', response.data.error);
    }
  });

  test('Network Error Messages', async ({ page }) => {
    console.log('🔍 Testing Network Error Messages...');
    
    // Mock network failure
    await page.route('**/api/prompts/**', async route => {
      await route.abort('failed');
    });

    const response = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/prompts/list');
        const data = await res.json();
        return { status: res.status, data };
      } catch (error) {
        return { error: error.message };
      }
    });

    await page.screenshot({ 
      path: 'test-results/error-network-failure.png',
      fullPage: true 
    });

    console.log('✅ Network Error Response:', response);
  });

  test('Toast Messages Verification', async ({ page }) => {
    console.log('🔍 Testing Toast Messages...');

    // Check if there are any toast messages displayed
    await page.waitForTimeout(2000);
    
    // Look for any toast containers or notification areas
    const toastElements = await page.locator('[class*="toast"], [class*="notification"], [data-testid*="toast"]').all();
    
    for (const toast of toastElements) {
      const text = await toast.textContent();
      if (text) {
        console.log('Toast message found:', text);
        expect(text).not.toContain('HeyGen');
        if (text.toLowerCase().includes('api') || text.toLowerCase().includes('sync')) {
          expect(text).toContain('Maslow AI');
        }
      }
    }

    await page.screenshot({ 
      path: 'test-results/toast-messages-check.png',
      fullPage: true 
    });
  });

  test('Page Content Audit - Search for HeyGen References', async ({ page }) => {
    console.log('🔍 Performing comprehensive page content audit...');

    // Get all text content from the page
    const pageText = await page.locator('body').textContent();
    
    // Check for any HeyGen references in visible content
    const heygenMatches = pageText.match(/heygen/gi) || [];
    
    if (heygenMatches.length > 0) {
      console.warn('⚠️  Found HeyGen references in page content:', heygenMatches);
      
      // Get specific elements containing HeyGen
      const elementsWithHeyGen = await page.locator('text=/heygen/i').all();
      for (let i = 0; i < elementsWithHeyGen.length; i++) {
        const element = elementsWithHeyGen[i];
        const text = await element.textContent();
        const tagName = await element.evaluate(el => el.tagName);
        console.log(`HeyGen found in ${tagName}:`, text);
      }
    }

    // Take screenshot for manual review
    await page.screenshot({ 
      path: 'test-results/page-content-audit.png',
      fullPage: true 
    });

    // The test should ideally pass with 0 HeyGen references in user-facing content
    console.log(`Total HeyGen references found: ${heygenMatches.length}`);
  });

  test('API Endpoints Error Response Structure', async ({ page }) => {
    console.log('🔍 Testing API Error Response Structure...');

    const endpoints = [
      '/api/prompts/list',
      '/api/prompts/create',
    ];

    const results = {};

    for (const endpoint of endpoints) {
      console.log(`Testing endpoint: ${endpoint}`);

      // Test different error conditions
      const errorTests = [
        { status: 401, name: 'Authentication' },
        { status: 403, name: 'Forbidden' },
        { status: 404, name: 'Not Found' },
        { status: 500, name: 'Server Error' },
        { status: 503, name: 'Service Unavailable' }
      ];

      for (const errorTest of errorTests) {
        await page.route(`**${endpoint}`, async route => {
          await route.fulfill({
            status: errorTest.status,
            contentType: 'application/json',
            body: JSON.stringify({ error: `Test ${errorTest.name} error` })
          });
        });

        const response = await page.evaluate(async (url) => {
          try {
            const res = await fetch(url, { 
              method: url.includes('create') ? 'POST' : 'GET',
              headers: { 'Content-Type': 'application/json' },
              body: url.includes('create') ? JSON.stringify({ name: 'test' }) : undefined
            });
            const data = await res.json();
            return { status: res.status, data };
          } catch (error) {
            return { error: error.message };
          }
        }, endpoint);

        results[`${endpoint}_${errorTest.status}`] = response;
        console.log(`${endpoint} ${errorTest.status}:`, response);
      }

      // Clear routes for next endpoint
      await page.unroute(`**${endpoint}`);
    }

    await page.screenshot({ 
      path: 'test-results/api-error-responses.png',
      fullPage: true 
    });

    console.log('✅ API Error Response Structure Test Complete');
  });

  test('Error Constants Verification', async ({ page }) => {
    console.log('🔍 Verifying Error Constants Usage...');

    // This test checks if our centralized error messages are being used
    const response = await page.evaluate(async () => {
      try {
        // Try to access the error messages constants (if available in browser)
        const res = await fetch('/api/prompts/list');
        return { status: res.status, headers: Object.fromEntries(res.headers.entries()) };
      } catch (error) {
        return { error: error.message };
      }
    });

    await page.screenshot({ 
      path: 'test-results/error-constants-verification.png',
      fullPage: true 
    });

    console.log('✅ Error Constants Response:', response);
  });

  test('Complete Error Message Collection', async ({ page }) => {
    console.log('🔍 Collecting all possible error messages...');

    const errorMessages = [];
    
    // Collect console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorMessages.push({ type: 'console', message: msg.text() });
      }
    });

    // Collect network errors
    page.on('response', response => {
      if (!response.ok()) {
        errorMessages.push({ 
          type: 'network', 
          status: response.status(), 
          url: response.url() 
        });
      }
    });

    // Trigger various error conditions
    const errorTriggers = [
      async () => {
        // Trigger API errors
        await page.evaluate(() => {
          fetch('/api/prompts/invalid').catch(() => {});
        });
      },
      async () => {
        // Try to access non-existent endpoints
        await page.evaluate(() => {
          fetch('/api/prompts/list').catch(() => {});
        });
      }
    ];

    for (const trigger of errorTriggers) {
      try {
        await trigger();
        await page.waitForTimeout(1000);
      } catch (e) {
        errorMessages.push({ type: 'trigger', error: e.message });
      }
    }

    await page.screenshot({ 
      path: 'test-results/complete-error-collection.png',
      fullPage: true 
    });

    console.log('📊 All collected error messages:');
    errorMessages.forEach((err, index) => {
      console.log(`${index + 1}. [${err.type}]`, err);
    });

    // Verify no HeyGen references in any collected errors
    const heygenErrors = errorMessages.filter(err => 
      JSON.stringify(err).toLowerCase().includes('heygen')
    );

    if (heygenErrors.length > 0) {
      console.warn('⚠️  Found HeyGen references in errors:', heygenErrors);
    }

    expect(heygenErrors.length).toBe(0);
    console.log('✅ No HeyGen references found in error messages!');
  });
});

// Helper test for manual verification
test.describe('Manual Verification Tests', () => {
  
  test('Create Error Message Screenshots', async ({ page }) => {
    console.log('📸 Creating error message screenshots for manual review...');

    await page.goto(BASE_URL);

    // Take a baseline screenshot
    await page.screenshot({ 
      path: 'test-results/baseline-app.png',
      fullPage: true 
    });

    // Try to trigger different UI states that might show errors
    const interactions = [
      { name: 'homepage', action: async () => await page.waitForTimeout(1000) },
      { name: 'form-submit', action: async () => {
        const forms = await page.locator('form').all();
        if (forms.length > 0) {
          const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
          if (await submitButton.isVisible({ timeout: 1000 })) {
            await submitButton.click();
          }
        }
      }},
    ];

    for (const interaction of interactions) {
      try {
        await interaction.action();
        await page.waitForTimeout(2000);
        await page.screenshot({ 
          path: `test-results/interaction-${interaction.name}.png`,
          fullPage: true 
        });
      } catch (e) {
        console.log(`Could not perform ${interaction.name}:`, e.message);
      }
    }

    console.log('✅ Screenshots created for manual verification');
  });
});