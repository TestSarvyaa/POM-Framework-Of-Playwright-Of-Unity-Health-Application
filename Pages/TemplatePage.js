export class TemplatePage {
  constructor(page) 
  {
    this.page = page;
    this.addTemplateBtn = page.getByRole('button', { name: 'Add Templates' });
    this.templateName = page.locator('//input[@placeholder="Enter Name"]');
    this.templateContent = page.locator('#templateContent');
    this.saveBtn = page.locator('//button[@type="submit"]');
    this.editBtn = page.locator("//button[text()='Edit']");
    this.deleteBtn = page.locator("//button[text()='Delete']");
   // this.deletePopupBtn = page.getByRole('button', { name: 'Delete' });
    this.deletePopupBtn = page.locator('//button[text() ="Delete"]');
  }

 actionButton(templateName) {
    return this.page.locator(
      `//span[text()='${templateName}']/../following-sibling::div/div/div`
    );
  }

//   actionButton(templateName) {
//   return this.page.locator(
//     `//span[normalize-space()='${templateName}']
//      /ancestor::tr
//      //button[contains(@class,'MuiIconButton-root')]`
//   );
// }

  async addTemplate(name, content) {
    await this.addTemplateBtn.click();
    await this.templateName.fill(name);
    await this.templateContent.fill(content);
    await this.saveBtn.click();
  }

  async editTemplate(oldName,newName) {
    await this.actionButton(oldName).waitFor({state: 'visible'});
    await this.actionButton(oldName).click();

    await this.editBtn.click();

    await this.templateName.fill('');
    await this.templateName.fill(newName);
    await this.saveBtn.click();
  }

  async deleteTemplate(newName)
  {
    await this.actionButton(newName).waitFor({state: 'visible'});
    await this.actionButton(newName).click();

    await this.deleteBtn.click();
    await this.page.waitForTimeout(3000);
    await this.deletePopupBtn.click();
  }
}
