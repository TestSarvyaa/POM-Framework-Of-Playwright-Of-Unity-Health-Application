import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { CarePlanPage } from '../../../Pages/ProviderPortalPages/CarePlanPage';

test('Generate and share care plan report', async ({ page }) => {
  const testData = {
    patientUUID: '2ce657c9-671b-463b-99f9-3e1e4b82c81b',
    patientName: 'Prosacco, Cruz',
    year: new Date().getFullYear()
  };

  const login = new ProviderPortalLoginPage(page);
  const carePlan = new CarePlanPage(page);

    // amazonq-ignore-next-line
    const username= process.env.APP_USERNAME;
    const password= process.env.APP_PASSWORD;

    await login.gotoLoginPage();

    await login.login(
        username,
        password
    );

    await carePlan.gotoCarePlan(testData.patientUUID);

    const { carePlanName, month } = await carePlan.generateReportAndShare();
    console.log(`Generated report for: ${carePlanName} (${month})`);

    await page.waitForTimeout(5000);

    // Navigate back to patient page and refresh
    await page.goto(`${process.env.PROVIDER_BASE_URL}/provider/patient/${testData.patientUUID}`, { waitUntil: 'domcontentloaded' });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Navigate to Documents tab
    await carePlan.navigateToDocumentsTab();

    // Open Care Plan folder
    await carePlan.openCarePlanFolder();

    const firstRecordName = await carePlan.getFirstCarePlanRecordName();
    console.log('First Care Plan document:', firstRecordName);

    const allDocuments = await page.locator('//div[@class="MuiBox-root css-jl6aty"]').count();
    console.log('Total Care Plan documents found:', allDocuments);

    const expectedDocumentName = `${carePlanName} (${month} ${testData.year})`;
    expect(firstRecordName).toContain(expectedDocumentName);
});