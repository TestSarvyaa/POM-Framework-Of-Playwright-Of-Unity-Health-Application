import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { CarePlanPage } from '../../../Pages/ProviderPortalPages/CarePlanPage';

test('Modify PCM Care Plan from Worklist using POM flow', async ({ page }) => {
  test.setTimeout(0); // No timeout limit — processes all patients

  const login = new ProviderPortalLoginPage(page);
  const carePlan = new CarePlanPage(page);

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  expect(username, 'APP_USERNAME must be set').toBeTruthy();
  expect(password, 'APP_PASSWORD must be set').toBeTruthy();

  await login.gotoLoginPage();
  await login.login(username, password);

  // Navigate to the PCM tab > Care Plan in Progress section
  await carePlan.gotoCarePlanInProgressSectionPCM();
  const allPatientNames = await carePlan.getAllCarePlanInProgressPatientNames();

  // Skip first 0 patients — adjust this number based on previous run progress
  const skipCount = 0;
  const patientNames = allPatientNames.slice(skipCount);
  expect(patientNames.length, 'No patient rows found in PCM Care Plan in Progress beyond the skipped patients').toBeGreaterThan(0);
  console.log(`Total PCM patients: ${allPatientNames.length}. Skipping first ${skipCount}. Processing: ${patientNames.length}`);
  let successCount = 0;

  for (let i = 0; i < patientNames.length; i++) {
    const patientName = patientNames[i];
    console.log(`\nProcessing PCM care plan for patient ${i + 1}/${patientNames.length}: ${patientName}`);

    try {
      await carePlan.openPatientByNameFromCarePlanInProgress(patientName);
      await carePlan.openModifyCarePlan();
      await carePlan.fillCarePlanFormPCM();
      const isSaved = await carePlan.finishModifyCarePlan();

      if (isSaved) {
        successCount++;
        console.log(`PCM care plan updated successfully for: ${patientName}`);
      } else {
        console.log(`PCM care plan update not confirmed for: ${patientName}`);
      }
    } catch (error) {
      console.log(`Skipping patient due to error: ${patientName} | ${error.message}`);
    }

    // Navigate back to PCM Care Plan in Progress for the next patient
    try {
      await carePlan.gotoCarePlanInProgressSectionPCM();
    } catch (navError) {
      console.log(`Navigation back to worklist failed. Re-navigating via URL. | ${navError.message}`);
      await page.goto(`${process.env.PROVIDER_BASE_URL}/provider/work-list`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await carePlan.gotoCarePlanInProgressSectionPCM();
    }
  }

  expect(successCount, 'At least one PCM patient care plan should be updated successfully').toBeGreaterThan(0);
});
