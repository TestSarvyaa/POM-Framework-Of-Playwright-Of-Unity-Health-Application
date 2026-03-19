import { expect } from "@playwright/test";

export class Patient360Document {
  constructor(page) {
    this.page = page;

    // Document Section Locators
    this.documentsSection = page.locator('//button[text()="Documents"]');
    this.addDocumentBtn = page.locator('//span[text()="Add Document"] | //button[contains(text(), "Add Document")]').first();
    this.tagDropdown = page.locator('#mui-component-select-documentType');
    this.educationTag = page.locator('//li[text()="Education"]');
    this.specialityDropdown = page.locator('#mui-component-select-specialitySet');
    this.firstSpeciality = page.locator('//h6[text()="Audiologist"]');
    this.documentNameInput = page.locator('//input[@name="fileName"]');
    this.fileInput = page.locator('//input[@type="file"]');
    this.fileCrossBtn = page.locator('svg[data-testid="CloseIcon"]').first();
    this.shareWithPatientCheckbox = page.locator('//input[@name="shareWithAllPatient"]');
    this.uploadBtn = page.locator('//button[text()="Upload"] | //button[@type="submit"]').first();
    this.successMessage = page.locator('//div[contains(text(), "successfully") or contains(text(), "Success")]');
  }

  async clickDocumentsSection() {
    await expect(this.documentsSection).toBeVisible({ timeout: 30000 });
    await this.documentsSection.click();
    await this.page.waitForTimeout(1000);
  }

  async addDocument(documentName, filePath) {
    await this.addDocumentBtn.click();
    await this.page.waitForTimeout(1000);

    // Select Tag - Education
    await this.tagDropdown.click();
    await this.educationTag.click();
    await this.page.waitForTimeout(500);

    // Select Speciality - First option
    await this.specialityDropdown.click();
    await this.firstSpeciality.click();
    await this.page.waitForTimeout(500);

    // Enter document name
    await this.documentNameInput.fill(documentName);

    // Upload file
    await this.fileInput.setInputFiles(filePath);
    
    // Wait for file to be fully uploaded (cross button appears)
    await expect(this.fileCrossBtn).toBeVisible({ timeout: 10000 });

    // Check Share with Patient
    await this.shareWithPatientCheckbox.check();

    // Click Upload
    await this.uploadBtn.click();
  }

  async getSuccessMessage() {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
    return await this.successMessage.textContent();
  }

  async verifyDocumentInEducationSection(documentName) {
    // Wait for documents section to refresh
    await this.page.waitForTimeout(2000);
    
    // Try to locate and expand Education folder if it exists
    const educationFolder = this.page.locator('//h6[text()="Education"]');
    const isVisible = await educationFolder.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      await educationFolder.click();
      await this.page.waitForTimeout(1000);
    }
    
    // Verify document exists in Education section
    const documentRecord = this.page.locator(`//div[contains(text(), "${documentName}")]`);
    await expect(documentRecord).toBeVisible({ timeout: 10000 });
    return documentRecord;
  }
}
