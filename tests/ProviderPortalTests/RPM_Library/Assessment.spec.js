import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { RPMLibrary } from '../../../Pages/ProviderPortalPages/RPMLibrary';
import { AssessmentPage } from '../../../Pages/ProviderPortalPages/AssessmentPage';

test('Add Assessment', async ({ page }) =>
{

    const previousName = 'A Stage Assessment';
    const newName = 'Edited A Stage Assessment';

    const login = new ProviderPortalLoginPage(page);
    const dashboard = new RPMLibrary(page);
    const assessment = new AssessmentPage(page);

    const assessmentName = "A Stage Assessment";
    const questionOneName = 'Which tool do you use to automate the UI?';
    const optionOne = 'Selenium';
    const optionTwo = 'Playwright';
    const optionThree = 'Cypress';
    const optionFour = 'I do the Manual Testing';
    const questionTwoName = 'How do you used the automation in your project?';
    
    const username= process.env.APP_USERNAME;
    const password= process.env.APP_PASSWORD;

    await login.gotoLoginPage();

    await login.login(
        username,password
    );

    // const username = process.env.USERNAME;
    // const password = process.env.PASSWORD;

    // if (!username || !password) 
    // {
    //     throw new Error('❌ USERNAME or PASSWORD is not defined in env');
    // }

    // await login.login(username, password);


    await dashboard.openRPMLibrary();
    await dashboard.openAssessmentSection();

    //Add Assessment Method
    await assessment.addAssessment(
        assessmentName,
        questionOneName,
        optionOne,
        optionTwo,
        optionThree,
        optionFour,
        questionTwoName
    )
   // await page.waitForTimeout(3000);
    console.log(assessmentName,':--->', 'Assessment has been Successfully Added in the System');
    await expect(assessment.addedAssessmentName(assessmentName)).toBeVisible();

    //Edit Assessment Method
    await assessment.editAssessment(
        previousName,
        newName
    );
    console.log(newName, ':--> ', 'Assessment has been Updated Successfully.');

    //Assign Assessment
    await assessment.assignAssessment();
    await expect(assessment.successMessage).toBeVisible();
    console.log("Assessment has been Assigned to the Patient Successfully.");
})