import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';
import { WorkListPage } from '../../Pages/WorkListpage';


test('Patient Onboarding and Enrollment', async({page}) =>
{
    const login = new LoginPage(page);
    const workList = new WorkListPage(page);
    const un= process.env.APP_USERNAME;
    const pwd= process.env.APP_PASSWORD;


    await login.gotoLoginPage();

    await login.login(
        un,pwd
    );

    await workList.patientCreation(
        'Nibbles', 'Rat', '8856011523'
    )

    console.log("Patient has been created Successfully..");
    //await expect(workList.patientSelection).toBeVisible();

    await workList.enrollmentCreation(
    )
    console.log("Enrollment has been created successfully");
});