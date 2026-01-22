import { test, expect } from "@playwright/test";
import { AdminPortalLoginPage } from "../../Pages/AdminPortalPages/AdminPortalLoginPage.js";
import { LocationPage } from "../../Pages/AdminPortalPages/LocationPage";

test("Adding Location", async ({ page }) => {
  const adminUn = process.env.APP_ADMINUSERNAME;
  const adminPwd = process.env.APP_ADMINPASSWORD;

  const loggedIn = new AdminPortalLoginPage(page, process.env.ADMIN_BASE_URL);
  const loc = new LocationPage(page);

  loggedIn.gotoAdminLoginPage();

  await loggedIn.login(adminUn, adminPwd);

  //let location = "Dev Facility";
  const cities = ["Silverside", "Brookhaven", "Lakeside", "Riverview"];
  const suffixes = ["Heights", "Plaza", "Center", "Park"];

  function getRandomCityStyleName() {
  const city = cities[Math.floor(Math.random() * cities.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${city} ${suffix}`;
}
 // const location = cities[testInfo.repeatEachIndex % cities.length];
  const location = getRandomCityStyleName();

  await loc.addLocation(location);
  await expect(loc.locationSaveMsg).toBeVisible();
  console.log("Location Added Successfully...");

  await loc.editLocation(location,'Test Location', 'Dev', 'Middletown')
  await expect(loc.updateSuccessMsg).toBeVisible();
  console.log('Location Updated Successfully...');
});
