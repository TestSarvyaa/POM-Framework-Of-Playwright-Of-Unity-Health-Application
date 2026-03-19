import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage.js';
import { WorkListpage } from '../../../Pages/ProviderPortalPages/WorkListpage.js';
import { PatientDataFactory } from '../../../Utils/PatientDataFactory.js';

for(let i = 1 ; i<=1 ; i++){
test(`Patient Onboarding and Enrollment ${i}`, async({page}) =>
{
    test.setTimeout(120000);
    const login = new ProviderPortalLoginPage(page);
    const workList = new WorkListpage(page);
    const un= process.env.APP_USERNAME;
    const pwd= process.env.APP_PASSWORD;
    expect(un, 'APP_USERNAME must be set').toBeTruthy();
    expect(pwd, 'APP_PASSWORD must be set').toBeTruthy();

    const patient = PatientDataFactory.createPatient();
    console.table({
    Name: `${patient.firstName} ${patient.lastName}`,
    DOB: patient.dob.formatted,
    Phone: patient.phoneNumber
  });

    await login.gotoLoginPage();
    await login.login(un, pwd);

    try {
        await workList.patientCreation(
            patient.firstName,
            patient.lastName,
            patient.dob,
            patient.phoneNumber
        );
        console.log(`✓ Patient ${patient.firstName} ${patient.lastName} created successfully`);
        
        //const patientSelectionVisible = await workList.patientSelection.isVisible().catch(() => false);
       // expect(patientSelectionVisible, 'Patient should be created and visible').toBe(true);

        const selectedEnrollment = await workList.enrollmentCreation();
        expect(selectedEnrollment, 'Enrollment program should be selected').toBeTruthy();
        await expect(workList.enrollmentAddedSuccessMessage, 'Enrollment success message should be visible').toBeVisible();
        console.log(`✓ Patient enrolled successfully in ${selectedEnrollment} program`);
        
        console.log(`✓ Test ${i} completed successfully\n`);
    } catch (error) {
        console.error(`✗ Test ${i} failed: ${error.message}`);
        throw error;
    }
    });
}
