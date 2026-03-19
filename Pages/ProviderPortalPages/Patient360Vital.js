import { expect } from "@playwright/test";

export class Patient360Vital{
  constructor(page) {
    this.page = page;

    //Patient 360 Vitals Section Locator
    this.vitalsSection = page.locator('//button[text()="Vitals"]');
    this.addVitalBtn = page.locator('//span[text()="Add Vital"] | //button[contains(text(), "Add Vital")]').first();
    this.vitalTypeDropdown = page.locator('//input[@placeholder="Select"]');
    this.bloodGlucoseOption = page.locator('//li[text()="Blood Glucose"]');
    this.painScaleOption = page.locator('//li[text()="Pain Scale"]');
    this.patientVitalsText = page.locator('//h6[text()="Patient Vitals"] | //div[text()="Patient Vitals"]').first();
    this.vitalValueInput = page.locator('(//input[@type="text"])[4]');
    this.submitBtn = page.locator('//button[text()="Save"]');
    this.successMessage = page.locator('//div[text()="Vitals Saved Successfully"]');
    
  }

  async clickVitalsSection() {
    await expect(this.vitalsSection).toBeVisible({ timeout: 30000 });
    await this.vitalsSection.click();
    await this.page.waitForTimeout(1000);
  }

  async addVital(vitalType) {
    await this.addVitalBtn.click();
    await this.page.waitForTimeout(1000);
    await this.vitalTypeDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.vitalTypeDropdown.click();
    
    if (vitalType === 'Blood Glucose') {
      await this.bloodGlucoseOption.click();
      await this.page.waitForTimeout(1500);
      await this.vitalValueInput.waitFor({ state: 'visible', timeout: 10000 });
      const randomValue = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
      await this.vitalValueInput.fill(randomValue.toString());
      return { type: 'Blood Glucose', value: randomValue };
    } else if (vitalType === 'Pain Scale') {
      await this.painScaleOption.click();
      await this.page.waitForTimeout(1500);
      await this.vitalValueInput.waitFor({ state: 'visible', timeout: 10000 });
      const randomValue = Math.floor(Math.random() * 10) + 1;
      await this.vitalValueInput.fill(randomValue.toString());
      return { type: 'Pain Scale', value: randomValue };
    }
  }

  async submitVital() {
    await this.submitBtn.click();
  }

  async getVitalCard(vitalType) {
    return this.page.locator(`//div[contains(text(), "${vitalType}")]`);
  }

  async getVitalValue(vitalType) {
    const vitalCard = this.page.locator(`//div[contains(text(), "${vitalType}")]/following::div[1]`);
    return await vitalCard.textContent();
  }
}