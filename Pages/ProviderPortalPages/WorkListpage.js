import { expect } from "@playwright/test";

export class WorkListpage
{
    constructor(page)
    {
        this.page = page


        //-----------------------------Global Locators Wich are on the Worklist Page-----------------------
        this.searchBtn = page.locator('//input[@placeholder="Search Patient Name, DOB (MM-DD-YYYY), Phone"]');
        this.patientNameSelecting = page.locator('(//span[@class="MuiTypography-root MuiTypography-title1 css-heqp20"])[1]')



        //-----------------Patient Creation Section Locators------------------------
        this.enrolmentNewSection = page.locator('//div/div//p[text()="New"]');
        this.newPatientBtn = page.getByRole('button', { name: 'New Patient' });
        this.enterPatientDetailsBtn = page.getByRole('button', { name: 'Enter Patient Details' });
        this.fNameField = page.getByRole('textbox', { name: 'Enter First Name' });
        this.lNameField = page.getByRole('textbox', { name: 'Enter Last Name' });
        this.genderDropdown = page.locator('#mui-component-select-gender')
        this.genderSelection = page.getByText('Male', { exact: true });
        this.dobInputs = page.locator('(//input[@placeholder="MM-DD-YYYY"])[2]');
        this.phnNumber = page.locator('#phone');
        this.saveBtn = page.getByRole('button', { name: 'Save & Next' });
        this.yesBtn = page.locator('//button[text()="Yes"]');


        // 'Remote Patient Monitoring (RPM)','Remote Therapeutic Monitoring (RTM)','Principal Care Management (PCM)', 'Chronic Care Management (CCM)'
        //-------------------Enrollment Section Locators-----------------------------------
        this.serviceDropdown = page.locator('//span[text()="Select Service"]');

        this.enrollmentTypes = [
            'Remote Patient Monitoring (RPM)','Remote Therapeutic Monitoring (RTM)',
            'Principal Care Management (PCM)', 'Chronic Care Management (CCM)'
        ];

        
        //'Remote Patient Monitoring (RPM)','Remote Therapeutic Monitoring (RTM)','Principal Care Management (PCM)','Chronic Care Management (CCM)',
        this.selectedEnrollmentType = null;
        
        this.providerDropdown = page.getByRole('combobox', { name: 'Search & Select Provider' });
        this.careMangerDropdown = page.getByRole('combobox', { name: 'Search & Select Primary Care Manager' });
        this.conditionsDropdown = page.getByRole('combobox', { name: 'Search & Select Diagnoses' });
        this.firstConditionSelection = page.locator("//li[@id='tags-standard-option-2']//input[@type='checkbox']");
        this.secondConditionSelection = page.locator("//li[@id='tags-standard-option-6']//input[@type='checkbox']");
        this.addPlanBtn = page.locator('//h6[text()="Add Plan"]'); 
        this.enrollmentAddedSuccessMessage = page.locator('//div[text()="Enrollment Created Successfully"]');
        //this.patientSelection = page.locator('li:has-text("Patient, Stage ")');
    }

    async searchPatient(patienName)
    {            
        await this.searchBtn.fill(patienName);
        await this.patientNameSelecting.click();
    }

    getRandomEnrollmentType() 
    { 
        return this.enrollmentTypes[Math.floor(Math.random() * this.enrollmentTypes.length)];     
    }

    async getVisibleDOBInput()
    {
        const count = await this.dobInputs.count();
        for (let i = 0; i < count; i++) {
            const input = this.dobInputs.nth(i);
            if (await input.isVisible().catch(() => false)) {
                return input;
            }
        }
        throw new Error('DOB input is not visible');
    }

    async selectFirstListboxOption()
    {
        const listOptions = this.page.locator('//ul[@role="listbox"]//li');
        await listOptions.first().waitFor({ state: 'visible', timeout: 10000 });
        await listOptions.first().click();
    }
        
    async patientCreation(firstName, lastName, dob, phoneNumber)
    {
        await expect(this.newPatientBtn).toBeVisible({timeout : 6000})
        await expect(this.newPatientBtn).toBeEnabled();
        await this.newPatientBtn.click();
        await this.enterPatientDetailsBtn.click();

        await this.fNameField.fill(firstName);
        await this.lNameField.fill(lastName);

        await this.genderDropdown.click();
        await this.genderSelection.click();

        const dobInput = await this.getVisibleDOBInput();
        await dobInput.click();
        await dobInput.press('Control+A');
        await dobInput.fill(dob.formatted);
        await dobInput.press('Tab');

        await this.phnNumber.fill(phoneNumber);
        await this.saveBtn.click();
        await this.yesBtn.click();
        // Click Yes button if it appears (optional)
        // const isYesBtnVisible = await this.yesBtn.isVisible({ timeout: 3000 }).catch(() => false);
        // if (isYesBtnVisible) {
        //     await this.yesBtn.click();
        // }

        // await this.serviceDropdown.waitFor({ state: 'visible', timeout: 15000 });
    }

    async enrollmentCreation()
    {
        this.selectedEnrollmentType = this.getRandomEnrollmentType();
        await this.serviceDropdown.waitFor({ state: 'visible', timeout: 15000 });
        await this.serviceDropdown.click();
        await this.page.locator(`//li[text()="${this.selectedEnrollmentType}"]`).first().waitFor({ state: 'visible', timeout: 10000 });
        await this.page.locator(`//li[text()="${this.selectedEnrollmentType}"]`).first().click();
        
        await this.providerDropdown.click();
        const providerOptions = this.page.locator('//ul[@role="listbox"]//li');
        await providerOptions.first().waitFor({ state: 'visible', timeout: 10000 });
        const selectedProvider = (await providerOptions.first().textContent()) || '';
        await providerOptions.first().click();
        
        await this.careMangerDropdown.click();
        const careManagerOptions = this.page.locator('//ul[@role="listbox"]//li');
        await careManagerOptions.first().waitFor({ state: 'visible', timeout: 10000 });
        const selectedCareManager = (await careManagerOptions.first().textContent()) || '';
        await careManagerOptions.first().click();
        
        await this.conditionsDropdown.click();
        const hasFirstCondition = await this.firstConditionSelection.isVisible().catch(() => false);
        const hasSecondCondition = await this.secondConditionSelection.isVisible().catch(() => false);
        if (hasFirstCondition && hasSecondCondition) {
            await this.firstConditionSelection.click();
            await this.secondConditionSelection.click();
        } else {
            // Click checkboxes inside the list items to keep the multi-select dropdown open
            const listOptions = this.page.locator('//ul[@role="listbox"]//li');
            await listOptions.first().waitFor({ state: 'visible', timeout: 10000 });
            await listOptions.nth(0).locator('input').click();
            await this.page.waitForTimeout(500);
            if (await listOptions.nth(1).isVisible().catch(() => false)) {
                await listOptions.nth(1).locator('input').click();
            }
        }
        await this.page.keyboard.press('Escape');
        await this.addPlanBtn.click();
        console.log(`Patient has been successfully enrolled in ${this.selectedEnrollmentType}`);
        console.log(`Provider: ${selectedProvider.trim()}`);
        console.log(`Care Manager: ${selectedCareManager.trim()}`);
        await this.enrollmentAddedSuccessMessage.waitFor({ state: 'visible', timeout: 15000 });
        return this.selectedEnrollmentType;
    }


}
