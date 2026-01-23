import { test, expect } from "@playwright/test";
import { AdminPortalLoginPage } from "../../Pages/AdminPortalPages/AdminPortalLoginPage.js";
import { InsurancePage } from "../../Pages/AdminPortalPages/InsurancePage.js";

test('Adding Insurance Test', async ({page}) =>
{
    const adminUn = process.env.APP_ADMINUSERNAME;
    const adminPwd = process.env.APP_ADMINPASSWORD;

    const loggedIn = new AdminPortalLoginPage(page, process.env.ADMIN_BASE_URL);
    const insurer = new InsurancePage(page)

    loggedIn.gotoAdminLoginPage();

    await loggedIn.login(adminUn, adminPwd);


        // Helper function
        function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    //Function for Random Location
    const cities = ["Silverside", "Brookhaven", "Lakeside", "Riverview"];
    const suffixes = ["Heights", "Plaza", "Center", "Park"];

    function getRandomLocationSName() {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${city} ${suffix}`;
    }

    const location = getRandomLocationSName(); //This will be passed in the Method

    //Function for Random Insurance Name 
    const insurancePrefixes = ["Silver", "Prime", "Unity", "Trust", "Safe"];
    const insuranceSuffixes = ["Care", "Health", "Coverage", "Assurance"];

    function getRandomInsuranceName() {
    const prefix = getRandomItem(insurancePrefixes);
    const suffix = getRandomItem(insuranceSuffixes);
        return `${prefix} ${suffix}`;
    }

    const insurance = getRandomInsuranceName();   //This will be passed in the Method


    await insurer.addInsurane(insurance, location);

    await expect(insurer.successMsg).toBeVisible();
    console.log(insurance,'insurance has been successfully Added..');
    console.log(location, 'is being added with the insurance..')

    


})