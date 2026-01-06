import { test, expect } from '@playwright/test';
import { LoginPage } from '../../Pages/LoginPage';
import { RPMLibrary } from '../../Pages/RPMLibrary';
import { TemplatePage } from '../../Pages/TemplatePage';

test('Template CRUD Flow', async ({ page }) => {

   const login = new LoginPage(page);
   const dashboard = new RPMLibrary(page);
   const template = new TemplatePage(page);
   const username= process.env.APP_USERNAME;
   const password= process.env.APP_PASSWORD;

   //Template Names 
   const originalName = 'Testing Sarvesh Template';
   const editedName = 'Edited Testing Sarvesh Template';

   await login.gotoLoginPage();

    await login.login(
        username,
        password
    );

    // const username = process.env.USERNAME;
    // const password = process.env.PASSWORD;

    // if (!username || !password) 
    // {
    //     throw new Error('❌ USERNAME or PASSWORD is not defined in env');
    // }

    // await login.login(username, password);



  await dashboard.openRPMLibrary();


  await template.addTemplate(
    originalName,
    'This template is created using Playwright POM frame work.'
  );
  console.log("Template Added Successfully..")

    await page.waitForTimeout(3000);
    await expect(page.getByText(originalName)).toBeVisible();

    await expect(template.actionButton(originalName)).toBeVisible();

    await template.editTemplate(
      originalName,
      editedName
  );

  console.log("Template Updated Successfully..");
  

    await page.waitForTimeout(3000);
    await expect(page.getByText(editedName)).toBeVisible();


    await template.deleteTemplate(
        editedName);

   // await expect(page.getByText(editedName)).not.toBeVisible();
    console.log("Template Deleted Successfully..");
});
