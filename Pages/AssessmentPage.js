export class AssessmentPage{
constructor(page)
    {
        this.page = page;
        this.addAssessmentBtn = page.locator('(//button[@type="button"])[6]');
        this.assessmentTitle = page.locator('//input[@name="assessmentDetails.title"]');
       // this.assessmentType = page.getByText('Assessment type', { exact: true });
        this.assessmentType = page.locator('//div[@role="combobox" and @id="mui-component-select-assessmentDetails.type"]');
        this.assessmentTypeOption = page.locator('//li[@data-value="SURVEY"]');
       // this.assessmentFrequency = page.getByText('Select Frequency', { exact: true });
        this.assessmentFrequency = page.getByText('Select Frequency');
        this.assessmentFrequencyOption = page.locator('//li[@data-value="DAILY"]');
        this.nextBtn = page.getByRole('button', { name: 'Next' });
        this.firstQuestionTitle = page.locator('//input[@placeholder="Enter your question"]');
        this.firstQuestionType = page.getByText('Question Type', { exact: true });
        this.firstQuestionTypeOption = page.locator('//li[@data-value="SINGLE_SELECT"]');
        this.optionOne = page.locator('//input[@id="option-0"]');
        this.addOptionBtn = page.getByRole('button', { name: 'Add Option' });
        this.optionTwo = page.locator('//input[@id="option-1"]');
        this.optionThree = page.locator('//input[@id="option-2"]');
        this.optionFour = page.locator('//input[@id="option-3"]');
        this.addQuestionBtn = page.getByRole('button', { name: 'Add Question' });
        this.secondQuestionTitle = page.locator('(//input[@placeholder="Enter your question"])[2]');
        this.secondQuestionType = page.locator('(//div[@role="combobox"])[2]');
        this.secondQuestionTypeOption = page.locator('//li[@data-value="FREE_TEXT"]');
        this.finishBtn = page.locator('//button[text()="Finish"]');
        this.editAssessmentBtn = page.locator("//button[text()='Edit']");
    }

        addedAssessmentName(name)
    {
        return this.page.locator(`//span[text()='${name}']`);
    }

        actionButton(assessmentTitle)
    {
        return this.page.locator(`//span[text()='${assessmentTitle}']/../following-sibling::div/div/div`);
    }


    async addAssessment(assessmentName, questionOneName, opt1, opt2, opt3, opt4, questionTwoName)
    {
        await this.addAssessmentBtn.click();
        await this.assessmentTitle.fill(assessmentName);
        await this.assessmentType.click();
        await this.assessmentTypeOption.click();
        await this.assessmentFrequency.click();
        await this.assessmentFrequencyOption.click();
        await this.nextBtn.click();
        await this.firstQuestionTitle.fill(questionOneName);
        await this.firstQuestionType.click();
        await this.firstQuestionTypeOption.click();
        await this.optionOne.fill(opt1);
        await this.addOptionBtn.click();
        await this.optionTwo.fill(opt2);
        await this.addOptionBtn.click();
        await this.optionThree.fill(opt3);
        await this.addOptionBtn.click();
        await this.optionFour.fill(opt4);
        await this.addQuestionBtn.click();
        await this.secondQuestionTitle.fill(questionTwoName)
        await this.secondQuestionType.click();
        await this.secondQuestionTypeOption.click()  
        await this.nextBtn.click();
        await this.finishBtn.click();
    }

    async editAssessment(puranaName, nayaName)
    {
        await this.actionButton(puranaName).waitFor({state: 'visible'});
        await this.actionButton(puranaName).click();

        await this.editAssessmentBtn.click();

        await this.assessmentTitle.fill('');
        await this.assessmentTitle.fill(nayaName);
        await this.nextBtn.click();
        await this.page.waitForTimeout(3000);
        await this.nextBtn.click();
        await this.page.waitForTimeout(3000);
        await this.finishBtn.click();
    }
} 