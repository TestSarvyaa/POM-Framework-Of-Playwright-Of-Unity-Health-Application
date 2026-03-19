import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { EnrollmentPage } from '../../../Pages/ProviderPortalPages/EnrollmentPage';

test('Verify close enrollment workflow - Status changes to Closed in Enrollment List and Worklist', async ({ page }) => {
  test.setTimeout(180000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(3000);

  const enrollmentRows = page.locator('//div[@class="css-1hhl13x"]');
  await enrollmentRows.first().waitFor({ state: 'visible', timeout: 10000 });
  const rowCount = await enrollmentRows.count();

  let activeEnrollmentFound = false;
  let selectedRow;
  let patientName = '';
  let program = '';
  let status = '';

  for (let i = 0; i < rowCount; i++) {
    const rowText = await enrollmentRows.nth(i).textContent();
    if (rowText.toLowerCase().includes('active')) {
      selectedRow = enrollmentRows.nth(i);
      const cells = selectedRow.locator('> div');
      patientName = (await cells.nth(1).textContent())?.trim();
      program = (await cells.nth(2).textContent())?.trim();
      status = (await cells.nth(4).textContent())?.trim();
      activeEnrollmentFound = true;
      break;
    }
  }

  expect(activeEnrollmentFound, 'No ACTIVE enrollment found').toBe(true);

  console.log(`\n=== ACTIVE ENROLLMENT FOUND ===`);
  console.log(`Patient: ${patientName}`);
  console.log(`Program: ${program}`);
  console.log(`Status: ${status}`);

  const actionButton = selectedRow.locator('xpath=./div[9]/div');
  await actionButton.click();
  await page.waitForTimeout(2000);

  const closeEnrollmentOption = page.locator('//button[text()="Close Enrollment"]');
  await closeEnrollmentOption.waitFor({ state: 'visible', timeout: 5000 });
  await closeEnrollmentOption.click();
  await page.waitForTimeout(2000);

  const updatedByDropdown = page.locator('//input[@placeholder="Updated By"]');
  await updatedByDropdown.click();
  await page.waitForTimeout(2000);
  const updatedByOptions = page.locator('//li[@data-option-index]');
  await updatedByOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const optionCount = await updatedByOptions.count();
  const randomIndex = Math.floor(Math.random() * optionCount);
  const selectedUpdatedBy = await updatedByOptions.nth(randomIndex).textContent();
  console.log(`Updated By Selected: ${selectedUpdatedBy?.trim()}`);
  await updatedByOptions.nth(randomIndex).click();
  await page.waitForTimeout(1000);

  const terminationReasons = [
    'Patient requested termination',
    'Program completed successfully',
    'Patient moved to different location',
    'No longer eligible for program',
    'Patient non-compliant with program requirements'
  ];
  const randomReasonIndex = Math.floor(Math.random() * terminationReasons.length);
  const terminationReason = terminationReasons[randomReasonIndex];
  
  const reasonTextarea = page.locator('//textarea[@placeholder="Enter Reason"]');
  await reasonTextarea.fill(terminationReason);
  await page.waitForTimeout(1000);
  
  console.log(`Termination Reason: ${terminationReason}`);
  
  const saveButton = page.locator('//h6[text()="Save"]');
  await saveButton.click();
  await page.waitForTimeout(5000);

  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);

  const patientLastName = patientName.split(',')[0].trim();
  const updatedEnrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await updatedEnrollmentRow.waitFor({ state: 'visible', timeout: 10000 });
  const updatedRowText = await updatedEnrollmentRow.textContent();

  console.log(`\n=== ENROLLMENT LIST VALIDATION ===`);
  console.log(`Patient: ${patientName}`);
  console.log(`Program: ${program}`);
  console.log(`Row text: ${updatedRowText}`);

  expect(updatedRowText.toLowerCase().includes('closed'), 'Status should be CLOSED in Enrollment List').toBe(true);
  console.log(`✓ Status is CLOSED in Enrollment List`);

  const modalBackdrop = page.locator('.MuiBackdrop-root');
  if (await modalBackdrop.isVisible().catch(() => false)) {
    await modalBackdrop.click({ force: true });
    await page.waitForTimeout(1000);
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(2000);

  if (await modalBackdrop.isVisible().catch(() => false)) {
    await modalBackdrop.click({ force: true });
    await page.waitForTimeout(1000);
  }

  await enrollment.worklistSection.click({ force: true });
  await page.waitForTimeout(2000);

  await page.reload();
  await page.waitForTimeout(2000);

  await enrollment.careManagerFilterDropdown.click();
  await page.waitForTimeout(1000);
  await enrollment.allCareManagerOption.click();
  await page.waitForTimeout(3000);

  const programShort = program.match(/\(([^)]+)\)/)?.[1] || program;
  const programTabLocator = page.locator(`//span[text()="${programShort}"]`);
  await programTabLocator.click();
  await page.waitForTimeout(2000);

  const closedSection = page.locator('//p[text()="Closed"]');
  await closedSection.click();
  await page.waitForTimeout(3000);

  await enrollment.worklistSearchBox.waitFor({ state: 'visible', timeout: 5000 });
  await enrollment.worklistSearchBox.fill(patientLastName);
  await page.waitForTimeout(3000);

  const closedSectionTable = page.locator('//div[@class="MuiBox-root css-4n39j4"]');
  const closedSectionRows = closedSectionTable.locator('> div');
  const closedRowCount = await closedSectionRows.count();

  console.log(`\n=== WORKLIST CLOSED SECTION VALIDATION ===`);
  console.log(`Total rows in CLOSED section: ${closedRowCount}`);

  let foundInClosed = false;
  let closedRowText = '';
  for (let i = 0; i < closedRowCount; i++) {
    closedRowText = await closedSectionRows.nth(i).textContent();
    console.log(`Row ${i}: ${closedRowText}`);
    if (closedRowText.includes(patientLastName)) {
      foundInClosed = true;
      console.log(`\n✓ Patient found in CLOSED section`);
      console.log(`Row details: ${closedRowText}`);
      break;
    }
  }

  expect(foundInClosed, 'Patient should be in CLOSED section of Worklist').toBe(true);
  
  const hasTerminationReason = closedRowText.includes(terminationReason);
  expect(hasTerminationReason, `Termination Reason "${terminationReason}" should be displayed in CLOSED section`).toBe(true);
  console.log(`✓ Termination Reason: ${terminationReason} - Displayed`);
  
  console.log(`✓ Closed enrollment validated successfully in both Enrollment List and Worklist`);
});

test('Verify Cancel button in Terminate Enrollment form closes form without terminating', async ({ page }) => {
  test.setTimeout(120000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(3000);

  const enrollmentRows = page.locator('//div[@class="css-1hhl13x"]');
  await enrollmentRows.first().waitFor({ state: 'visible', timeout: 10000 });
  const rowCount = await enrollmentRows.count();

  let activeEnrollmentFound = false;
  let selectedRow;
  let patientName = '';
  let program = '';
  let status = '';

  for (let i = 0; i < rowCount; i++) {
    const rowText = await enrollmentRows.nth(i).textContent();
    if (rowText.toLowerCase().includes('active')) {
      selectedRow = enrollmentRows.nth(i);
      const cells = selectedRow.locator('> div');
      patientName = (await cells.nth(1).textContent())?.trim();
      program = (await cells.nth(2).textContent())?.trim();
      status = (await cells.nth(4).textContent())?.trim();
      activeEnrollmentFound = true;
      break;
    }
  }

  expect(activeEnrollmentFound, 'No ACTIVE enrollment found').toBe(true);

  console.log(`\n=== ACTIVE ENROLLMENT FOUND ===`);
  console.log(`Patient: ${patientName}`);
  console.log(`Program: ${program}`);
  console.log(`Status: ${status}`);

  const actionButton = selectedRow.locator('xpath=./div[9]/div');
  await actionButton.click();
  await page.waitForTimeout(2000);

  const closeEnrollmentOption = page.locator('//button[text()="Close Enrollment"]');
  await closeEnrollmentOption.waitFor({ state: 'visible', timeout: 5000 });
  await closeEnrollmentOption.click();
  await page.waitForTimeout(2000);

  const updatedByDropdown = page.locator('//input[@placeholder="Updated By"]');
  await updatedByDropdown.click();
  await page.waitForTimeout(2000);
  const updatedByOptions = page.locator('//li[@data-option-index]');
  await updatedByOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const optionCount = await updatedByOptions.count();
  const randomIndex = Math.floor(Math.random() * optionCount);
  await updatedByOptions.nth(randomIndex).click();
  await page.waitForTimeout(1000);

  const reasonTextarea = page.locator('//textarea[@placeholder="Enter Reason"]');
  await reasonTextarea.fill('Test cancellation');
  await page.waitForTimeout(1000);

  const cancelButton = page.locator('//h6[text()="Cancel"]');
  await cancelButton.click();
  await page.waitForTimeout(2000);

  await expect(enrollment.enrollmentListContainer).toBeVisible();
  console.log(`\u2713 Cancel button closed the terminate enrollment form`);
  console.log(`\u2713 User navigated back to Enrollment List page`);

  const patientLastName = patientName.split(',')[0].trim();
  const enrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await enrollmentRow.waitFor({ state: 'visible', timeout: 10000 });
  const rowText = await enrollmentRow.textContent();

  console.log(`\n=== ENROLLMENT STATUS VALIDATION ===`);
  console.log(`Patient: ${patientName}`);
  console.log(`Row text: ${rowText}`);

  expect(rowText.toLowerCase().includes('active'), 'Status should remain ACTIVE').toBe(true);
  expect(rowText.toLowerCase().includes('closed'), 'Status should NOT be CLOSED').toBe(false);
  console.log(`\u2713 Status remains ACTIVE - Enrollment was not terminated`);
});
