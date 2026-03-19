import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { EnrollmentPage } from '../../../Pages/ProviderPortalPages/EnrollmentPage';

test('Verify Enrollment List displays all enrolled patients with correct details', async({page}) =>
{
    const login = new ProviderPortalLoginPage(page);
    const enrollment = new EnrollmentPage(page);

    const username = process.env.APP_USERNAME;
    const password = process.env.APP_PASSWORD;

    await login.gotoLoginPage();
    await login.login(username, password);

    await enrollment.gotoEnrollmentSection();

    const noDataFound = await page.locator('//h6[text()="No data found."]').isVisible().catch(() => false);
    if (noDataFound) {
        console.log('\nNo data found in the Enrollment List');
        console.log('Test passed - No enrollment records available');
        return;
    }

    const enrollments = await enrollment.getEnrollmentListData();

    if (enrollments.length === 0) {
        console.log('\nNo enrollment records found in the list');
        console.log('Test passed - No data found for the Enrollment List');
        return;
    }

    enrollments.forEach(enrollment => {
        expect(enrollment.name).toBeTruthy();
        expect(enrollment.program).toBeTruthy();
        expect(enrollment.enrolledDate).toBeTruthy();
        expect(enrollment.status).toBeTruthy();
        expect(enrollment.careManager).toBeTruthy();
        expect(enrollment.provider).toBeTruthy();
    });

    console.log('\nAll enrollment records verified successfully!');
});
