import { test, expect } from '@playwright/test';
import {AdminPortalLoginPage} from '../../Pages/AdminPortalPages/AdminPortalLoginPage.js'
import {UnityUserPage} from '../../Pages/AdminPortalPages/UnityUserPage.js'
import { ProviderDataFactory } from '../../Utils/ProviderDataFactory';

test('Adding Unity User Test', async ({ page }) =>{

    const adminUn = process.env.APP_ADMINUSERNAME;
    const adminPwd = process.env.APP_ADMINPASSWORD;

    const loggedIn = new AdminPortalLoginPage(page, process.env.ADMIN_BASE_URL)
    const unityUser = new UnityUserPage(page);

    await loggedIn.gotoAdminLoginPage();

        await loggedIn.login(
            adminUn,
            adminPwd
        )

    const provider = ProviderDataFactory.createProvider();
    console.table(provider);

    //Add User Method
    await unityUser.addUnityUser(
            provider.firstName,
            provider.lastName,
            provider.email,
            provider.username
    )

   // console.log("Unity User has been Loaded to the System Successfully...");
   // await expect(unityUser.addedUserName).toBeVisible();
    // let name = await providerGroup.addedUser.textContent();
    // console.log(name, "has been created successfully")
    // expect(name).toBe(`${provider.firstName} ${provider.lastName}`);
   // await expect(providerGroup.addedUser).toHaveText(`${provider.firstName} ${provider.lastName}`);
    console.log(`${provider.firstName} ${provider.lastName} user has been created Successfully`);

    //Delete User
   await unityUser.deleteUser(provider.email)
   console.log('User has been deleted Successfully...');
    await expect(unityUser.addedUserName).not.toBeVisible();
   console.log(`${provider.firstName} ${provider.lastName} user has been deleted Successfully`);

})

