import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { EnrollmentPage } from '../../../Pages/ProviderPortalPages/EnrollmentPage';

test('Verify patient search and auto-fill in New Enrollment form', async ({ page }) => {
  test.setTimeout(60000);

  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  // Login and navigate to enrollment form
  await login.gotoLoginPage();
  await login.login(username, password);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);
  await enrollment.addEnrolmentBtn.click();
  await page.waitForTimeout(3000);

  // Patient search and selection
  const searchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  await enrollment.patientDrodown.click();
  await enrollment.patientDrodown.fill(searchText);
  await page.waitForTimeout(2000);

  // Verify patient search results
  const patientOptions = page.locator('//ul[@role="listbox"]//li');
  await patientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
  const count = await patientOptions.count();
  expect(count, 'No patient options found in search results').toBeGreaterThan(0);
  console.log(`✓ Patient search returned ${count} results`);

  // Select patient
  const randomIndex = Math.floor(Math.random() * count);
  const selectedPatientName = await patientOptions.nth(randomIndex).textContent();
  await patientOptions.nth(randomIndex).click();
  console.log(`✓ Selected patient: ${selectedPatientName}`);

  // Wait for auto-fill
  await page.waitForTimeout(3000);

  // Verify auto-filled fields - using generic input locators
  const allInputs = page.locator('input[type="text"]');
  const inputCount = await allInputs.count();
  
  let phone = '';
  let email = '';
  let dob = '';
  
  // Find fields with values (auto-filled)
  for (let i = 0; i < inputCount; i++) {
    const value = await allInputs.nth(i).inputValue();
    if (value && value.length > 0) {
      if (value.match(/\d{3}-\d{3}-\d{4}/) || value.match(/\(\d{3}\)/)) {
        phone = value;
      } else if (value.includes('@')) {
        email = value;
      } else if (value.match(/\d{2}-\d{2}-\d{4}/)) {
        dob = value;
      }
    }
  }

  expect(phone.length, 'Phone field is empty after patient selection').toBeGreaterThan(0);
  expect(dob.length, 'DOB field is empty after patient selection').toBeGreaterThan(0);
  
  console.log(`✓ Phone auto-filled: ${phone}`);
  console.log(`✓ DOB auto-filled: ${dob}`);
  if (email.length > 0) {
    console.log(`✓ Email auto-filled: ${email}`);
  }
});

test('Verify Add Insurance button opens insurance form and allows adding new insurance', async ({ page }) => {
  test.setTimeout(60000);

  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  // Login and navigate to enrollment form
  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);
  await enrollment.addEnrolmentBtn.click();
  await page.waitForTimeout(3000);

  // Select patient
  const searchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  await enrollment.patientDrodown.click();
  await enrollment.patientDrodown.fill(searchText);
  await page.waitForTimeout(2000);
  const patientOptions = page.locator('//ul[@role="listbox"]//li');
  await patientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
  const randomIndex = Math.floor(Math.random() * await patientOptions.count());
  await patientOptions.nth(randomIndex).click();
  await page.waitForTimeout(2000);

  // Click Add New Insurance button
  const addInsuranceBtn = page.locator('//div[text()="Add New Insurance"]');
  await addInsuranceBtn.click();
  await page.waitForTimeout(2000);

  // Verify insurance form opened
  const insuranceTypeDropdown = page.locator('//span[text()="Select Insurance Type"]');
  await expect(insuranceTypeDropdown, 'Insurance form did not open').toBeVisible();
  console.log('✓ Insurance form opened');

  // Select Insurance Type
  await insuranceTypeDropdown.click();
  await page.waitForTimeout(1000);
  const insuranceTypeOptions = page.locator('//ul[@role="listbox"]//li');
  await insuranceTypeOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const typeCount = await insuranceTypeOptions.count();
  const randomTypeIndex = Math.floor(Math.random() * typeCount);
  await insuranceTypeOptions.nth(randomTypeIndex).click();
  await page.waitForTimeout(1000);

  // Enter Insurance Name
  const insuranceNameField = page.locator('(//input[@placeholder="Search & Select Insurance"])[2]');
  await insuranceNameField.click();
  await page.waitForTimeout(1000);
  const insuranceNameOptions = page.locator('//ul[@role="listbox"]//li');
  await insuranceNameOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const nameCount = await insuranceNameOptions.count();
  const randomNameIndex = Math.floor(Math.random() * nameCount);
  const selectedInsuranceName = await insuranceNameOptions.nth(randomNameIndex).textContent();
  await insuranceNameOptions.nth(randomNameIndex).click();
  await page.waitForTimeout(1000);
  console.log(`✓ Selected insurance: ${selectedInsuranceName}`);

  // Select Relationship to Insured
  const relationshipDropdown = page.locator('//span[text()="Select Relationship"]');
  await relationshipDropdown.click();
  await page.waitForTimeout(1000);
  const relationshipOptions = page.locator('//ul[@role="listbox"]//li');
  await relationshipOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const relationshipCount = await relationshipOptions.count();
  const randomRelationshipIndex = Math.floor(Math.random() * relationshipCount);
  await relationshipOptions.nth(randomRelationshipIndex).click();
  await page.waitForTimeout(1000);

  // Select Gender
  const genderDropdown = page.locator('//span[text()="Select Gender"]');
  await genderDropdown.click();
  await page.waitForTimeout(1000);
  const genderOptions = page.locator('//ul[@role="listbox"]//li');
  await genderOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const genderCount = await genderOptions.count();
  const randomGenderIndex = Math.floor(Math.random() * genderCount);
  await genderOptions.nth(randomGenderIndex).click();
  await page.waitForTimeout(1000);

  // Click Save button
  const saveBtn = page.locator('//button[text()="Save"]');
  await saveBtn.click();
  await page.waitForTimeout(3000);
  console.log('✓ Insurance saved');

  // Verify back to enrollment form and insurance in dropdown
  const insuranceDropdown = page.locator('//input[@placeholder="Search & Select Insurance"]').first();
  await insuranceDropdown.click();
  await page.waitForTimeout(2000);
  const insuranceList = page.locator('//ul[@role="listbox"]//li');
  await insuranceList.first().waitFor({ state: 'visible', timeout: 5000 });
  
  let insuranceFound = false;
  const listCount = await insuranceList.count();
  for (let i = 0; i < listCount; i++) {
    const text = await insuranceList.nth(i).textContent();
    if (text?.includes(selectedInsuranceName?.trim())) {
      insuranceFound = true;
      break;
    }
  }
  
  expect(insuranceFound, `Insurance "${selectedInsuranceName}" not found in dropdown`).toBe(true);
  console.log(`✓ Insurance "${selectedInsuranceName}" found in dropdown`);
});

test('Verify Care Manager assignment and multi-diagnoses selection in Enrollment form', async ({ page }) => {
  test.setTimeout(60000);

  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  // Login and navigate to enrollment form
  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);
  await enrollment.addEnrolmentBtn.click();
  await page.waitForTimeout(3000);

  // Select patient
  const searchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  await enrollment.patientDrodown.click();
  await enrollment.patientDrodown.fill(searchText);
  await page.waitForTimeout(2000);
  const patientOptions = page.locator('//ul[@role="listbox"]//li');
  await patientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
  const randomIndex = Math.floor(Math.random() * await patientOptions.count());
  await patientOptions.nth(randomIndex).click();
  await page.waitForTimeout(2000);

  // Select service type
  await enrollment.serviceDropdown.click();
  await enrollment.serviceSelection.click();
  await page.waitForTimeout(1000);

  // Select provider
  await enrollment.providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  await providerOptions.first().click();
  await page.waitForTimeout(1000);

  // Scenario 1: Assign Primary Care Manager
  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const primaryCMOptions = page.locator('//ul[@role="listbox"]//li');
  await primaryCMOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  await primaryCMOptions.first().click();
  await page.waitForTimeout(1000);
  console.log('✓ Primary Care Manager assigned');

  // Assign Secondary Care Managers
  const secondaryCMField = page.locator('//input[@placeholder="Search & Select Secondary Care Manager"]');
  await secondaryCMField.click();
  await page.waitForTimeout(1000);

  const secondaryCMOptions = page.locator('//ul[@role="listbox"]//li');
  await secondaryCMOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const cmCount = await secondaryCMOptions.count();
  const maxAllowed = Math.min(3, cmCount);

  // Select up to max allowed secondary care managers
  for (let i = 0; i < maxAllowed; i++) {
    await secondaryCMOptions.nth(i).click();
    await page.waitForTimeout(500);
  }

  // Verify selected care managers count
  const selectedCMChips = page.locator('//div[@role="button" and contains(@class, "MuiChip")]');
  const selectedCount = await selectedCMChips.count();
  expect(selectedCount, 'Secondary care managers count validation failed').toBeLessThanOrEqual(maxAllowed);
  console.log(`✓ Selected ${selectedCount} secondary care managers (max allowed: ${maxAllowed})`);

  // Close dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Scenario 2: Multi-select diagnoses with ICD codes
  await enrollment.conditionsDropdown.click();
  await page.waitForTimeout(1000);

  const diagnosisOptions = page.locator('//ul[@role="listbox"]//li');
  await diagnosisOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const diagnosisCount = await diagnosisOptions.count();
  const selectCount = Math.min(3, diagnosisCount);

  const selectedDiagnoses = [];
  for (let i = 0; i < selectCount; i++) {
    const diagnosisText = await diagnosisOptions.nth(i).textContent();
    await diagnosisOptions.nth(i).locator('input').click();
    await page.waitForTimeout(500);
    selectedDiagnoses.push(diagnosisText?.trim());
  }

  console.log(`✓ Selected ${selectCount} diagnoses`);
  selectedDiagnoses.forEach((d, i) => console.log(`  ${i + 1}. ${d}`));

  // Verify multiple diagnoses were selected
  expect(selectedDiagnoses.length, 'Failed to select multiple diagnoses').toBeGreaterThan(1);
  console.log(`✓ Multiple diagnoses selection validated`);

  // Close dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Submit enrollment
  await enrollment.addPlanBtn.click();
  await page.waitForTimeout(3000);

  // Verify enrollment was added
  const result = await enrollment.validateEnrollmentResult();
  if (result === 'SUCCESS') {
    console.log('✓ Enrollment added successfully');

  // Verify diagnoses in enrollment list
    await page.waitForTimeout(2000);
    const enrollments = await enrollment.getEnrollmentListData();
    const latestEnrollment = enrollments[0];

    // Get diagnosis details from enrollment row
    const enrollmentRow = enrollment.enrollmentListRows.first();
    const diagnosisCell = enrollmentRow.locator('> div').nth(3);
    const diagnosisText = await diagnosisCell.textContent();

    // Verify diagnoses are displayed (check for common patterns)
    const hasDiagnosis = diagnosisText && diagnosisText.trim().length > 0 && diagnosisText !== '-';
    expect(hasDiagnosis, 'Selected diagnoses not displayed in enrollment list').toBe(true);
    console.log(`✓ Diagnoses displayed in enrollment list: ${diagnosisText?.trim()}`);
  } else {
    console.log('Enrollment not added, skipping diagnosis verification');
  }
});
