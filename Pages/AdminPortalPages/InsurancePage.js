export class InsurancePage {
  constructor(page, baseurl) {
    this.page = page;
    this.baseurl = baseurl;

    this.providerGroupName = page.locator('span:has-text("Sarvesh Automation Provider Group for Testing")');
    this.insuranceSection = page.locator('//button[text()="Insurance"]');
    this.addInsuranceBtn = page.locator('//span[text()="Add Insurance"]');
    this.inputInsuranceBox = page.locator('//input[@name="insuranceName"]');
    this.insuranceTypeDropdown = page.locator('//input[@placeholder="Select Type"]');
    this.countryDropdown = page.getByText("Select Country");
    this.countrySelection = page.locator('//li[text()="United States"]');
    this.stateDropdown = page.getByText("Select State");
    this.stateSelection = page.locator('//li[text()="Delaware"]');
    this.cityBox = page.locator('//input[@name="addressEntity.city"]');
    this.saveBtn = page.locator('//h6[text()="Save"]');
    this.successMsg = page.locator('//div[text()="Insurance saved successfully"]');


    //Random Insurance selection setup
    const insuranceTypes = ['Medicare ', 'Medicaid ', 'Tricare ', 'Champva ', 'Group Health Plan ', 'Feca ']

    function getRandomInsuranceType() {
    return insuranceTypes[Math.floor(Math.random() * insuranceTypes.length)];
    }   

    const insuranceSelected = getRandomInsuranceType();
    this.insuranceTypeSelection = page.locator(`//li[text()="${insuranceSelected}"]`)
}   

  async addInsurane (insuranceName, city)
  {
    await this.providerGroupName.click();
    await this.insuranceSection.click()
    await this.addInsuranceBtn.click()
    await this.inputInsuranceBox.fill(insuranceName)
    await this.insuranceTypeDropdown.click()
    await this.insuranceTypeSelection.click()
    await this.countryDropdown.click()
    await this.countrySelection.click()
    await this.stateDropdown.click()
    await this.stateSelection.click()
    await this.cityBox.fill(city)
    await this.saveBtn.click();
    await this.page.waitForTimeout(1000);
  }
}