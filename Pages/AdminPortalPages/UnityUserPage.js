export class UnityUserPage{
  constructor(page) {
    this.page = page;

     // Locators
    this.groupName =  page.locator('(//span[@class="MuiTypography-root MuiTypography-title2 css-rxrkbo"])[4]');
    this.unityUserTab = page.locator('//button[text()="Unity Users"]');
    this.addUser = page.locator('//span[text()="Add User"]');
    this.roleDropdown = page.locator('(//div[@tabindex="0"])[4]');
    this.roleSelection = page.locator('//li[text()="Care Coordinators"]');
    this.fName = page.getByRole('textbox', { name: 'First Name' });
    this.lName = page.getByRole('textbox', { name: 'Last Name' });
    this.genderDropdown = page.locator('#mui-component-select-gender');
    this.genderSelection = page.locator('//li[@data-value="MALE"]');
    this.specilityDropdown = page.getByRole('combobox', { name: 'Select Speciality' });
    this.specilitySelection = page.locator('(//input[@data-indeterminate="false"])[4]');
    this.enterEmail = page.locator('//input[@placeholder="Enter Email"]');
    this.enterUserName = page.locator('//input[@placeholder="Username"]');
    this.saveBtn = page.locator('//button[text()="Save"]');
    this.successMessage = page.locator('//h4[@xpath="1"]');
   //this.dobSelection = page.locator('(//input[@placeholder="MM-DD-YYYY"])[1]');
   // this.addedUserName = page.locator('(//span[@class="MuiTypography-root MuiTypography-title2 css-sz23eh"])[1]');
   // this.actionBtn = page.locator('(//span[@class="MuiTypography-root MuiTypography-title2 css-sz23eh"]/../following-sibling::div/div/div/button)[1]');
    this.editBtn = page.locator('//button[text()="Edit"]');
    this.deleteBtn = page.locator('//button[text()="Delete"]');
    this.deletePopUpBtn = page.locator('//button[text()="Delete"]');

  }

        async addUnityUser(firstName, lastName, email, userName)
    {
        await this.groupName.click();
        await this.unityUserTab.click();
        await this.addUser.click();
        await this.roleDropdown.click();
        await this.roleSelection.click();
        await this.fName.fill(firstName);
        await this.lName.fill(lastName);
        await this.genderDropdown.click();
        await this.genderSelection.click();
        await this.specilityDropdown.click();
        await this.specilitySelection.click();
        await this.enterEmail.fill(email);
        await this.enterUserName.fill(userName)
        await this.saveBtn.click();
        await this.page.waitForTimeout(5000);
    }

    // locate user row using unique email
    userRowByEmail(email) {
    return this.page.locator(`//div[text()='${email}']`);
}

  // action button inside THAT user row
      actionButtonByEmail(email) {
      return this.userRowByEmail(email).locator('../following-sibling::div//button');
}
      async deleteUser(email)
      {
        const userRow = this.userRowByEmail(email);
        await this.actionButtonByEmail(email).click();
        //await this.actionBtn.click();
        await this.deleteBtn.click();
        await this.page.waitForTimeout(2000);
        await this.deletePopUpBtn.click();
        await this.page.waitForTimeout(2000);
      }
}