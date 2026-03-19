import { expect } from "@playwright/test";

export class CarePlanPage {
  constructor(page) {
    this.page = page;

    //Locators 
    this.carePlanSection = page.getByRole('button').nth(4);
    this.calendarIcon = page.getByRole('button', { name: /choose date/i });
    this.genrateReportBtn = page.locator('//button[text()="Generate Report"]');
    this.shareWithPatientBtn = page.locator('//button[text()="Share with Patient"]');
    this.successMessage = page.locator('[role="alert"], .MuiSnackbar-root, .MuiAlert-root').first();
    this.documentsTab = page.getByRole('tab', { name: 'Documents' });
    this.carePlanFolder = page.locator("//h6[text()='Care Plan']");
    this.firstCarePlanRecord = page.locator('//div[@class="MuiBox-root css-jl6aty"]').first();

    // Worklist and care plan edit locators
    this.ccmTab = page.getByRole('tab', { name: 'CCM' });
    this.pcmTab = page.getByRole('tab', { name: 'PCM' });
    this.activeSection = page.getByText('Active').first();
    this.careManagerFilter = page.getByRole('combobox', { name: 'Select' }).nth(1);
    this.allCareManagerOption = page.getByRole('option', { name: 'All Care Manager' });
    this.carePlanInProgress = page.getByText('Care Plan in Progress').first();
    this.carePlanInProgressRows = page.locator('//div[@class="css-ag2hkv"]');
    this.workListSection = page.locator('(//span[text()="Work List"])[1]');
    this.carePlanTab = page.getByRole('tab', { name: 'Care Plan' });
    this.managePlanBtn = page.getByRole('button', { name: 'Manage Plan' });
    this.modifyCarePlanOption = page.getByRole('menuitem', { name: 'Modify Care Plan' });
    this.recentVisitsSection = page.locator('//span[text()="Recent Visits/ Interventions"]');
    this.treatmentRecommendationsSection = page.locator('//span[text()="Treatment Recommendations"]');
    this.psychosocialSupportSection = page.locator('//span[text()="Psychosocial Support"]');
    this.psychosocialGoalOptionOne = page.getByRole('checkbox', { name: 'Psychosocial Goal Option 1' });
    this.shortTermGoalsSection = page.locator('//span[text()="Short Term Goals"]');
    this.shortTermGoalOptionOne = page.getByRole('checkbox', { name: 'Short Term Goal Option 1' });
    this.longTermGoalsSection = page.locator('//span[text()="Long Term Goals"]');
    this.longTermAnswerInput = page.getByRole('textbox', { name: 'Enter your answer' }).first();
    this.barrierSection = page.locator('//span[text()="Barrier"]');
    this.medicationSection = page.locator('//span[text()="Medication"]');
    this.addMedicationBtn = page.getByRole('button', { name: 'Add Medication' });
    this.allergiesSection = page.locator('//span[text()="Allergies"]');
    this.addAllergyBtn = page.getByRole('button', { name: 'Add Allergy' });
    this.coordinationOfCareSection = page.locator('//span[text()="Coordination of Care"]');
    this.patientEducationSection = page.locator('//span[text()="Patient Education"]');
    this.followUpSection = page.locator('//span[text()="Follow - Up"]');
    this.followUpGoalOptionOne = page.getByRole('checkbox', { name: 'Follow Up Goal Option 1' });
    this.caregiverQuestionsSection = page.locator('//span[text()="Caregiver Questions/ Concerns"]');
    this.enterNoteInput = page.getByRole('textbox', { name: 'Enter Note' }).first();
    this.finishBtn = page.getByRole('button', { name: 'Finish' });
    this.timeLogDrawer = page.locator('//div[contains(@class,"MuiDrawer-root")]');
    this.modifySuccessToast = page.getByText(/CarePlan Modify Successful/i);
    this.richTextEditors = page.locator('.ql-editor[contenteditable="true"]');

    // Time log drawer locators
    this.timeLogDurationInput = page.locator('//input[@name="duration"]');
    this.timeLogLogAsDropdown = page.locator('//input[@placeholder="Log As"]');
    this.timeLogCarePlanningOption = page.locator('//li[text()="Care Planning"]');
    this.timeLogSaveBtn = page.locator('//h6[text()="Save"]');
  }

    async gotoCarePlan(patientUUID) {
        // Validate UUID format to prevent SSRF
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(patientUUID)) {
            throw new Error('Invalid patient UUID format');
        }
        
        await this.page.waitForTimeout(2000);
        const url = `${process.env.PROVIDER_BASE_URL}/provider/patient/${patientUUID}/care-plan`;
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }

    async generateReportAndShare()
    {
        await expect(this.calendarIcon).toBeVisible({ timeout: 60000 });
        await this.calendarIcon.click();
        await this.page.waitForTimeout(1000);
        
        const firstMonth = this.page.getByRole('radio').first();
        await expect(firstMonth).toBeVisible({ timeout: 30000 });
        const selectedMonth = await firstMonth.getAttribute('aria-label');
        await firstMonth.click();

        const carePlanInput = this.page.locator('//input[contains(@value, "Plan")]').first();
        await expect(carePlanInput).toBeVisible({timeout : 150000});
        const carePlanName = await carePlanInput.getAttribute('value');

        await this.genrateReportBtn.waitFor({ state: 'visible', timeout: 150000 });
        await this.genrateReportBtn.click();

        await expect(this.shareWithPatientBtn).toBeVisible({ timeout: 120000 });
        await expect(this.shareWithPatientBtn).toBeEnabled({ timeout: 120000 });
        await this.shareWithPatientBtn.click();
        
        return { carePlanName: carePlanName.trim(), month: selectedMonth };
    }

    async navigateToDocumentsTab() {
        await expect(this.documentsTab).toBeVisible({ timeout: 30000 });
        await this.documentsTab.click();
        await this.page.waitForTimeout(2000);
    }
    
    async openCarePlanFolder() {
        await expect(this.carePlanFolder).toBeVisible({ timeout: 30000 });
        await this.carePlanFolder.click();
        await this.page.waitForTimeout(3000);
    }

    async getFirstCarePlanRecordName() {
        await expect(this.firstCarePlanRecord).toBeVisible({ timeout: 30000 });
        return await this.firstCarePlanRecord.textContent();
    }

    async openPatientCarePlanFromWorklist(patientName) {
        await this.gotoCarePlanInProgressSection();
        await this.page.getByText(patientName).first().click();
        await this.carePlanTab.click();
    }

    async gotoCarePlanInProgressSection() {
        const isWorkListVisible = await this.workListSection.isVisible().catch(() => false);
        if (isWorkListVisible) {
            await this.workListSection.click({ force: true });
        }
        await this.ccmTab.click();
        await this.activeSection.click();
        await this.careManagerFilter.click();
        await this.allCareManagerOption.click();
        await this.carePlanInProgress.click();
        await this.carePlanInProgressRows.first().waitFor({ state: 'visible', timeout: 20000 });
    }

    async gotoCarePlanInProgressSectionPCM() {
        const isWorkListVisible = await this.workListSection.isVisible().catch(() => false);
        if (isWorkListVisible) {
            await this.workListSection.click({ force: true });
            await this.page.waitForTimeout(3000);
        }
        // Click PCM tab and wait for it to become selected
        await this.pcmTab.waitFor({ state: 'visible', timeout: 10000 });
        await this.pcmTab.click({ force: true });
        await this.page.waitForTimeout(2000);

        // Verify PCM tab is actually selected, retry if not
        const isSelected = await this.pcmTab.getAttribute('aria-selected');
        if (isSelected !== 'true') {
            console.log('PCM tab not selected after first click, retrying...');
            await this.pcmTab.click({ force: true });
            await this.page.waitForTimeout(2000);
        }

        await this.activeSection.click();
        await this.page.waitForTimeout(1000);
        await this.careManagerFilter.click();
        await this.allCareManagerOption.click();
        await this.carePlanInProgress.click();
        await this.carePlanInProgressRows.first().waitFor({ state: 'visible', timeout: 20000 });
    }

    async getCarePlanInProgressPatientNames(limit = 5) {
        const rowCount = await this.carePlanInProgressRows.count();
        const names = [];
        const upperBound = Math.min(limit, rowCount);

        for (let i = 0; i < upperBound; i++) {
            const rowText = (await this.carePlanInProgressRows.nth(i).textContent()) || '';
            const nameMatch = rowText.match(/[A-Za-z]+,\s*[A-Za-z]+/);
            if (nameMatch) {
                names.push(nameMatch[0].trim());
            }
        }

        return [...new Set(names)];
    }

    async getAllCarePlanInProgressPatientNames() {
        const names = [];
        let previousRowCount = 0;
        let scrollIteration = 0;

        while (true) {
            scrollIteration++;
            const currentRowCount = await this.carePlanInProgressRows.count();
            console.log(`[Collect] Scroll iteration ${scrollIteration}: ${currentRowCount} rows loaded.`);

            // Extract names from newly loaded rows only
            for (let i = previousRowCount; i < currentRowCount; i++) {
                const rowText = (await this.carePlanInProgressRows.nth(i).textContent()) || '';
                const nameMatch = rowText.match(/[A-Za-z]+,\s*[A-Za-z]+/);
                if (nameMatch) {
                    names.push(nameMatch[0].trim());
                }
            }

            // Scroll last row into view to trigger next API call
            if (currentRowCount > 0) {
                const lastRow = this.carePlanInProgressRows.nth(currentRowCount - 1);
                await lastRow.evaluate(el => el.scrollIntoView({ block: 'end', behavior: 'instant' }));
                await this.page.waitForTimeout(3000);
            }

            const newRowCount = await this.carePlanInProgressRows.count();

            // No new rows loaded — end of list reached
            if (newRowCount === currentRowCount) {
                console.log(`All records loaded. Total rows: ${newRowCount}, Patient names collected: ${names.length}`);
                break;
            }

            previousRowCount = currentRowCount;
        }

        const uniqueNames = [...new Set(names)];
        console.log(`Unique patients found: ${uniqueNames.length}`);
        return uniqueNames;
    }

    async findPatientWithInfiniteScroll(patientName) {
        let scrollIteration = 0;
        let previousRowCount = 0;

        while (true) {
            scrollIteration++;
            const currentRowCount = await this.carePlanInProgressRows.count();

            if (scrollIteration > 1) {
                console.log(`[Find] Scroll iteration ${scrollIteration}: ${currentRowCount} rows loaded.`);
            }

            // Search only the newly loaded rows for the patient
            for (let i = previousRowCount; i < currentRowCount; i++) {
                const row = this.carePlanInProgressRows.nth(i);
                const rowText = (await row.textContent()) || '';

                if (rowText.includes(patientName)) {
                    console.log(`Patient "${patientName}" found at row ${i + 1} (scroll iteration ${scrollIteration}).`);
                    // Use evaluate for scrolling — it's synchronous and won't hang like scrollIntoViewIfNeeded()
                    await row.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
                    await this.page.waitForTimeout(500);
                    // Try clicking the patient name text within the row first, fallback to row click
                    try {
                        await row.getByText(patientName).first().click({ timeout: 10000 });
                    } catch {
                        console.log('Row text click failed, clicking row directly.');
                        await row.click({ force: true, timeout: 10000 });
                    }
                    return;
                }
            }

            // Patient not found in current batch — scroll to load more
            if (currentRowCount > 0) {
                const lastRow = this.carePlanInProgressRows.nth(currentRowCount - 1);
                await lastRow.evaluate(el => el.scrollIntoView({ block: 'end', behavior: 'instant' }));
                await this.page.waitForTimeout(3000);
            }

            const newRowCount = await this.carePlanInProgressRows.count();

            // No new rows loaded — end of list, patient not found
            if (newRowCount === currentRowCount) {
                throw new Error(`Patient "${patientName}" not found after scrolling through all ${currentRowCount} records.`);
            }

            previousRowCount = currentRowCount;
        }
    }

    async openPatientByNameFromCarePlanInProgress(patientName) {
        await this.findPatientWithInfiniteScroll(patientName);
        await this.carePlanTab.waitFor({ state: 'visible', timeout: 30000 });
        await this.carePlanTab.click();
    }

    async openModifyCarePlan() {
        await this.managePlanBtn.click();
        await this.modifyCarePlanOption.click();
    }

    async fillSectionRichText(sectionLocator, textValue) {
        const sectionOpened = await this.clickFirstVisible(sectionLocator);
        if (!sectionOpened) {
            console.log('Section not visible. Skipping rich text fill for this section.');
            return false;
        }

        await this.page.waitForTimeout(500);
        let targetEditor = await this.getVisibleRichTextEditor();

        if (!targetEditor) {
            // Some sections render editor only after a second toggle/click.
            await this.clickFirstVisible(sectionLocator);
            await this.page.waitForTimeout(500);
            targetEditor = await this.getVisibleRichTextEditor();
        }

        if (!targetEditor) {
            console.log('No visible rich text editor found for this section. Skipping section.');
            return false;
        }

        // Skip if the editor already has content
        const existingContent = (await targetEditor.textContent()).trim();
        if (existingContent.length > 0) {
            console.log('Rich text editor already has content. Skipping this section.');
            return false;
        }

        await targetEditor.click();
        await targetEditor.press('Control+A');
        await targetEditor.fill(textValue);
        return true;
    }

    async clickFirstVisible(locator, timeout = 10000) {
        await this.page.waitForTimeout(300);
        const count = await locator.count();
        for (let i = 0; i < count; i++) {
            const item = locator.nth(i);
            const isVisible = await item.isVisible().catch(() => false);
            if (isVisible) {
                await item.scrollIntoViewIfNeeded().catch(() => {});
                await item.click();
                return true;
            }
        }
        const fallback = locator.first();
        if (await fallback.isVisible({ timeout }).catch(() => false)) {
            await fallback.scrollIntoViewIfNeeded().catch(() => {});
            await fallback.click();
            return true;
        }
        return false;
    }

    async checkIfVisible(checkboxLocator) {
        const count = await checkboxLocator.count();
        for (let i = 0; i < count; i++) {
            const checkbox = checkboxLocator.nth(i);
            const isVisible = await checkbox.isVisible().catch(() => false);
            if (isVisible) {
                await checkbox.check();
                return true;
            }
        }
        return false;
    }

    async getVisibleRichTextEditor() {
        const editorCount = await this.richTextEditors.count();
        for (let i = editorCount - 1; i >= 0; i--) {
            const editor = this.richTextEditors.nth(i);
            const isVisible = await editor.isVisible().catch(() => false);
            if (isVisible) {
                return editor;
            }
        }

        const fallbackTextareas = this.page.locator('//textarea');
        const textareaCount = await fallbackTextareas.count();
        for (let i = 0; i < textareaCount; i++) {
            const textarea = fallbackTextareas.nth(i);
            const isVisible = await textarea.isVisible().catch(() => false);
            if (isVisible) {
                return textarea;
            }
        }

        return null;
    }

    async addNotes(addButtonLocator, values) {
        for (const value of values) {
            // Skip if this note already exists on the page
            const existingNote = this.page.getByText(value, { exact: true }).first();
            if (await existingNote.isVisible().catch(() => false)) {
                console.log(`Note "${value}" already exists. Skipping.`);
                continue;
            }
            await this.enterNoteInput.click();
            await this.enterNoteInput.fill(value);
            await addButtonLocator.click();
        }
    }

    async fillCarePlanForm() {
        const richTextContent = [
            'Achieve optimal control of the patient primary condition.',
            'Reduce severity and frequency of symptoms.',
            'Prevent disease progression and complications.',
            'Improve quality of life through effective treatment strategies.'
        ].join('\n');

        await this.fillSectionRichText(this.recentVisitsSection, richTextContent);
        await this.fillSectionRichText(this.treatmentRecommendationsSection, richTextContent);

        if (await this.clickFirstVisible(this.psychosocialSupportSection)) {
            await this.checkIfVisible(this.psychosocialGoalOptionOne);
        }

        if (await this.clickFirstVisible(this.shortTermGoalsSection)) {
            await this.checkIfVisible(this.shortTermGoalOptionOne);
        }

        if (await this.clickFirstVisible(this.longTermGoalsSection)) {
            const longTermValue = await this.longTermAnswerInput.inputValue().catch(() => '');
            if (longTermValue.trim().length === 0) {
                await this.longTermAnswerInput.fill('Automated long term goal validation');
            } else {
                console.log('Long Term Goals already filled. Skipping.');
            }
        }

        if (await this.clickFirstVisible(this.medicationSection)) {
            await this.addNotes(this.addMedicationBtn, ['Medication note 1', 'Medication note 2']);
        }

        if (await this.clickFirstVisible(this.allergiesSection)) {
            await this.addNotes(this.addAllergyBtn, ['Allergy note 1', 'Allergy note 2']);
        }

        if (await this.clickFirstVisible(this.patientEducationSection)) {
            const educationValue = await this.longTermAnswerInput.inputValue().catch(() => '');
            if (educationValue.trim().length === 0) {
                await this.longTermAnswerInput.fill('Patient education captured from automation');
            } else {
                console.log('Patient Education already filled. Skipping.');
            }
        }

        if (await this.clickFirstVisible(this.followUpSection)) {
            await this.checkIfVisible(this.followUpGoalOptionOne);
        }

        await this.fillSectionRichText(this.caregiverQuestionsSection, richTextContent);
    }

    async checkAllVisibleCheckboxes() {
        const checkboxes = this.page.getByRole('checkbox');
        const count = await checkboxes.count();
        let checked = 0;
        for (let i = 0; i < count; i++) {
            const checkbox = checkboxes.nth(i);
            const isVisible = await checkbox.isVisible().catch(() => false);
            if (isVisible) {
                const isChecked = await checkbox.isChecked().catch(() => false);
                if (!isChecked) {
                    await checkbox.check();
                    checked++;
                }
            }
        }
        console.log(`Multi-select: checked ${checked} checkbox(es).`);
        return checked;
    }

    async selectFirstVisibleOption() {
        // Try radio buttons first
        const radios = this.page.getByRole('radio');
        const radioCount = await radios.count();
        for (let i = 0; i < radioCount; i++) {
            const radio = radios.nth(i);
            const isVisible = await radio.isVisible().catch(() => false);
            if (isVisible) {
                await radio.check();
                console.log('Single-select: selected radio option.');
                return true;
            }
        }
        // Fallback to first unchecked checkbox
        const checkboxes = this.page.getByRole('checkbox');
        const cbCount = await checkboxes.count();
        for (let i = 0; i < cbCount; i++) {
            const cb = checkboxes.nth(i);
            const isVisible = await cb.isVisible().catch(() => false);
            if (isVisible) {
                const isChecked = await cb.isChecked().catch(() => false);
                if (!isChecked) {
                    await cb.check();
                    console.log('Single-select: selected checkbox option.');
                    return true;
                }
            }
        }
        console.log('Single-select: no option found to select.');
        return false;
    }

    async fillCarePlanFormPCM() {
        const richTextContent = [
            'Achieve optimal control of the patient primary condition.',
            'Reduce severity and frequency of symptoms.',
            'Prevent disease progression and complications.',
            'Improve quality of life through effective treatment strategies.'
        ].join('\n');

        // Text sections - fill with rich text
        await this.fillSectionRichText(this.recentVisitsSection, richTextContent);
        await this.fillSectionRichText(this.treatmentRecommendationsSection, richTextContent);
        await this.fillSectionRichText(this.psychosocialSupportSection, richTextContent);

        // Short Term Goals - multi-select (check all visible checkboxes)
        if (await this.clickFirstVisible(this.shortTermGoalsSection)) {
            await this.page.waitForTimeout(500);
            await this.checkAllVisibleCheckboxes();
        }

        // Long Term Goals - single select (select first available option)
        if (await this.clickFirstVisible(this.longTermGoalsSection)) {
            await this.page.waitForTimeout(500);
            await this.selectFirstVisibleOption();
        }

        // Remaining text sections
        await this.fillSectionRichText(this.barrierSection, richTextContent);
        await this.fillSectionRichText(this.medicationSection, richTextContent);
        await this.fillSectionRichText(this.allergiesSection, richTextContent);
        await this.fillSectionRichText(this.coordinationOfCareSection, richTextContent);
        await this.fillSectionRichText(this.patientEducationSection, richTextContent);
        await this.fillSectionRichText(this.followUpSection, richTextContent);
        await this.fillSectionRichText(this.caregiverQuestionsSection, richTextContent);
    }

    async finishModifyCarePlan() {
        console.log('Clicking Finish button...');
        await this.finishBtn.scrollIntoViewIfNeeded();
        await this.finishBtn.click({ timeout: 15000 });

        // Fill and save the time log drawer (appears after clicking Finish)
        await this.fillAndSaveTimeLog();

        // Check for modify success toast after saving the time log
        let isSuccessVisible = false;
        try {
            await this.modifySuccessToast.waitFor({ state: 'visible', timeout: 20000 });
            isSuccessVisible = true;
            console.log('Modify success toast visible.');
        } catch {
            console.log('Modify success toast not visible. Save may have failed for this patient.');
        }

        return isSuccessVisible;
    }

    async fillAndSaveTimeLog() {
        // Wait for the duration input to confirm the time log drawer is open
        try {
            await this.timeLogDurationInput.waitFor({ state: 'visible', timeout: 15000 });
            console.log('Time log drawer detected.');
        } catch {
            console.log('Time log drawer did not appear.');
            return false;
        }

        // Enter duration as 5
        await this.timeLogDurationInput.click();
        await this.timeLogDurationInput.fill('5');
        console.log('Duration set to 5.');

        // Select "Care Planning" from Log As dropdown
        await this.timeLogLogAsDropdown.click();
        await this.timeLogCarePlanningOption.waitFor({ state: 'visible', timeout: 5000 });
        await this.timeLogCarePlanningOption.click();
        console.log('Log As set to Care Planning.');

        // Click Save
        await this.timeLogSaveBtn.click();
        console.log('Time log saved.');
        await this.page.waitForTimeout(2000);
        return true;
    }
}
