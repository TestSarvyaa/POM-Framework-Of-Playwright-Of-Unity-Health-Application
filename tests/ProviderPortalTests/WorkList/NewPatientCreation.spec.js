import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage.js';
import { WorkListpage } from '../../../Pages/ProviderPortalPages/WorkListpage.js';
import { PatientDataFactory } from '../../../Utils/PatientDataFactory.js';

for(let i = 1 ; i<=1 ; i++){
test(`Patient Onboarding and Enrollment ${i}`, async({page}) =>
{
    const login = new ProviderPortalLoginPage(page);
    const workList = new WorkListpage(page);
    const un= process.env.APP_USERNAME;
    const pwd= process.env.APP_PASSWORD;

    //Extra Added thing 
    const patient = PatientDataFactory.createPatient();
    console.table({
    Name: `${patient.firstName} ${patient.lastName}`,
    DOB: patient.dob.monthYear + ' ' + patient.dob.day,
    Phone: patient.phoneNumber
  });
  //Ended Here

    await login.gotoLoginPage();

    await login.login(
        un,pwd
    );

    await workList.patientCreation(
        // 'Nibbles', 'Rat', '8856011523'
        patient.firstName,
        patient.lastName,
        patient.dob,
        patient.phoneNumber
    )
    console.log(patient.firstName, "Patient has been created Successfully..");
    //await expect(workList.patientSelection).toBeVisible();

    await workList.enrollmentCreation(
    )
    console.log("Enrollment has been created successfully");

    console.log("Executed :- ", `${i}`)
    });

}