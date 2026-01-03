import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';
import { RPMLibrary } from '../../Pages/RPMLibrary';
import { AssessmentPage } from '../../Pages/AssessmentPage';

test('Add Assessment', async ({ page }) =>
{

    const previousName = 'Playwright Assessment By Sarvya';
    const newName = 'Edited Playwright Assessment By Sarvya';

    const login = new LoginPage(page);
    const dashboard = new RPMLibrary(page);
    const assessment = new AssessmentPage(page);

    const assessmentName = "Playwright Assessment By Sarvya";
    const questionOneName = 'Which tool do you use to automate the UI?';
    const optionOne = 'Selenium';
    const optionTwo = 'Playwright';
    const optionThree = 'Cypress';
    const optionFour = 'I do the Manual Testing';
    const questionTwoName = 'How do you used the automation in your project?';

    await login.gotoLoginPage();
    await login.login('stuart123', 'Pass@123');

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