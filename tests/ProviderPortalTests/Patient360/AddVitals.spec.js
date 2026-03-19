import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { Patient360Vital } from '../../../Pages/ProviderPortalPages/Patient360Vital';
import { WorkListpage } from '../../../Pages/ProviderPortalPages/WorkListpage';

test('Add vital to patient', async ({ page }) => {
  // Test data
  const testData = {
    patientName: 'Zemlak, Chelsey',
    vitalType: 'Pain Scale' // or 'Blood Glucose'
  };

  const login = new ProviderPortalLoginPage(page);
  const worklist = new WorkListpage(page);
  const vitals = new Patient360Vital(page);

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  // Login
  await login.gotoLoginPage();
  await login.login(username, password);

  // Search patient and navigate to Patient 360
  await worklist.searchPatient(testData.patientName);
  await page.waitForTimeout(3000);

  // Navigate to Vitals section
  await vitals.clickVitalsSection();

  // Add vital
  const vitalData = await vitals.addVital(testData.vitalType);
  console.log(`Adding ${vitalData.type} with value: ${vitalData.value}`);

  // Submit vital
  await vitals.submitVital();

  // Verify success message
  await expect(vitals.successMessage).toBeVisible({ timeout: 10000 });
  console.log('Vital added successfully');
});