import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { EnrollmentPage } from '../../../Pages/ProviderPortalPages/EnrollmentPage';

test.describe('Enrollment Filter Scenarios', () => {
    let login, enrollment, username, password;

    test.beforeEach(async ({ page }) => {
        login = new ProviderPortalLoginPage(page);
        enrollment = new EnrollmentPage(page);
        username = process.env.APP_USERNAME;
        password = process.env.APP_PASSWORD;

        await login.gotoLoginPage();
        await login.login(username, password);
        await enrollment.gotoEnrollmentSection();
    });

    test('1. Verify filter by Enrollment Date - Patients filtered correctly within date range', async () => {
        const { startDate, endDate } = enrollment.getRandomDateRange();
        
        await enrollment.applyDateFilter(startDate, endDate);
        const filteredEnrollments = await enrollment.verifyFilteredResults();

        if (filteredEnrollments.length === 0) {
            console.log('Test completed - No records found for the selected date range');
            return;
        }

        expect(filteredEnrollments.length).toBeGreaterThan(0);

        const recordsToVerify = Math.min(3, filteredEnrollments.length);
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        for (let i = 0; i < recordsToVerify; i++) {
            const enroll = filteredEnrollments[i];
            const enrolledDateParts = enroll.enrolledDate.trim().split('-');
            const enrolledDateObj = new Date(`${enrolledDateParts[2]}-${enrolledDateParts[0]}-${enrolledDateParts[1]}`);
            
            expect(enrolledDateObj >= startDateObj && enrolledDateObj <= endDateObj).toBeTruthy();
            console.log(`Record ${i + 1} Verified: ${enroll.name.trim()} - ${enroll.enrolledDate.trim()} is within range`);
        }
    });

    test('2. Verify filter by Status (New/Active/Closed) - Patients filtered correctly by status', async () => {
        const status = enrollment.getRandomStatus();
        
        await enrollment.applyStatusFilter(status);
        const filteredEnrollments = await enrollment.verifyFilteredResults();

        if (filteredEnrollments.length === 0) {
            console.log('Test completed - No data found for the selected status filter');
            return;
        }

        expect(filteredEnrollments.length).toBeGreaterThan(0);

        const recordsToVerify = Math.min(3, filteredEnrollments.length);
        for (let i = 0; i < recordsToVerify; i++) {
            expect(filteredEnrollments[i].status.trim().toLowerCase()).toBe(status.toLowerCase());
            console.log(`Record ${i + 1} Verified: ${filteredEnrollments[i].name.trim()} - Status: ${filteredEnrollments[i].status.trim()}`);
        }
    });

    test('3. Verify filter by Program (RPM/RTM/CCM) - Patients filtered correctly by program type', async () => {
        const program = enrollment.getRandomProgram();
        const programShort = program.match(/\(([^)]+)\)/)[1];
        
        await enrollment.applyProgramFilter(program);
        const filteredEnrollments = await enrollment.verifyFilteredResults();

        if (filteredEnrollments.length === 0) {
            console.log('Test completed - No data found for the selected program filter');
            return;
        }

        expect(filteredEnrollments.length).toBeGreaterThan(0);

        const recordsToVerify = Math.min(3, filteredEnrollments.length);
        for (let i = 0; i < recordsToVerify; i++) {
            expect(filteredEnrollments[i].program.trim()).toBe(programShort);
            console.log(`Record ${i + 1} Verified: ${filteredEnrollments[i].name.trim()} - Program: ${filteredEnrollments[i].program.trim()}`);
        }
    });

    test('4. Verify filter combination: Date + Program - Correct patients displayed', async () => {
        const { startDate, endDate } = enrollment.getRandomDateRange();
        const program = enrollment.getRandomProgram();
        const programShort = program.match(/\(([^)]+)\)/)[1];
        
        await enrollment.applyDateFilter(startDate, endDate);
        await enrollment.applyProgramFilter(program);
        const filteredEnrollments = await enrollment.verifyFilteredResults();

        if (filteredEnrollments.length === 0) {
            console.log('Test completed - No records found for the selected filters');
            return;
        }

        expect(filteredEnrollments.length).toBeGreaterThan(0);

        const recordsToVerify = Math.min(3, filteredEnrollments.length);
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        for (let i = 0; i < recordsToVerify; i++) {
            const enroll = filteredEnrollments[i];
            const enrolledDateParts = enroll.enrolledDate.trim().split('-');
            const enrolledDateObj = new Date(`${enrolledDateParts[2]}-${enrolledDateParts[0]}-${enrolledDateParts[1]}`);
            
            expect(enroll.program.trim()).toBe(programShort);
            expect(enrolledDateObj >= startDateObj && enrolledDateObj <= endDateObj).toBeTruthy();
            console.log(`Record ${i + 1} Verified: ${enroll.name.trim()} - ${enroll.program.trim()} - ${enroll.enrolledDate.trim()}`);
        }
    });

    test('5. Verify filter combination: Date + Status - Correct patients displayed', async () => {
        const { startDate, endDate } = enrollment.getRandomDateRange();
        const status = enrollment.getRandomStatus();
        
        await enrollment.applyDateFilter(startDate, endDate);
        await enrollment.applyStatusFilter(status);
        const filteredEnrollments = await enrollment.verifyFilteredResults();

        if (filteredEnrollments.length === 0) {
            console.log('Test completed - No records found for the selected filters');
            return;
        }

        expect(filteredEnrollments.length).toBeGreaterThan(0);

        const recordsToVerify = Math.min(3, filteredEnrollments.length);
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        for (let i = 0; i < recordsToVerify; i++) {
            const enroll = filteredEnrollments[i];
            const enrolledDateParts = enroll.enrolledDate.trim().split('-');
            const enrolledDateObj = new Date(`${enrolledDateParts[2]}-${enrolledDateParts[0]}-${enrolledDateParts[1]}`);
            
            expect(enroll.status.trim().toLowerCase()).toBe(status.toLowerCase());
            expect(enrolledDateObj >= startDateObj && enrolledDateObj <= endDateObj).toBeTruthy();
            console.log(`Record ${i + 1} Verified: ${enroll.name.trim()} - ${enroll.status.trim()} - ${enroll.enrolledDate.trim()}`);
        }
    });

    test('6. Verify filter combination: Status + Program - Correct patients displayed', async () => {
        const status = enrollment.getRandomStatus();
        const program = enrollment.getRandomProgram();
        const programShort = program.match(/\(([^)]+)\)/)[1];
        
        await enrollment.applyStatusFilter(status);
        await enrollment.applyProgramFilter(program);
        const filteredEnrollments = await enrollment.verifyFilteredResults();

        if (filteredEnrollments.length === 0) {
            console.log('Test completed - No records found for the selected filters');
            return;
        }

        expect(filteredEnrollments.length).toBeGreaterThan(0);

        const recordsToVerify = Math.min(3, filteredEnrollments.length);
        for (let i = 0; i < recordsToVerify; i++) {
            expect(filteredEnrollments[i].status.trim().toLowerCase()).toBe(status.toLowerCase());
            expect(filteredEnrollments[i].program.trim()).toBe(programShort);
            console.log(`Record ${i + 1} Verified: ${filteredEnrollments[i].name.trim()} - ${filteredEnrollments[i].program.trim()} - ${filteredEnrollments[i].status.trim()}`);
        }
    });

    test('7. Verify filter combination: Date + Status + Program - Correct patients displayed', async () => {
        const { startDate, endDate } = enrollment.getRandomDateRange();
        const status = enrollment.getRandomStatus();
        const program = enrollment.getRandomProgram();
        const programShort = program.match(/\(([^)]+)\)/)[1];
        
        await enrollment.applyDateFilter(startDate, endDate);
        await enrollment.applyStatusFilter(status);
        await enrollment.applyProgramFilter(program);
        const filteredEnrollments = await enrollment.verifyFilteredResults();

        if (filteredEnrollments.length === 0) {
            console.log('Test completed - No records found for the selected filters');
            return;
        }

        expect(filteredEnrollments.length).toBeGreaterThan(0);

        const recordsToVerify = Math.min(3, filteredEnrollments.length);
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        for (let i = 0; i < recordsToVerify; i++) {
            const enroll = filteredEnrollments[i];
            const enrolledDateParts = enroll.enrolledDate.trim().split('-');
            const enrolledDateObj = new Date(`${enrolledDateParts[2]}-${enrolledDateParts[0]}-${enrolledDateParts[1]}`);
            
            expect(enroll.program.trim()).toBe(programShort);
            expect(enroll.status.trim().toLowerCase()).toBe(status.toLowerCase());
            expect(enrolledDateObj >= startDateObj && enrolledDateObj <= endDateObj).toBeTruthy();
            console.log(`Record ${i + 1} Verified: ${enroll.name.trim()} - ${enroll.program.trim()} - ${enroll.status.trim()} - ${enroll.enrolledDate.trim()}`);
        }
    });
});
