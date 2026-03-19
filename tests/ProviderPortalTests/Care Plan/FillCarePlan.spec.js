import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { CarePlanPage } from '../../../Pages/ProviderPortalPages/CarePlanPage';

test('Modify Care Plan from Worklist using POM flow', async ({ page }) => {
  test.setTimeout(0); // No timeout limit — processes all ~500 patients

  const login = new ProviderPortalLoginPage(page);
  const carePlan = new CarePlanPage(page);

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  expect(username, 'APP_USERNAME must be set').toBeTruthy();
  expect(password, 'APP_PASSWORD must be set').toBeTruthy();

  await login.gotoLoginPage();
  await login.login(username, password);

  // Collect all patient names by scrolling through the entire infinite-scroll list
  await carePlan.gotoCarePlanInProgressSection();
  const allPatientNames = await carePlan.getAllCarePlanInProgressPatientNames();

  // Skip first 95 patients — already processed in previous runs
  const patientNames = allPatientNames.slice(95);
  expect(patientNames.length, 'No patient rows found in Care Plan in Progress beyond the skipped patients').toBeGreaterThan(0);
  console.log(`Total patients: ${allPatientNames.length}. Skipping first 95. Processing: ${patientNames.length}`);
  let successCount = 0;

  for (let i = 0; i < patientNames.length; i++) {
    const patientName = patientNames[i];
    console.log(`\nProcessing care plan for patient ${i + 1}/${patientNames.length}: ${patientName}`);

    try {
      await carePlan.openPatientByNameFromCarePlanInProgress(patientName);
      await carePlan.openModifyCarePlan();
      await carePlan.fillCarePlanForm();
      const isSaved = await carePlan.finishModifyCarePlan();

      if (isSaved) {
        successCount++;
        console.log(`Care plan updated successfully for: ${patientName}`);
      } else {
        console.log(`Care plan update not confirmed for: ${patientName}`);
      }
    } catch (error) {
      console.log(`Skipping patient due to error: ${patientName} | ${error.message}`);
    }

    try {
      await carePlan.gotoCarePlanInProgressSection();
    } catch (navError) {
      console.log(`Navigation back to worklist failed. Re-navigating via URL. | ${navError.message}`);
      await page.goto(`${process.env.PROVIDER_BASE_URL}/provider/work-list`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await carePlan.gotoCarePlanInProgressSection();
    }
  }

  expect(successCount, 'At least one patient care plan should be updated successfully').toBeGreaterThan(0);
});
