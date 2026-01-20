import { test, expect } from '@playwright/test';
import {AdminPortalLoginPage} from '../../Pages/AdminPortalPages/AdminPortalLoginPage.js'


test('Login Admin', async ({ page }) => {

    //Creds info 
    const adminUn = process.env.APP_ADMINUSERNAME;
    const adminPwd = process.env.APP_ADMINPASSWORD;

    const adminLogin = new AdminPortalLoginPage(page, process.env.ADMIN_BASE_URL);
    await adminLogin.gotoAdminLoginPage();

    await adminLogin.login(
        adminUn,
        adminPwd,
    );
});