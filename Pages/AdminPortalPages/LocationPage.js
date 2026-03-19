export class LocationPage {
  constructor(page, baseurl) {
    this.page = page;
    this.baseurl = baseurl;

    //Locators on the Location Page

    // let locationName = 'Middletown'
    //this.locationText = this.locator(`//span[text()="${locationName}"]`);

    //Add Locators
    this.providerGroupName = page.locator('(//span[@class="MuiTypography-root MuiTypography-title2 css-rxrkbo"])[1]');
    this.locationSection = page.locator('//button[text()="Location"]');
    this.addLocationBtn = page.locator('//span[text()="Add Location"]');
    this.locationNameBox = page.locator('//input[@name="addressName"]');
    this.timeZoneBox = page.getByText("Select Time Zone");
    this.timeZoneSelection = page.locator('//li[text()="EST"]');
    this.saveBtn = page.locator('//h6[text()="Save"]');
    this.locationSaveMsg = page.locator('//div[text()="Address Added successfully"]');

    //Edit Locators
    this.editBtn = page.locator('//button[text()="Edit"]');
    this.addLineOne = page.locator('//input[@name="line1"]');
    this.addLineTwo = page.locator('//input[@name="line2"]');
    this.countryDropdown = page.getByText("Select Country");
    this.countrySelection = page.locator('//li[@data-value="United States"]');
    this.stateDropdown = page.getByText("Select State");
    this.stateSelection = page.locator('//li[@data-value="Delaware"]');
    this.cityBox = page.locator('//input[@name="city"]');
    this.updateBtn = page.locator('//h6[text()="Update"]');
    this.updateSuccessMsg = page.locator('//div[text()="Address updated successfully"]');
  }

  async addLocation(locationName) {
    await this.providerGroupName.click();
    await this.locationSection.click();
    await this.addLocationBtn.click();
    await this.locationNameBox.fill(locationName);
    await this.timeZoneBox.click();
    await this.timeZoneSelection.click();
    await this.saveBtn.click();
    //await this.page.waitForTimeout(1000);
  }

  rowByLocationName(locationName) {
    return this.page.locator(`//span[text()='${locationName}']`);
  }

  actionButtonByLocation(locationName) {
    return this.rowByLocationName(locationName).locator(
      `(//div/span[text()='${locationName}']/ancestor::div/following-sibling::div[3]/div)[1]`,
    );
  }

  async editLocation(locationName, line1, line2, city) {
    await this.actionButtonByLocation(locationName).click();
    await this.editBtn.click();
    await this.addLineOne.fill(line1);
    await this.addLineTwo.fill(line2);
    await this.countryDropdown.click();
    await this.page.waitForTimeout(1000);
    await this.countrySelection.waitFor({ state: 'visible', timeout: 10000 });
    await this.countrySelection.click();
    await this.page.waitForTimeout(2000);
    await this.stateDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.stateDropdown.click();
    await this.page.waitForTimeout(1000);
    await this.stateSelection.waitFor({ state: 'visible', timeout: 10000 });
    await this.stateSelection.click();
    await this.cityBox.fill(city);
    await this.updateBtn.click();
    //await this.page.waitForTimeout(1000);
  }
}
