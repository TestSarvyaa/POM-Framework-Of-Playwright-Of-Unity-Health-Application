import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';
import { RPMLibrary } from '../../Pages/RPMLibrary';
import { AssessmentPage } from '../../Pages/AssessmentPage';

test('Add Assessment', async ({ page }) =>
{

    const previousName = 'Advanced Assessment';
    const newName = 'Edited Advanced Assessment';

    const login = new LoginPage(page);
    const dashboard = new RPMLibrary(page);
    const assessment = new AssessmentPage(page);

    const assessmentName = "Advanced Assessment";
    const questionOneName = 'Which tool do you use to automate the UI?';
    const optionOne = 'Selenium';
    const optionTwo = 'Playwright';
    const optionThree = 'Cypress';
    const optionFour = 'I do the Manual Testing';
    const questionTwoName = 'How do you used the automation in your project?';

    await login.gotoLoginPage();

    await login.login(
        process.env.APP_USERNAME,
        process.env.APP_PASSWORD
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

    await assessment.editAssessment(
        previousName,
        newName
    );

    console.log(newName, ':--> ', 'Assessment has been Updated Successfully.');

    await assessment.assignAssessment();

    await expect(assessment.successMessage).toBeVisible();

    console.log("Assessment has been Assigned to the Patient Successfully.");
})