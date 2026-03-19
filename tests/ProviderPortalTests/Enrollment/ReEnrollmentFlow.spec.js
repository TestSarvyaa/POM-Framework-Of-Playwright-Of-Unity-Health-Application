import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { EnrollmentPage } from '../../../Pages/ProviderPortalPages/EnrollmentPage';

test('Verify re-enrolled patient appears in Enrollment List with New status', async ({ page }) => {
  test.setTimeout(300000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  const getProgramShort = (program) => program.match(/\(([^)]+)\)/)?.[1] || program;

  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);

  // ── Step 1: Navigate to Enrollment page ──
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(3000);

  // ── Step 2: Apply Closed status filter ──
  await enrollment.applyStatusFilter('Closed');
  await page.waitForTimeout(2000);

  const noData = await page.locator('//h6[text()="No data found."]').isVisible().catch(() => false);
  const enrollmentRows = page.locator('//div[@class="css-1hhl13x"]');
  let hasClosedEnrollment = false;
  let patientName = '';
  let program = '';

  if (!noData) {
    await enrollmentRows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    if (await enrollmentRows.count() > 0) {
      hasClosedEnrollment = true;
      const cells = enrollmentRows.first().locator('> div');
      patientName = (await cells.nth(1).textContent())?.trim();
      program = (await cells.nth(2).textContent())?.trim();
    }
  }

  // ── Step 3 (IF Closed found): Re-Enroll directly ──
  if (hasClosedEnrollment) {
    console.log(`\n=== CLOSED ENROLLMENT FOUND ===`);
    console.log(`Patient: ${patientName} | Program: ${program}`);
  } else {
    // ── Step 4 (IF NOT found): Create New → Move to Active ──
    console.log('\n=== NO CLOSED ENROLLMENT FOUND, CREATING ONE ===');

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await enrollment.gotoEnrollmentSection();
    await page.waitForTimeout(1000);
    const enrollmentData = await enrollment.addEnrollment(null, { retryOnAlreadyEnrolled: true });
    expect(enrollmentData.result, 'Failed to create enrollment').toBe('SUCCESS');
    console.log(`Enrollment created: ${enrollmentData.patientName} | ${enrollmentData.program}`);

    const newPatientLastName = enrollmentData.patientName.split(',')[0].trim();
    const newProgramShort = getProgramShort(enrollmentData.program);

    // Find the new enrollment row and Move to Active
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await enrollment.gotoEnrollmentSection();
    await page.waitForTimeout(2000);
    await enrollment.applyStatusFilter('New');
    await page.waitForTimeout(2000);
    const newRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${newPatientLastName}")]`).first();
    await newRow.waitFor({ state: 'visible', timeout: 15000 });

    const actionBtnNew = newRow.locator('xpath=./div[9]/div');
    await actionBtnNew.click();
    await page.waitForTimeout(1500);
    await page.locator('//button[text()="Move to Active"]').first().click();
    await page.waitForTimeout(1000);
    await page.locator('//button[text()="Move to Active"]').last().click();
    await page.waitForTimeout(3000);
    console.log('Status moved to Active');

    // ── Step 5: Navigate to Worklist → Verify in Active section ──
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await enrollment.worklistSection.click({ force: true });
    await page.waitForTimeout(2000);
    await enrollment.careManagerFilterDropdown.click();
    await page.waitForTimeout(1000);
    await enrollment.allCareManagerOption.click();
    await page.waitForTimeout(2000);
    await page.locator(`//span[text()="${newProgramShort}"]`).click();
    await page.waitForTimeout(1500);
    await page.locator('//p[text()="Active"]').click();
    await page.waitForTimeout(2000);
    await enrollment.worklistSearchBox.waitFor({ state: 'visible', timeout: 10000 });
    await enrollment.worklistSearchBox.fill(newPatientLastName);
    await page.waitForTimeout(2000);

    const activeRows = page.locator('div.MuiBox-root.css-4n39j4 > div');
    const activeRowCount = await activeRows.count();
    let foundInActive = false;
    for (let i = 0; i < activeRowCount; i++) {
      const rowText = (await activeRows.nth(i).textContent()) || '';
      if (rowText.includes(newPatientLastName)) {
        foundInActive = true;
        break;
      }
    }
    expect(foundInActive, 'Patient should be visible in Worklist ACTIVE section').toBe(true);
    console.log('Verified in Worklist Active section');

    // ── Step 6: Navigate back to Enrollment → Close it ──
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await enrollment.gotoEnrollmentSection();
    await page.waitForTimeout(2000);
    await enrollment.applyStatusFilter('Active');
    await page.waitForTimeout(2000);
    const activeEnrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${newPatientLastName}")]`).first();
    await activeEnrollmentRow.waitFor({ state: 'visible', timeout: 15000 });

    const actionBtnActive = activeEnrollmentRow.locator('xpath=./div[9]/div');
    await actionBtnActive.click();
    await page.waitForTimeout(1500);
    await page.locator('//button[text()="Close Enrollment"]').click();
    await page.waitForTimeout(1500);

    const updatedByDropdown = page.locator('//input[@placeholder="Updated By"]');
    await updatedByDropdown.click();
    await page.waitForTimeout(1000);
    const updatedByOptions = page.locator('//li[@data-option-index]');
    await updatedByOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await updatedByOptions.nth(Math.floor(Math.random() * (await updatedByOptions.count()))).click();
    await page.waitForTimeout(500);
    await page.locator('//textarea[@placeholder="Enter Reason"]').fill('Closing enrollment for re-enroll test');
    await page.waitForTimeout(500);
    await page.locator('//h6[text()="Save"]').click();
    await page.waitForTimeout(4000);
    console.log('Enrollment Closed');

    // Refresh and set the closed enrollment details for the re-enroll step
    patientName = enrollmentData.patientName;
    program = enrollmentData.program;

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await enrollment.gotoEnrollmentSection();
    await page.waitForTimeout(2000);
    await enrollment.applyStatusFilter('Closed');
    await page.waitForTimeout(2000);
  }

  // ── Re-Enroll the Closed enrollment ──
  const patientLastName = patientName.split(',')[0].trim();
  console.log(`\n=== RE-ENROLLING: ${patientName} ===`);

  const closedRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await closedRow.waitFor({ state: 'visible', timeout: 10000 });

  const actionButton = closedRow.locator('xpath=./div[9]/div');
  await actionButton.click();
  await page.waitForTimeout(2000);

  const reEnrollOption = page.locator('//button[text()="Re-Enroll"]');
  await reEnrollOption.waitFor({ state: 'visible', timeout: 5000 });
  await reEnrollOption.click();
  await page.waitForTimeout(3000);

  // Fill re-enrollment form
  const providerDropdown = page.getByRole('combobox', { name: 'Search & Select Provider' });
  await providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  await providerOptions.nth(Math.floor(Math.random() * (await providerOptions.count()))).click();
  await page.waitForTimeout(1000);

  const careManagerDropdown = page.getByRole('combobox', { name: 'Search & Select Primary Care Manager' });
  await careManagerDropdown.click();
  await page.waitForTimeout(1000);
  const careManagerOptions = page.locator('//ul[@role="listbox"]//li');
  await careManagerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  await careManagerOptions.nth(Math.floor(Math.random() * (await careManagerOptions.count()))).click();
  await page.waitForTimeout(1000);

  const conditionsDropdown = page.locator('//input[@placeholder="Search & Select Diagnoses"]');
  await conditionsDropdown.click();
  await page.waitForTimeout(1000);
  const diagnosisOptions = page.locator('//ul[@role="listbox"]//li');
  await diagnosisOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const diagCount = await diagnosisOptions.count();
  const numConditions = Math.min(2 + Math.floor(Math.random() * 2), diagCount);
  const selectedIndices = new Set();
  while (selectedIndices.size < numConditions) {
    const idx = Math.floor(Math.random() * diagCount);
    if (!selectedIndices.has(idx)) {
      selectedIndices.add(idx);
      const checkbox = diagnosisOptions.nth(idx).locator('input');
      if (!(await checkbox.isChecked())) {
        await checkbox.click();
        await page.waitForTimeout(500);
      }
    }
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  await page.locator('//h6[text()="Re-Add Plan"]').click();
  await page.waitForTimeout(5000);

  // ── Verify re-enrolled patient in Enrollment List with NEW status ──
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);
  await enrollment.applyStatusFilter('New');
  await page.waitForTimeout(2000);

  const allPatientRows = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`);
  await allPatientRows.first().waitFor({ state: 'visible', timeout: 15000 });
  const rowCount = await allPatientRows.count();

  let foundNew = false;
  for (let i = 0; i < rowCount; i++) {
    const rowText = (await allPatientRows.nth(i).textContent()) || '';
    if (rowText.toLowerCase().includes('new')) {
      foundNew = true;
      console.log(`Row: ${rowText}`);
      break;
    }
  }
  expect(foundNew, 'Re-enrolled patient should have NEW status in Enrollment list').toBe(true);
  console.log(`\nPatient: ${patientName}`);
  console.log(`Status: NEW`);
  console.log('Re-enrollment workflow validated successfully');
});

test('Verify the Activate Enrollment flow - Closed patient directly moves to Active section once enrollment activation is done', async ({ page }) => {
  test.setTimeout(300000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  const getProgramShort = (program) => program.match(/\(([^)]+)\)/)?.[1] || program;

  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);

  // ── Step 1: Navigate to Enrollment page ──
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(3000);

  // ── Step 2: Apply Closed status filter ──
  await enrollment.applyStatusFilter('Closed');
  await page.waitForTimeout(2000);

  const noData = await page.locator('//h6[text()="No data found."]').isVisible().catch(() => false);
  const enrollmentRows = page.locator('//div[@class="css-1hhl13x"]');
  let hasClosedEnrollment = false;
  let patientName = '';
  let program = '';

  if (!noData) {
    await enrollmentRows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    if (await enrollmentRows.count() > 0) {
      hasClosedEnrollment = true;
      const cells = enrollmentRows.first().locator('> div');
      patientName = (await cells.nth(1).textContent())?.trim();
      program = (await cells.nth(2).textContent())?.trim();
    }
  }

  // ── Step 3 (IF Closed found): Activate directly ──
  if (hasClosedEnrollment) {
    console.log(`\n=== CLOSED ENROLLMENT FOUND ===`);
    console.log(`Patient: ${patientName} | Program: ${program}`);
  } else {
    // ── Step 4 (IF NOT found): Create New → Move to Active ──
    console.log('\n=== NO CLOSED ENROLLMENT FOUND, CREATING ONE ===');

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await enrollment.gotoEnrollmentSection();
    await page.waitForTimeout(1000);
    const enrollmentData = await enrollment.addEnrollment(null, { retryOnAlreadyEnrolled: true });
    expect(enrollmentData.result, 'Failed to create enrollment').toBe('SUCCESS');
    console.log(`Enrollment created: ${enrollmentData.patientName} | ${enrollmentData.program}`);

    const newPatientLastName = enrollmentData.patientName.split(',')[0].trim();
    const newProgramShort = getProgramShort(enrollmentData.program);

    // Find the new enrollment row and Move to Active
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await enrollment.gotoEnrollmentSection();
    await page.waitForTimeout(2000);
    await enrollment.applyStatusFilter('New');
    await page.waitForTimeout(2000);
    const newRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${newPatientLastName}")]`).first();
    await newRow.waitFor({ state: 'visible', timeout: 15000 });

    const actionBtnNew = newRow.locator('xpath=./div[9]/div');
    await actionBtnNew.click();
    await page.waitForTimeout(1500);
    await page.locator('//button[text()="Move to Active"]').first().click();
    await page.waitForTimeout(1000);
    await page.locator('//button[text()="Move to Active"]').last().click();
    await page.waitForTimeout(3000);
    console.log('Status moved to Active');

    // ── Step 5: Navigate to Worklist → Verify in Active section ──
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);
    await enrollment.worklistSection.click({ force: true });
    await page.waitForTimeout(2000);
    await enrollment.careManagerFilterDropdown.click();
    await page.waitForTimeout(1000);
    await enrollment.allCareManagerOption.click();
    await page.waitForTimeout(2000);
    await page.locator(`//span[text()="${newProgramShort}"]`).click();
    await page.waitForTimeout(1500);
    await page.locator('//p[text()="Active"]').click();
    await page.waitForTimeout(2000);
    await enrollment.worklistSearchBox.waitFor({ state: 'visible', timeout: 10000 });
    await enrollment.worklistSearchBox.fill(newPatientLastName);
    await page.waitForTimeout(2000);

    const activeRows = page.locator('div.MuiBox-root.css-4n39j4 > div');
    const activeRowCount = await activeRows.count();
    let foundInActive = false;
    for (let i = 0; i < activeRowCount; i++) {
      const rowText = (await activeRows.nth(i).textContent()) || '';
      if (rowText.includes(newPatientLastName)) {
        foundInActive = true;
        break;
      }
    }
    expect(foundInActive, 'Patient should be visible in Worklist ACTIVE section').toBe(true);
    console.log('Verified in Worklist Active section');

    // ── Step 6: Navigate back to Enrollment → Close it ──
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await enrollment.gotoEnrollmentSection();
    await page.waitForTimeout(2000);
    await enrollment.applyStatusFilter('Active');
    await page.waitForTimeout(2000);
    const activeEnrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${newPatientLastName}")]`).first();
    await activeEnrollmentRow.waitFor({ state: 'visible', timeout: 15000 });

    const actionBtnActive = activeEnrollmentRow.locator('xpath=./div[9]/div');
    await actionBtnActive.click();
    await page.waitForTimeout(1500);
    await page.locator('//button[text()="Close Enrollment"]').click();
    await page.waitForTimeout(1500);

    const updatedByDropdown = page.locator('//input[@placeholder="Updated By"]');
    await updatedByDropdown.click();
    await page.waitForTimeout(1000);
    const updatedByOptions = page.locator('//li[@data-option-index]');
    await updatedByOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    await updatedByOptions.nth(Math.floor(Math.random() * (await updatedByOptions.count()))).click();
    await page.waitForTimeout(500);
    await page.locator('//textarea[@placeholder="Enter Reason"]').fill('Closing enrollment for activate enrollment test');
    await page.waitForTimeout(500);
    await page.locator('//h6[text()="Save"]').click();
    await page.waitForTimeout(4000);
    console.log('Enrollment Closed');

    // Refresh and set the closed enrollment details for the activate step
    patientName = enrollmentData.patientName;
    program = enrollmentData.program;

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await enrollment.gotoEnrollmentSection();
    await page.waitForTimeout(2000);
    await enrollment.applyStatusFilter('Closed');
    await page.waitForTimeout(2000);
  }

  // ── Activate the Closed enrollment ──
  const patientLastName = patientName.split(',')[0].trim();
  const programShort = getProgramShort(program);
  console.log(`\n=== ACTIVATING: ${patientName} ===`);

  const closedRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await closedRow.waitFor({ state: 'visible', timeout: 10000 });

  const actionButton = closedRow.locator('xpath=./div[9]/div');
  await actionButton.click();
  await page.waitForTimeout(2000);

  const activateOption = page.locator('//button[text()="Activate Enrollment"]');
  await activateOption.waitFor({ state: 'visible', timeout: 5000 });
  await activateOption.click();
  await page.waitForTimeout(2000);

  const confirmActivateBtn = page.locator('//button[text()="Activate"]');
  await confirmActivateBtn.waitFor({ state: 'visible', timeout: 5000 });
  await confirmActivateBtn.click();
  await page.waitForTimeout(4000);
  console.log('Activate Enrollment confirmed');

  // ── Verify ACTIVE status in Enrollment List ──
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);
  await enrollment.applyStatusFilter('Active');
  await page.waitForTimeout(2000);

  const allPatientRows = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`);
  await allPatientRows.first().waitFor({ state: 'visible', timeout: 15000 });
  const rowCount = await allPatientRows.count();

  let foundActive = false;
  for (let i = 0; i < rowCount; i++) {
    const rowText = (await allPatientRows.nth(i).textContent()) || '';
    if (rowText.toLowerCase().includes('active')) {
      foundActive = true;
      console.log(`Row: ${rowText}`);
      break;
    }
  }
  expect(foundActive, 'Enrollment status should be ACTIVE after activation').toBe(true);
  console.log('Enrollment status verified as ACTIVE in Enrollment List');

  // ── Verify in Worklist Active section ──
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  await enrollment.worklistSection.click({ force: true });
  await page.waitForTimeout(2000);
  await enrollment.careManagerFilterDropdown.click();
  await page.waitForTimeout(1000);
  await enrollment.allCareManagerOption.click();
  await page.waitForTimeout(2000);
  await page.locator(`//span[text()="${programShort}"]`).click();
  await page.waitForTimeout(1500);
  await page.locator('//p[text()="Active"]').click();
  await page.waitForTimeout(2000);
  await enrollment.worklistSearchBox.waitFor({ state: 'visible', timeout: 10000 });
  await enrollment.worklistSearchBox.fill(patientLastName);
  await page.waitForTimeout(3000);

  const worklistActiveRows = page.locator('div.MuiBox-root.css-4n39j4 > div');
  const worklistRowCount = await worklistActiveRows.count();
  let patientFoundInActive = false;

  for (let i = 0; i < worklistRowCount; i++) {
    const rowText = (await worklistActiveRows.nth(i).textContent()) || '';
    if (rowText.includes(patientLastName)) {
      patientFoundInActive = true;
      console.log(`Worklist row: ${rowText}`);
      break;
    }
  }
  expect(patientFoundInActive, `Patient "${patientName}" should be visible in Worklist ACTIVE section`).toBe(true);

  console.log(`\n=== ACTIVATE ENROLLMENT VALIDATION COMPLETE ===`);
  console.log(`Patient: ${patientName}`);
  console.log(`Program: ${programShort}`);
  console.log(`Enrollment Status: ACTIVE`);
  console.log(`Worklist Active Section: Patient found`);
  console.log('Activate Enrollment workflow validated successfully');
});
