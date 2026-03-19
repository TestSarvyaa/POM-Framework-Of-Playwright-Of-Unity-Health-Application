import { expect } from '@playwright/test';

export class EnrollmentPage {
  constructor(page) {
    this.page = page;

    this.enrolmentSection = page.locator('li').filter({ hasText: 'Enrollments' }).first();
    this.addEnrolmentBtn = page.locator('//span[text()="Add Enrollment"]');
    this.patientDrodown = page.locator('//input[@placeholder="Search"]');

    this.serviceDropdown = page.locator('//span[text()="Select Service"]');

    const enrollmentTypes = [
      'Remote Patient Monitoring (RPM)',
      'Remote Therapeutic Monitoring (RTM)',
      'Chronic Care Management (CCM)',
      'Principal Care Management (PCM)'
    ];

    const serviceType =
      enrollmentTypes[Math.floor(Math.random() * enrollmentTypes.length)];

    this.serviceSelection = page.locator(`//li[text()="${serviceType}"]`);

    this.providerDropdown = page.getByRole('combobox', { name: 'Search & Select Provider' });
    this.careMangerDropdown = page.getByRole('combobox', { name: 'Search & Select Primary Care Manager' });
    this.conditionsDropdown = page.getByRole('combobox', { name: 'Search & Select Diagnoses' });

    this.firstConditionSelection = page.locator("//li[@id='tags-standard-option-0']//input");
    this.secondConditionSelection = page.locator("//li[@id='tags-standard-option-2']//input");

    this.addPlanBtn = page.locator('//h6[text()="Add Plan"]');

    // Messages Locators
    this.successMessage = page.locator('//div[contains(@class,"MuiAlert-message")]');
    this.alreadyEnrolledErrorMessage = page.locator(
      '//div[text()="The Patient Is Already Actively Enrolled In This Program."]'
    );

    // Enrollment list
    this.enrollmentListRows = page.locator('//div[@class="css-1hhl13x"]');
    this.enrollmentListContainer = this.enrollmentListRows.first();
    
    // Worklist locators
    this.worklistSection = page.locator('(//span[text()="Work List"])[1]');
    this.careManagerFilterDropdown = page.locator('(//input[@placeholder="Select"])[2]');
    this.allCareManagerOption = page.locator('//li[text()="All Care Manager "]');
    this.newSection = page.locator('//p[text()="New"]');
    const isStage = (process.env.PROVIDER_BASE_URL || '').includes('stage');
    this.worklistSearchBox = isStage
      ? page.locator('//input[@placeholder="Type here to search"]')
      : page.locator('//input[@placeholder="Search by Patient Name"]');
    this.newSectionTable = page.locator('//div[@class="MuiBox-root css-4n39j4"]');
    this.newSectionListRows = this.newSectionTable.locator('> div');

    // Enrollment filter locators
    this.enrollmentTableRows = page.locator('//div[contains(@class,"MuiDataGrid-row")]');
    this.noDataFoundMessage = page.locator('//h6[text()="No data found."]');
    this.startDateFilterInput = page.locator('//input[@placeholder="Start Date"]');
    this.endDateFilterInput = page.locator('//input[@placeholder="End Date"]');
    this.statusFilterDropdown = page.locator('//span[text()="All Status"]');
    this.programFilterDropdown = page.locator('//span[text()="All Program"]');
    this.programOptionRPM = page.locator('//li[text()="Remote Patient Monitoring (RPM)"]');
    this.programOptionRTM = page.locator('//li[text()="Remote Therapeutic Monitoring (RTM)"]');
    this.programOptionCCM = page.locator('//li[text()="Chronic Care Management (CCM)"]');
    this.programOptionPCM = page.locator('//li[text()="Principal Care Management (PCM)"]');
    this.statusOptionActive = page.locator('//li[text()="Active"]');
    this.statusOptionClosed = page.locator('//li[text()="Closed"]');
    this.statusOptionNew = page.locator('//li[text()="New"]');
  }

  async gotoEnrollmentSection() {
    await this.page.waitForTimeout(2000);
    await this.enrolmentSection.click();
  }

  getRandomDateRange() {
    const today = new Date();
    const startBound = new Date(today);
    startBound.setMonth(today.getMonth() - 3);

    const randomStart = new Date(
      startBound.getTime() + Math.random() * (today.getTime() - startBound.getTime())
    );
    const randomEnd = new Date(
      randomStart.getTime() + Math.random() * (today.getTime() - randomStart.getTime())
    );

    const format = (date) => {
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${mm}-${dd}-${yyyy}`;
    };

    return {
      startDate: format(randomStart),
      endDate: format(randomEnd)
    };
  }

  getRandomStatus() {
    const statuses = ['New', 'Active', 'Closed'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  getRandomProgram() {
    const programs = [
      'Remote Patient Monitoring (RPM)',
      'Remote Therapeutic Monitoring (RTM)',
      'Chronic Care Management (CCM)',
      'Principal Care Management (PCM)'
    ];
    return programs[Math.floor(Math.random() * programs.length)];
  }

  async applyEnrollmentFilter(startDate, endDate, programType, status) {
    await this.applyDateFilter(startDate, endDate);
    await this.applyProgramFilter(programType);
    await this.applyStatusFilter(status);
  }

  async setInputValue(locator, value) {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await locator.click({ force: true });

    const isReadOnly = await locator
      .evaluate((el) => el.hasAttribute('readonly') || el.readOnly === true)
      .catch(() => false);

    if (isReadOnly) {
      await locator.evaluate((el, val) => {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }, value);
      return;
    }

    await locator.press('Control+A');
    await locator.press('Backspace');
    await locator.fill(value);
    await locator.press('Tab');
  }

  async applyDateFilter(startDate, endDate) {
    await this.startDateFilterInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.endDateFilterInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.setInputValue(this.startDateFilterInput, startDate);
    await this.setInputValue(this.endDateFilterInput, endDate);
    await this.page.waitForTimeout(1500);
  }

  async applyProgramFilter(program) {
    await this.programFilterDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.programFilterDropdown.click();

    const programValue = program.toUpperCase();
    if (programValue.includes('RPM')) {
      await this.programOptionRPM.click();
    } else if (programValue.includes('RTM')) {
      await this.programOptionRTM.click();
    } else if (programValue.includes('CCM')) {
      await this.programOptionCCM.click();
    } else if (programValue.includes('PCM')) {
      await this.programOptionPCM.click();
    } else {
      throw new Error(`Unsupported program filter value: ${program}`);
    }
    await this.page.waitForTimeout(1000);
  }

  async applyStatusFilter(status) {
    await this.statusFilterDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await this.statusFilterDropdown.click();

    const statusValue = status.toLowerCase();
    if (statusValue === 'active') {
      await this.statusOptionActive.click();
    } else if (statusValue === 'closed') {
      await this.statusOptionClosed.click();
    } else if (statusValue === 'new') {
      await this.statusOptionNew.click();
    } else {
      throw new Error(`Unsupported status filter value: ${status}`);
    }
    await this.page.waitForTimeout(1000);
  }

  async verifyFilteredResults() {
    await Promise.race([
      this.enrollmentTableRows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
      this.noDataFoundMessage.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    ]);

    if (await this.noDataFoundMessage.isVisible().catch(() => false)) {
      return [];
    }

    const noRows = this.page.getByText(/no rows|no records|no data/i).first();
    if (await noRows.isVisible().catch(() => false)) {
      return [];
    }

    const rowCount = await this.enrollmentTableRows.count();
    if (rowCount === 0) {
      return [];
    }

    const enrollments = [];
    for (let i = 0; i < rowCount; i++) {
      const row = this.enrollmentTableRows.nth(i);
      const cells = row.locator('[role="gridcell"]');
      const cellCount = await cells.count();
      if (cellCount < 8) {
        continue;
      }

      enrollments.push({
        name: ((await cells.nth(1).textContent()) || '').trim(),
        program: ((await cells.nth(2).textContent()) || '').trim(),
        enrolledDate: ((await cells.nth(3).textContent()) || '').trim(),
        status: ((await cells.nth(4).textContent()) || '').trim(),
        careManager: ((await cells.nth(6).textContent()) || '').trim(),
        provider: ((await cells.nth(7).textContent()) || '').trim()
      });
    }

    return enrollments;
  }

  async addEnrollment(patientName, { retryOnAlreadyEnrolled = false } = {}) {
    await this.addEnrolmentBtn.waitFor({ state: 'visible', timeout: 15000 });
    await this.addEnrolmentBtn.click();
    await this.page.waitForTimeout(3000);

    await this.patientDrodown.waitFor({ state: 'visible', timeout: 10000 });
    await this.patientDrodown.click({ force: true });
    await this.page.waitForTimeout(2000);

    let selectedPatientName;
    if (patientName) {
      await this.patientDrodown.fill(patientName);
      await this.page.locator(`li:has-text("${patientName}")`).first().click();
      selectedPatientName = patientName;
    } else {
      const searchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      await this.patientDrodown.fill(searchText);
      await this.page.waitForTimeout(3000);
      const patientOptions = this.page.locator('//ul[@role="listbox"]//li');

      try {
        await patientOptions.first().waitFor({ state: 'visible', timeout: 5000 });
      } catch {
        console.log('Patient options not visible, clicking outside and retrying...');
        await this.page.locator('//h5[text()="NEW ENROLLMENT"]').click();
        await this.page.waitForTimeout(1000);
        await this.patientDrodown.click({ force: true });
        await this.page.waitForTimeout(1000);
        await this.patientDrodown.fill(searchText);
        await this.page.waitForTimeout(3000);
        await patientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
      }
      const count = await patientOptions.count();
      const randomIndex = Math.floor(Math.random() * count);
      selectedPatientName = await patientOptions.nth(randomIndex).textContent();
      await patientOptions.nth(randomIndex).click();
    }

    await this.page.waitForTimeout(1000);
    await this.serviceDropdown.click();
    const selectedServiceType = await this.serviceSelection.textContent();
    await this.serviceSelection.click();

    await this.providerDropdown.click();
    await this.page.waitForTimeout(1000);
    const providerOptions = this.page.locator('//ul[@role="listbox"]//li');
    await providerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    const providerCount = await providerOptions.count();
    const randomProviderIndex = Math.floor(Math.random() * providerCount);
    const selectedProvider = await providerOptions.nth(randomProviderIndex).textContent();
    await providerOptions.nth(randomProviderIndex).click();

    await this.page.waitForTimeout(1000);
    await this.careMangerDropdown.click();
    await this.page.waitForTimeout(1000);
    const careManagerOptions = this.page.locator('//ul[@role="listbox"]//li');
    await careManagerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    const careManagerCount = await careManagerOptions.count();
    const randomCareManagerIndex = Math.floor(Math.random() * careManagerCount);
    const selectedCareManager = await careManagerOptions.nth(randomCareManagerIndex).textContent();
    await careManagerOptions.nth(randomCareManagerIndex).click();

    await this.conditionsDropdown.click();
    await this.firstConditionSelection.click();
    await this.secondConditionSelection.click();
    await this.addPlanBtn.click();

    // If retryOnAlreadyEnrolled is enabled, handle "Already Enrolled" by changing only the patient
    if (retryOnAlreadyEnrolled) {
      let result = await this.validateEnrollmentResult();
      let retryCount = 0;
      const maxRetries = 5;

      while (result === 'ALREADY_ENROLLED' && retryCount < maxRetries) {
        retryCount++;
        console.log(`Patient already enrolled in this program. Changing patient only (attempt ${retryCount}/${maxRetries})...`);

        // Form stays open on error — check if patient dropdown is still accessible
        const isFormOpen = await this.patientDrodown.isVisible().catch(() => false);
        if (!isFormOpen) {
          // Safety: if form somehow closed, reopen it
          console.log('Form closed unexpectedly. Reopening...');
          await this.addEnrolmentBtn.waitFor({ state: 'visible', timeout: 15000 });
          await this.addEnrolmentBtn.click();
          await this.page.waitForTimeout(3000);
        }

        selectedPatientName = await this.changePatientInForm();

        // Re-select service type (gets cleared on "Already Enrolled" error)
        await this.page.waitForTimeout(1000);
        await this.serviceDropdown.click();
        await this.serviceSelection.click();
        await this.page.waitForTimeout(500);

        await this.addPlanBtn.click();
        result = await this.validateEnrollmentResult();
      }

      console.log(`Patient: ${selectedPatientName.trim()}`);
      console.log(`Program: ${selectedServiceType.trim()}`);
      console.log(`Provider: ${selectedProvider.trim()}`);
      console.log(`Care Manager: ${selectedCareManager.trim()}`);

      return {
        patientName: selectedPatientName.trim(),
        program: selectedServiceType.trim(),
        provider: selectedProvider.trim(),
        careManager: selectedCareManager.trim(),
        result: result
      };
    }

    console.log(`Patient: ${selectedPatientName.trim()}`);
    console.log(`Program: ${selectedServiceType.trim()}`);
    console.log(`Provider: ${selectedProvider.trim()}`);
    console.log(`Care Manager: ${selectedCareManager.trim()}`);

    return {
      patientName: selectedPatientName.trim(),
      program: selectedServiceType.trim(),
      provider: selectedProvider.trim(),
      careManager: selectedCareManager.trim()
    };
  }

async validateEnrollmentResult() {
  // Wait for any MuiAlert message to appear
  try {
    await this.successMessage.waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    console.log('No success or error message detected.');
    return 'UNKNOWN';
  }

  // Read the actual alert text to determine if it's success or error
  const alertText = (await this.successMessage.textContent().catch(() => '')) || '';
  console.log(`Alert message: ${alertText}`);

  if (alertText.toLowerCase().includes('already') && alertText.toLowerCase().includes('enrolled')) {
    console.log('ERROR: The patient is already enrolled.');
    return 'ALREADY_ENROLLED';
  }

  console.log('SUCCESS: Enrollment completed successfully.');
  return 'SUCCESS';
}

  async changePatientInForm() {
    // Try to click the clear button on the patient autocomplete
    const clearBtn = this.page.locator('button.MuiAutocomplete-clearIndicator').first();
    if (await clearBtn.isVisible().catch(() => false)) {
      await clearBtn.click();
      await this.page.waitForTimeout(500);
    }

    // Click and clear the patient input, then search for a new patient
    await this.patientDrodown.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.patientDrodown.fill('');
    await this.page.waitForTimeout(500);

    const searchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    await this.patientDrodown.fill(searchText);
    await this.page.waitForTimeout(3000);

    const patientOptions = this.page.locator('//ul[@role="listbox"]//li');
    try {
      await patientOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      // If options don't appear, click outside and retry
      await this.page.locator('//h5[text()="NEW ENROLLMENT"]').click();
      await this.page.waitForTimeout(1000);
      await this.patientDrodown.click({ force: true });
      await this.page.waitForTimeout(1000);
      await this.patientDrodown.fill(searchText);
      await this.page.waitForTimeout(3000);
      await patientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
    }

    const count = await patientOptions.count();
    const randomIndex = Math.floor(Math.random() * count);
    const selectedPatientName = await patientOptions.nth(randomIndex).textContent();
    await patientOptions.nth(randomIndex).click();
    await this.page.waitForTimeout(1000);

    console.log(`Changed patient to: ${selectedPatientName.trim()}`);
    return selectedPatientName.trim();
  }

  async getEnrollmentListData() {
    await this.enrollmentListContainer.waitFor({ state: 'visible', timeout: 30000 });

    const rows = await this.enrollmentListRows.count();
    const enrollments = [];

    for (let i = 0; i < rows; i++) {
      const row = this.enrollmentListRows.nth(i);
      const cells = row.locator('> div');

      enrollments.push({
        name: (await cells.nth(1).textContent())?.trim(),
        program: (await cells.nth(2).textContent())?.trim(),
        enrolledDate: (await cells.nth(3).textContent())?.trim(),
        status: (await cells.nth(4).textContent())?.trim(),
        careManager: (await cells.nth(6).textContent())?.trim(),
        provider: (await cells.nth(7).textContent())?.trim()
      });
    }

    return enrollments;
  }

  async verifyPatientInWorklistNew(enrollmentData) {
    const programMap = {
      'Remote Patient Monitoring (RPM)': 'RPM',
      'Remote Therapeutic Monitoring (RTM)': 'RTM',
      'Chronic Care Management (CCM)': 'CCM',
      'Principal Care Management (PCM)': 'PCM'
    };
    
    const programShort = programMap[enrollmentData.program];
    const patientLastName = enrollmentData.patientName.split(',')[0].trim();
    
    const modalBackdrop = this.page.locator('.MuiBackdrop-root');
    if (await modalBackdrop.isVisible().catch(() => false)) {
      await modalBackdrop.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
    
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(2000);
    
    if (await modalBackdrop.isVisible().catch(() => false)) {
      await modalBackdrop.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
    
    await this.worklistSection.click({ force: true });
    await this.page.waitForTimeout(2000);
    
    await this.page.reload();
    await this.page.waitForTimeout(2000);
    
    await this.careManagerFilterDropdown.click();
    await this.page.waitForTimeout(1000);
    await this.allCareManagerOption.click();
    await this.page.waitForTimeout(3000);
    
    const programTabLocator = this.page.locator(`//span[text()="${programShort}"]`);
    await programTabLocator.click();
    await this.page.waitForTimeout(2000);
    
    await this.newSection.click();
    await this.page.waitForTimeout(5000);
    
    await this.worklistSearchBox.waitFor({ state: 'visible', timeout: 30000 });
    await this.worklistSearchBox.click();
    await this.worklistSearchBox.fill(patientLastName);
    await this.page.waitForTimeout(3000);
    
    const rowCount = await this.newSectionListRows.count();
    let patientFound = false;
    
    for (let i = 0; i < rowCount; i++) {
      const row = this.newSectionListRows.nth(i);
      const rowText = await row.textContent();
      
      if (rowText?.includes(patientLastName)) {
        patientFound = true;
        console.log(`✓ Patient "${enrollmentData.patientName}" found in Worklist > ${programShort} > NEW section`);
        break;
      }
    }
    
    expect(patientFound, `Patient "${enrollmentData.patientName}" not found in ${programShort} NEW section`).toBe(true);
  }
}
