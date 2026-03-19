export class ProviderPortalLoginPage{
  constructor(page) {
    this.page = page;

    // Locators
    this.username = page.getByRole('textbox', { name: 'Enter Username' });
    this.password = page.getByRole('textbox', { name: 'Enter Password' });
    this.loginBtn = page.locator('//button[@type="submit"]');
  }

  async gotoLoginPage()
  {
    await this.page.goto(`${process.env.PROVIDER_BASE_URL}/auth/login`);
  }

  async login(username, password) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginBtn.click();
  }
}
