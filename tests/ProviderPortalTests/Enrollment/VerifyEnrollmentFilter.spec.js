import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { EnrollmentPage } from '../../../Pages/ProviderPortalPages/EnrollmentPage';

test('Verify filter by Enrollment Date - Patients filtered correctly within date range', async({page}) =>
{
    const login = new ProviderPortalLoginPage(page);
    const enrollment = new EnrollmentPage(page);

    const username = process.env.APP_USERNAME;
    const password = process.env.APP_PASSWORD;

    const startDate = '01/01/2025';
    const endDate = new Date().toLocaleDateString('en-US');
    const programType = 'RPM';
    const status = 'active';

    await login.gotoLoginPage();
    await login.login(username, password);

    await enrollment.gotoEnrollmentSection();

    await enrollment.applyEnrollmentFilter(startDate, endDate, programType, status);

    const noDataFound = await page.locator('//h6[text()="No data found."]').isVisible().catch(() => false);
    if (noDataFound) {
        console.log(`\nNo data found for filter: Program=${programType}, Status=${status}, Date Range=${startDate} to ${endDate}`);
        console.log('Test passed - No data found for the selected filter criteria');
        return;
    }

    const filteredEnrollments = await enrollment.verifyFilteredResults(programType, status);

    if (filteredEnrollments.length === 0) {
        console.log(`\nNo records found for filter: Program=${programType}, Status=${status}, Date Range=${startDate} to ${endDate}`);
        console.log('Test passed - No data found for the selected filter criteria');
        return;
    }

    const recordsToVerify = Math.min(3, filteredEnrollments.length);
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    for (let i = 0; i < recordsToVerify; i++) {
        const enrollment = filteredEnrollments[i];
        
        const enrolledDateParts = enrollment.enrolledDate.trim().split('-');
        const enrolledDateObj = new Date(`${enrolledDateParts[2]}-${enrolledDateParts[0]}-${enrolledDateParts[1]}`);
        
        expect(enrollment.program.trim()).toBe(programType);
        expect(enrollment.status.trim()).toBe(status);
        expect(enrolledDateObj >= startDateObj && enrolledDateObj <= endDateObj).toBeTruthy();
        
        console.log(`\nRecord ${i + 1} Verified: ${enrollment.name.trim()} - ${enrollment.enrolledDate.trim()} is within range`);
    }

    console.log('\nFilter verification completed successfully!');
});
