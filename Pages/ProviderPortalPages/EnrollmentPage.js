export class EnrollmentPage
{
    constructor(page)
    {
        this.page = page;
        this.enrolmentSection = page.locator('li').filter({ hasText: 'Enrollments' }).first();
        this.addEnrolmentBtn =  page.locator('(//button[@tabindex="0"])[5]');
        this.patientDrodown = page.locator('//input[@placeholder="Search"]') //firstly click and then fill
        const pName = "AutoTwo, Patient "
        this.patientSelection = page.locator(`li:has-text("${pName}")`);
     //   this.serviceDropdown = page.getByText('Select Service', { exact: true })

        //Enrollment Section Locators
        this.serviceDropdown = page.locator('//span[text()="Select Service"]');

        const enrollmentTypes = ['Remote Patient Monitoring (RPM)','Remote Therapeutic Monitoring (RTM)',
                                 'Chronic Care Management (CCM)','Principal Care Management (PCM)']

                                 
        function getRandomEnrollmentType() {
        return enrollmentTypes[Math.floor(Math.random() * enrollmentTypes.length)];
        }
        const serviceType = getRandomEnrollmentType();
        this.serviceSelection = page.locator(`//li[text()="${serviceType}"]`)


      //  this.serviceSelection = page.getByText('Remote Patient Monitoring (RPM)', { exact: true });
        this.providerDropdown = page.getByRole('combobox', { name: 'Search & Select Provider' });
        this.providerSelection = page.locator('//li[text()="Test Automation "]');
        this.careMangerDropdown = page.getByRole('combobox', { name: 'Search & Select Primary Care Manager' });
        this.careManagerSelection = page.locator('//li[text()="Sarvesh Automation "]');
        this.conditionsDropdown = page.getByRole('combobox', { name: 'Search & Select Diagnoses' });
        this.firstConditionSelection = page.locator("//li[@id='tags-standard-option-0']//input[@type='checkbox']");
        this.secondConditionSelection = page.locator("//li[@id='tags-standard-option-2']//input[@type='checkbox']");
        this.addPlanBtn = page.locator('//h6[text()="Add Plan"]'); 
        this.enrollmentAddedSuccessMessage = page.locator('//div[text()="Documents mapped successfully!"]');
    }

    async gotoEnrollmentSection()
    {
        await this.enrolmentSection.click();
    }

    async addEnrollment(patientName)
    {
        await this.addEnrolmentBtn.click();
      //  await this.page.waitForTimeout(3000);
        await this.patientDrodown.click();
        await this.patientDrodown.fill(patientName);    
        await this.patientSelection.click();
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