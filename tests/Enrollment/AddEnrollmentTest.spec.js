import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';
import { EnrollmentPage } from '../../Pages/EnrollmentPage';


test('Add Enrollment', async({page}) =>
{
    const patientLName = "KHAN";

    const login = new LoginPage(page);
    const enrolment = new EnrollmentPage(page)

    await login.gotoLoginPage();
    await login.login('stuart123', 'Pass@123');

    await enrolment.gotoEnrollmentSection();

    await enrolment.addEnrollment(
       patientLName
    );

    await expect(enrolment.enrollmentAddedSuccessMessage).toBeVisible();

    console.log("Success Message :--> Patient has been Enrolled in the Program Successfully..");



    //Note :- Change the PatientLName before running the test and make sure to change the locator (patientSelection) as it is hardcoded
})