import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';
import { EnrollmentPage } from '../../Pages/EnrollmentPage';


test('Add Enrollment', async({page}) =>
{
    const patientLName = "KHAN";

    const login = new LoginPage(page);
    const enrolment = new EnrollmentPage(page)
    const username= process.env.APP_USERNAME;
    const password= process.env.APP_PASSWORD;

    await login.gotoLoginPage();

    await login.login(
        username,password
    );

    await enrolment.gotoEnrollmentSection();

    await enrolment.addEnrollment(
       patientLName
    );

    await expect(enrolment.enrollmentAddedSuccessMessage).toBeVisible();

    console.log("Success Message :--> Patient has been Enrolled in the Program Successfully..");


    //Note :- Change the PatientLName before running the test and make sure to change the locator (patientSelection) as it is hardcoded
})