import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { RPMLibrary } from '../../../Pages/ProviderPortalPages/RPMLibrary';
import { TemplatePage } from '../../../Pages/ProviderPortalPages/TemplatePage';


test('Template CRUD Flow', async ({ page }) => {

   const login = new ProviderPortalLoginPage(page);
   const dashboard = new RPMLibrary(page);
   const template = new TemplatePage(page);
   const username= process.env.APP_USERNAME;
   const password= process.env.APP_PASSWORD;


   //Template Names 
   const originalName = 'A RTM Temp';
   const editedName = 'Edited A RTM Temp';

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



  await dashboard.openRTMLibrary();

    //Add Template Method  
    await template.addTemplate(
    originalName,
    'This template is created using Playwright POM frame work.'
  );

    //Assertions for the Add Template
    console.log("Template Added Successfully..")
    await page.waitForTimeout(3000);
    await expect(page.getByText(originalName)).toBeVisible();
    await expect(template.actionButton(originalName)).toBeVisible();

    //Edit Template Method
    await template.editTemplate(
      originalName,
      editedName
  );

    //Assertions for the Edit Template
    console.log("Template Updated Successfully..");
    await page.waitForTimeout(3000);
    await expect(page.getByText(editedName)).toBeVisible();

    //Delete Template Method
    await template.deleteTemplate(editedName);


    //Assertions for the Delete Template
    //await expect(page.getByText(editedName)).not.toBeVisible();
    console.log("Template Deleted Successfully..");
});
