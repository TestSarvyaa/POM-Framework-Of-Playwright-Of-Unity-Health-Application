export class WorkListpage
{
    constructor(page)
    {
        this.page = page

        //-----------------Patient Creation Section Locators------------------------
        this.enrolmentNewSection = page.locator('//div/div//p[text()="New"]');
        this.newPatientBtn = page.getByRole('button', { name: 'New Patient' });
        this.enterPatientDetailsBtn = page.getByRole('button', { name: 'Enter Patient Details' });
        this.fNameField = page.getByRole('textbox', { name: 'Enter First Name' });
        this.lNameField = page.getByRole('textbox', { name: 'Enter Last Name' });
        this.genderDropdown = page.locator('#mui-component-select-gender')
        this.genderSelection = page.getByText('Male', { exact: true });
        this.datePicker =  page.locator('//button[@aria-label="Choose date"]');
        this.phnNumber = page.locator('#phone');
        this.saveBtn = page.getByRole('button', { name: 'Save & Next' });
        this.yesBtn = page.locator('//button[text()="Yes"]');


        //-------------------Enrollment Section Locators-----------------------------------
        this.serviceDropdown = page.locator('//span[text()="Select Service"]');
        this.enrollmentTypes = [
            'Remote Patient Monitoring (RPM)',
            'Remote Therapeutic Monitoring (RTM)',
            'Chronic Care Management (CCM)',
            'Principal Care Management (PCM)'
        ];
        
        this.selectedEnrollmentType = null;
        
        
        this.providerDropdown = page.getByRole('combobox', { name: 'Search & Select Provider' });
        this.providerSelection = page.locator('//li[text()="Test Automation "]');
        this.careMangerDropdown = page.getByRole('combobox', { name: 'Search & Select Primary Care Manager' });
        this.careManagerSelection = page.locator('//li[text()="Sarvesh Automation "]');
        this.conditionsDropdown = page.getByRole('combobox', { name: 'Search & Select Diagnoses' });
        this.firstConditionSelection = page.locator("//li[@id='tags-standard-option-2']//input[@type='checkbox']");
        this.secondConditionSelection = page.locator("//li[@id='tags-standard-option-6']//input[@type='checkbox']");
        this.addPlanBtn = page.locator('//h6[text()="Add Plan"]'); 
        this.enrollmentAddedSuccessMessage = page.locator('//div[text()="Documents mapped successfully!"]');
        this.patientSelection = page.locator('li:has-text("Patient, Stage ")');
    }
        getRandomEnrollmentType() {
        return this.enrollmentTypes[Math.floor(Math.random() * this.enrollmentTypes.length)];
        }
        

    async patientCreation(firstName, lastName, dob, phoneNumber)
    {
        await this.newPatientBtn.click();
        await this.enterPatientDetailsBtn.click();

        await this.fNameField.fill(firstName);
        await this.lNameField.fill(lastName);

        await this.genderDropdown.click();
        await this.genderSelection.click();

        await this.datePicker.click();
        await this.selectDOB(dob.monthYear, dob.day);
        //Date Picker Logic Starts....
    //     await this.datePicker.click();
    //     const monthyear = 'June 2025';
    //     const dateselect = '9';

    //     while(true)
    // {
    //    const currentMonthyear = await this.page.locator('//div[@class="MuiPickersCalendarHeader-label css-8633fn"]').textContent();
    //  //console.log(currentMonthyear);

    //    if(currentMonthyear== monthyear)
    //    {
    //     break;
    //    }

    // // await page.locator('//a[@title="Next"]').click(); //Clicking on the next button until condition matched
    //    await this.page.getByTestId('ArrowLeftIcon').click(); 

    // }

    // const dates = await this.page.$$('//button[@role="gridcell"]')
    // await this.page.click(`//button[@role="gridcell"][text()='${dateselect}']`) //Selecting the date without looping staement
    //Date Picker Logic Ends...

        await this.phnNumber.fill(phoneNumber);
        await this.saveBtn.click();
        await this.page.waitForTimeout(2000);
        await this.yesBtn.click();

    }

    async enrollmentCreation()
    {
        await this.page.waitForTimeout(1000);
        this.selectedEnrollmentType = this.getRandomEnrollmentType();
       // console.log(`Selected Enrollment: ${this.selectedEnrollmentType}`);
        await this.serviceDropdown.click();
        await this.page.locator(`//li[text()="${this.selectedEnrollmentType}"]`).click();
        await this.providerDropdown.click();
        await this.providerSelection.click();
        await this.careMangerDropdown.click();
        await this.careManagerSelection.click();
        await this.conditionsDropdown.click();
        await this.firstConditionSelection.click();
        await this.secondConditionSelection.click();
        await this.addPlanBtn.click();
        console.log(`Patient has been successfully enrolled in ${this.selectedEnrollmentType}`);
        await this.page.waitForTimeout(2000);
    }


    async selectDOB(monthYear, day) 
    {

    const monthYearLabel = this.page.locator('//div[@class="MuiPickersCalendarHeader-label css-8633fn"]');
    const prevBtn = this.page.locator('//button[@title="Previous month"]');

  for (let i = 0; i < 120; i++) { // max 10 years backward safety
    const currentMonthYear = (await monthYearLabel.textContent())?.trim();

        if (currentMonthYear === monthYear) break;
            await prevBtn.click();
            await this.page.waitForTimeout(150);
        } 
        // const dates = await this.page.$$('//button[@role="gridcell"]')
        // await this.page.locator(`//button[@role="gridcell"][text()='${day}']`).click();

     // Select ONLY enabled day
        const dayButton = this.page.locator(`//button[@role="gridcell" and not(@aria-disabled="true") and text()='${day}']`);
        await dayButton.first().click();
    }   
    
}