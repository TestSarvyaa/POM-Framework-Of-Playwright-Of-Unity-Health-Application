export class WorkListPage
{
    constructor(page)
    {
        this.page = page

        //Patient Creation Section Locators
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


        //Enrollment Section Locators
        this.serviceDropdown = page.getByText('Select Service', { exact: true })
        this.serviceSelection = page.getByText('Remote Patient Monitoring (RPM)', { exact: true });
        this.providerDropdown = page.getByRole('combobox', { name: 'Search & Select Provider' });
        this.providerSelection = page.locator('li:has-text("James Anderson")');
        this.careMangerDropdown = page.getByRole('combobox', { name: 'Search & Select Primary Care Manager' });
        this.careManagerSelection = page.locator('li:has-text("Stuart Broad")');
        this.conditionsDropdown = page.getByRole('combobox', { name: 'Search & Select Diagnoses' });
        this.firstConditionSelection = page.locator("//li[@id='tags-standard-option-2']//input[@type='checkbox']");
        this.secondConditionSelection = page.locator("//li[@id='tags-standard-option-6']//input[@type='checkbox']");
        this.addPlanBtn = page.locator('//h6[text()="Add Plan"]'); 
        this.enrollmentAddedSuccessMessage = page.locator('//div[text()="Documents mapped successfully!"]');
        this.patientSelection = page.locator('li:has-text("Patient, Stage ")');
    }


    async patientCreation(firstName, lastName, phoneNumber)
    {
        await this.newPatientBtn.click();
        await this.enterPatientDetailsBtn.click();
        await this.fNameField.fill(firstName);
        await this.lNameField.fill(lastName);
        await this.genderDropdown.click();
        await this.genderSelection.click();

        //Date Picker Logic Starts....
        await this.datePicker.click();
        const monthyear = 'June 2025';
        const dateselect = '9';

        while(true)
    {
       const currentMonthyear = await this.page.locator('//div[@class="MuiPickersCalendarHeader-label css-8633fn"]').textContent();
     //console.log(currentMonthyear);

       if(currentMonthyear== monthyear)
       {
        break;
       }

    // await page.locator('//a[@title="Next"]').click(); //Clicking on the next button until condition matched
       await this.page.getByTestId('ArrowLeftIcon').click(); 

    }

    const dates = await this.page.$$('//button[@role="gridcell"]')
    await this.page.click(`//button[@role="gridcell"][text()='${dateselect}']`) //Selecting the date without looping staement
    //Date Picker Logic Ends...

        await this.phnNumber.fill(phoneNumber);
        await this.saveBtn.click();
        await this.page.waitForTimeout(2000);
        await this.yesBtn.click();

    }

    async enrollmentCreation()
    {
        await this.page.waitForTimeout(3000);
        await this.serviceDropdown.click();
        await this.serviceSelection.click();
        await this.providerDropdown.click();
        await this.providerSelection.click();
        await this.careMangerDropdown.click();
        await this.careManagerSelection.click();
        await this.conditionsDropdown.click();
        await this.firstConditionSelection.click();
        await this.secondConditionSelection.click();
        await this.addPlanBtn.click();
        await this.page.waitForTimeout(3000);
    }
}