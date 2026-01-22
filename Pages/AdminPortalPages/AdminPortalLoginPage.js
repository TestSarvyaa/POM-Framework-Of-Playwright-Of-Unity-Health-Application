export class AdminPortalLoginPage{
  constructor(page, baseurl) {
    this.page = page;
    this.baseurl = baseurl;

    // Locators
    this.adminUsername = page.locator('//input[@placeholder="Enter Username"]');
    this.adminPassword = page.locator('//input[@placeholder="Enter Password"]');
    this.adminLoginBtn = page.locator('//button[@type="submit"]');
    this.advancedBtn = page.locator('//button[@id="details-button"]');
    this.linkBtn = page.locator('//a[@id="proceed-link"]');
  }

  async gotoAdminLoginPage()
  {
    await this.page.goto('https://qa.unityhealth360.com');
    //await this.advancedBtn.click();
    //await this.linkBtn.click();
  }

  async login(username, password) {
    await this.adminUsername.fill(username);
    await this.adminPassword.fill(password);
    await this.adminLoginBtn.click();
  }
}
