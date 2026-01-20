export class RPMLibrary {
  constructor(page) {
    this.page = page;

    this.rpmLibrary = page.locator('(//span[text()="RPM Library"])[1]');
    this.rtmLibrary = page.locator('(//span[text()="RTM Library"])[1]')
    this.assessmentSection = page.locator('//button[text() ="Assessment"]');
  }

  async openRPMLibrary() {
    await this.rpmLibrary.first().click();
  }

  
  async openRTMLibrary()
  {
    await this.rtmLibrary.first().click();
  }


  async openAssessmentSection()
  {
    await this.assessmentSection.click();
  }
}
