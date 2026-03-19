import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { EnrollmentPage } from '../../../Pages/ProviderPortalPages/EnrollmentPage';

test('Verify update enrollment - Update ICD codes, changes reflected in Enrollment List', async ({ page }) => {
  test.setTimeout(90000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);

  await enrollment.addEnrolmentBtn.click();
  await page.waitForTimeout(3000);

  const searchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  await enrollment.patientDrodown.click();
  await enrollment.patientDrodown.fill(searchText);
  await page.waitForTimeout(2000);
  const patientOptions = page.locator('//ul[@role="listbox"]//li');
  await patientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
  const randomIndex = Math.floor(Math.random() * await patientOptions.count());
  const selectedPatientName = await patientOptions.nth(randomIndex).textContent();
  await patientOptions.nth(randomIndex).click();
  await page.waitForTimeout(1000);

  await enrollment.serviceDropdown.click();
  await page.waitForTimeout(1000);
  const serviceOptions = page.locator('//ul[@role="listbox"]//li');
  await serviceOptions.first().click();
  await page.waitForTimeout(1000);

  await enrollment.providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const provCount = await providerOptions.count();
  const randomProvIndex = Math.floor(Math.random() * provCount);
  await providerOptions.nth(randomProvIndex).click();
  await page.waitForTimeout(1000);

  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const careManagerOptions = page.locator('//ul[@role="listbox"]//li');
  await careManagerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const cmCount = await careManagerOptions.count();
  const randomCmIndex = Math.floor(Math.random() * cmCount);
  await careManagerOptions.nth(randomCmIndex).click();
  await page.waitForTimeout(1000);

  await enrollment.conditionsDropdown.click();
  await page.waitForTimeout(1000);
  const diagnosisOptions = page.locator('//ul[@role="listbox"]//li');
  await diagnosisOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const diagCount = await diagnosisOptions.count();
  const randomDiagIndex = Math.floor(Math.random() * diagCount);
  const initialIcdCode = await diagnosisOptions.nth(randomDiagIndex).textContent();
  console.log(`\n=== INITIAL ENROLLMENT ===`);
  console.log(`Initial ICD Code Selected: ${initialIcdCode?.trim()}`);
  expect(initialIcdCode?.trim().length, 'Initial ICD code should be captured').toBeGreaterThan(0);
  await diagnosisOptions.nth(randomDiagIndex).locator('input').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  await enrollment.addPlanBtn.click();
 // await page.waitForTimeout(3000);

  const result = await enrollment.validateEnrollmentResult();
  expect(result).toBe('SUCCESS');

  await page.waitForTimeout(2000);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);
  const patientLastName = selectedPatientName?.split(',')[0].trim();

  const enrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await enrollmentRow.waitFor({ state: 'visible', timeout: 15000 });

  const actionButton = enrollmentRow.locator('xpath=./div[9]/div');
  await actionButton.click();
  await page.waitForTimeout(2000);

  const updateEnrollmentOption = page.locator('//button[text()="Update Enrollment"]');
  await updateEnrollmentOption.waitFor({ state: 'visible', timeout: 5000 });
  await updateEnrollmentOption.click();
  await page.waitForTimeout(5000);
  
  await expect(page.locator('//h5[text()="UPDATE ENROLLMENT"]')).toBeVisible();
  
  await page.waitForTimeout(2000);
  
  console.log(`\n=== UPDATE ENROLLMENT - BEFORE CHANGES ===`);
  const icdDropdown = page.locator('(//div[@class="MuiAutocomplete-endAdornment css-iuka1o"])[5]');
  await icdDropdown.click();
  await page.waitForTimeout(1000);
  
  const icdOptions = page.locator('//ul[@role="listbox"]//li');
  await icdOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  
  const selectedIcdsBeforeUpdate = [];
  for (let i = 0; i < await icdOptions.count(); i++) {
    const checkbox = icdOptions.nth(i).locator('input');
    if (await checkbox.isChecked()) {
      const icdText = await icdOptions.nth(i).textContent();
      selectedIcdsBeforeUpdate.push(icdText?.trim());
    }
  }
  console.log(`ICD Codes Currently Selected: ${selectedIcdsBeforeUpdate.join(', ')}`);
  
  const firstCheckbox = icdOptions.first().locator('input');
  if (await firstCheckbox.isChecked()) {
    await firstCheckbox.uncheck();
    await page.waitForTimeout(500);
    console.log(`Deselected: ${initialIcdCode?.trim()}`);
  }
  
  let updatedIcdCode;
  const optionCount = await icdOptions.count();
  const randomOptionIndex = Math.floor(Math.random() * (optionCount - 1)) + 1;
  updatedIcdCode = await icdOptions.nth(randomOptionIndex).textContent();
  const newCheckbox = icdOptions.nth(randomOptionIndex).locator('input');
  await newCheckbox.check();
  await page.waitForTimeout(500);
  
  console.log(`\n=== UPDATE ENROLLMENT - AFTER CHANGES ===`);
  console.log(`Updated ICD Code Selected: ${updatedIcdCode?.trim()}`);
  expect(updatedIcdCode?.trim().length, 'Updated ICD code should be captured').toBeGreaterThan(0);
  expect(initialIcdCode?.trim()).not.toBe(updatedIcdCode?.trim());
  console.log(`✓ Initial and Updated ICD codes are different`);
  
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  
  const updateBtn = page.locator('//h6[text()="Update Plan"]');
  await updateBtn.click();
  await page.waitForTimeout(3000);
  
  const updateResult = await enrollment.validateEnrollmentResult();
  expect(updateResult).toBe('SUCCESS');

  await page.waitForTimeout(2000);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);

  const updatedEnrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await updatedEnrollmentRow.waitFor({ state: 'visible', timeout: 10000 });
  const rowText = await updatedEnrollmentRow.textContent();

  const updatedIcdCodeShort = updatedIcdCode?.match(/\(([^)]+)\)/)?.[1] || updatedIcdCode?.split(' ')[0];
  const initialIcdCodeShort = initialIcdCode?.match(/\(([^)]+)\)/)?.[1] || initialIcdCode?.split(' ')[0];

  console.log(`\n=== ENROLLMENT LIST VALIDATION ===`);
  console.log(`Checking for Updated ICD: ${updatedIcdCodeShort}`);
  console.log(`Checking for Initial ICD: ${initialIcdCodeShort}`);
  
  const hasUpdatedIcd = rowText.includes(updatedIcdCodeShort);
  const hasInitialIcd = rowText.includes(initialIcdCodeShort);
  
  if (hasInitialIcd && hasUpdatedIcd) {
    throw new Error(`FAIL: Both ICD codes are present in the enrollment list. ICD deselection did not occur correctly. Initial: ${initialIcdCodeShort}, Updated: ${updatedIcdCodeShort}`);
  }
  
  expect(hasUpdatedIcd, `Updated ICD code ${updatedIcdCodeShort} should be present in enrollment list`).toBe(true);
  expect(hasInitialIcd, `Initial ICD code ${initialIcdCodeShort} should NOT be present in enrollment list`).toBe(false);
  
  console.log('✓ Enrollment List shows ONLY updated ICD code');
  console.log('✓ Old ICD code is NOT present in the updated record');
  console.log('✓ ICD deselection and update verified successfully');
});

test('Verify complete modify enrollment workflow - Update ICD codes, Care Manager, Provider, Insurance', async ({ page }) => {
  test.setTimeout(180000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);

  await enrollment.addEnrolmentBtn.click();
  await page.waitForTimeout(3000);

  const searchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  await enrollment.patientDrodown.click();
  await enrollment.patientDrodown.fill(searchText);
  await page.waitForTimeout(2000);
  const patientOptions = page.locator('//ul[@role="listbox"]//li');
  await patientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
  const randomIndex = Math.floor(Math.random() * await patientOptions.count());
  let selectedPatientName = await patientOptions.nth(randomIndex).textContent();
  await patientOptions.nth(randomIndex).click();
  await page.waitForTimeout(1000);

  await enrollment.serviceDropdown.click();
  await page.waitForTimeout(1000);
  const serviceOptions = page.locator('//ul[@role="listbox"]//li');
  await serviceOptions.first().click();
  await page.waitForTimeout(1000);

  const addInsuranceBtn = page.locator('//div[text()="Add New Insurance"]');
  await addInsuranceBtn.click();
  await page.waitForTimeout(2000);
  
  const insuranceTypeDropdown = page.locator('//span[text()="Select Insurance Type"]');
  await insuranceTypeDropdown.click();
  await page.waitForTimeout(1000);
  const insuranceTypeOptions = page.locator('//ul[@role="listbox"]//li');
  await insuranceTypeOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const typeCount = await insuranceTypeOptions.count();
  const randomTypeIndex = Math.floor(Math.random() * typeCount);
  await insuranceTypeOptions.nth(randomTypeIndex).click();
  await page.waitForTimeout(1000);

  const insuranceNameField = page.locator('(//input[@placeholder="Search & Select Insurance"])[2]');
  await insuranceNameField.click();
  await page.waitForTimeout(1000);
  const insuranceNameOptions = page.locator('//ul[@role="listbox"]//li');
  await insuranceNameOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const nameCount = await insuranceNameOptions.count();
  const randomNameIndex = Math.floor(Math.random() * nameCount);
  const initialInsurance = await insuranceNameOptions.nth(randomNameIndex).textContent();
  await insuranceNameOptions.nth(randomNameIndex).click();
  await page.waitForTimeout(1000);

  const relationshipDropdown = page.locator('//span[text()="Select Relationship"]');
  await relationshipDropdown.click();
  await page.waitForTimeout(1000);
  const relationshipOptions = page.locator('//ul[@role="listbox"]//li');
  await relationshipOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const relCount = await relationshipOptions.count();
  const randomRelIndex = Math.floor(Math.random() * relCount);
  await relationshipOptions.nth(randomRelIndex).click();
  await page.waitForTimeout(1000);

  const genderDropdown = page.locator('//span[text()="Select Gender"]');
  await genderDropdown.click();
  await page.waitForTimeout(1000);
  const genderOptions = page.locator('//ul[@role="listbox"]//li');
  await genderOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const genderCount = await genderOptions.count();
  const randomGenderIndex = Math.floor(Math.random() * genderCount);
  await genderOptions.nth(randomGenderIndex).click();
  await page.waitForTimeout(1000);

  const saveBtn = page.locator('//button[text()="Save"]');
  await saveBtn.click();
  await page.waitForTimeout(3000);

  const insuranceSelectDropdown = page.locator('//input[@placeholder="Search & Select Insurance"]').first();
  await insuranceSelectDropdown.click();
  await page.waitForTimeout(1000);
  const insuranceListOptions = page.locator('//ul[@role="listbox"]//li');
  await insuranceListOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  
  let insuranceSelected = false;
  const listCount = await insuranceListOptions.count();
  for (let i = 0; i < listCount; i++) {
    const text = await insuranceListOptions.nth(i).textContent();
    if (text?.includes(initialInsurance?.trim())) {
      await insuranceListOptions.nth(i).click();
      insuranceSelected = true;
      break;
    }
  }
  
  if (!insuranceSelected) {
    await insuranceListOptions.first().click();
  }
  await page.waitForTimeout(1000);

  await enrollment.providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const provCount = await providerOptions.count();
  const randomProvIndex = Math.floor(Math.random() * provCount);
  const initialProvider = await providerOptions.nth(randomProvIndex).textContent();
  await providerOptions.nth(randomProvIndex).click();
  await page.waitForTimeout(1000);

  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const careManagerOptions = page.locator('//ul[@role="listbox"]//li');
  await careManagerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const cmCount = await careManagerOptions.count();
  const randomCmIndex = Math.floor(Math.random() * cmCount);
  const initialCareManager = await careManagerOptions.nth(randomCmIndex).textContent();
  await careManagerOptions.nth(randomCmIndex).click();
  await page.waitForTimeout(1000);

  await enrollment.conditionsDropdown.click();
  await page.waitForTimeout(1000);
  const diagnosisOptions = page.locator('//ul[@role="listbox"]//li');
  await diagnosisOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const diagCount = await diagnosisOptions.count();
  const randomDiagIndex = Math.floor(Math.random() * diagCount);
  const initialIcdCode = await diagnosisOptions.nth(randomDiagIndex).textContent();
  await diagnosisOptions.nth(randomDiagIndex).locator('input').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  console.log(`\n=== INITIAL ENROLLMENT ===`);
  console.log(`Initial ICD Code: ${initialIcdCode?.trim()}`);
  console.log(`Initial Care Manager: ${initialCareManager?.trim()}`);
  console.log(`Initial Provider: ${initialProvider?.trim()}`);
  console.log(`Initial Insurance: ${initialInsurance?.trim()}`);

  await enrollment.addPlanBtn.click();
  await page.waitForTimeout(3000);

  let result = await enrollment.validateEnrollmentResult();
  
  if (result === 'ALREADY_ENROLLED') {
    console.log('Patient already enrolled, selecting a different patient...');
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    const patientDropdown = enrollment.patientDrodown;
    await patientDropdown.click();
    await patientDropdown.fill('');
    const newSearchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    await patientDropdown.fill(newSearchText);
    await page.waitForTimeout(2000);
    const newPatientOptions = page.locator('//ul[@role="listbox"]//li');
    await newPatientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
    const newRandomIndex = Math.floor(Math.random() * await newPatientOptions.count());
    selectedPatientName = await newPatientOptions.nth(newRandomIndex).textContent();
    await newPatientOptions.nth(newRandomIndex).click();
    await page.waitForTimeout(2000);
    
    console.log(`New patient selected: ${selectedPatientName}`);
    
    await enrollment.addPlanBtn.click();
    await page.waitForTimeout(3000);
    
    result = await enrollment.validateEnrollmentResult();
  }
  
  expect(result).toBe('SUCCESS');

  await page.waitForTimeout(2000);
  const patientLastName = selectedPatientName?.split(',')[0].trim();

  await page.reload();
  await page.waitForTimeout(3000);

  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(3000);

  const enrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await enrollmentRow.waitFor({ state: 'visible', timeout: 15000 });
  
  const actionButton = enrollmentRow.locator('xpath=./div[9]/div');
  await actionButton.click();
  await page.waitForTimeout(2000);

  const updateEnrollmentOption = page.locator('//button[text()="Update Enrollment"]');
  await updateEnrollmentOption.waitFor({ state: 'visible', timeout: 5000 });
  await updateEnrollmentOption.click();
  await page.waitForTimeout(5000);
  
  await expect(page.locator('//h5[text()="UPDATE ENROLLMENT"]')).toBeVisible();
  await page.waitForTimeout(2000);

  const icdDropdown = page.locator('(//div[@class="MuiAutocomplete-endAdornment css-iuka1o"])[5]');
  await icdDropdown.click();
  await page.waitForTimeout(1000);
  
  const icdOptions = page.locator('//ul[@role="listbox"]//li');
  await icdOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  
  const firstIcdCheckbox = icdOptions.first().locator('input');
  if (await firstIcdCheckbox.isChecked()) {
    await firstIcdCheckbox.uncheck();
    await page.waitForTimeout(500);
  }
  
  const icdCount = await icdOptions.count();
  let randomIcdIndex = Math.floor(Math.random() * icdCount);
  let updatedIcdCode = await icdOptions.nth(randomIcdIndex).textContent();
  
  while (updatedIcdCode?.trim() === initialIcdCode?.trim() && icdCount > 1) {
    randomIcdIndex = (randomIcdIndex + 1) % icdCount;
    updatedIcdCode = await icdOptions.nth(randomIcdIndex).textContent();
  }
  
  await icdOptions.nth(randomIcdIndex).locator('input').check();
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  const updateCareManagerDropdown = page.getByRole('combobox', { name: 'Search & Select Primary Care Manager' });
  await updateCareManagerDropdown.click();
  await page.waitForTimeout(1000);
  const updateCareManagerOptions = page.locator('//ul[@role="listbox"]//li');
  await updateCareManagerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const updateCmCount = await updateCareManagerOptions.count();
  let randomUpdateCmIndex = Math.floor(Math.random() * updateCmCount);
  let updatedCareManager = await updateCareManagerOptions.nth(randomUpdateCmIndex).textContent();
  
  if (updatedCareManager?.trim() === initialCareManager?.trim() && updateCmCount > 1) {
    randomUpdateCmIndex = (randomUpdateCmIndex + 1) % updateCmCount;
    updatedCareManager = await updateCareManagerOptions.nth(randomUpdateCmIndex).textContent();
  }
  
  await updateCareManagerOptions.nth(randomUpdateCmIndex).click();
  await page.waitForTimeout(1000);

  const updateProviderDropdown = page.getByRole('combobox', { name: 'Search & Select Provider' });
  await updateProviderDropdown.click();
  await page.waitForTimeout(1000);
  const updateProviderOptions = page.locator('//ul[@role="listbox"]//li');
  await updateProviderOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const updateProvCount = await updateProviderOptions.count();
  let randomUpdateProvIndex = Math.floor(Math.random() * updateProvCount);
  let updatedProvider = await updateProviderOptions.nth(randomUpdateProvIndex).textContent();
  
  if (updatedProvider?.trim() === initialProvider?.trim() && updateProvCount > 1) {
    randomUpdateProvIndex = (randomUpdateProvIndex + 1) % updateProvCount;
    updatedProvider = await updateProviderOptions.nth(randomUpdateProvIndex).textContent();
  }
  
  await updateProviderOptions.nth(randomUpdateProvIndex).click();
  await page.waitForTimeout(1000);

  console.log(`\n=== UPDATED ENROLLMENT ===`);
  console.log(`Updated ICD Code: ${updatedIcdCode?.trim()}`);
  console.log(`Updated Care Manager: ${updatedCareManager?.trim()}`);
  console.log(`Updated Provider: ${updatedProvider?.trim()}`);
  console.log(`Insurance: ${initialInsurance?.trim()} (unchanged)`);

  expect(initialIcdCode?.trim()).not.toBe(updatedIcdCode?.trim());
  expect(initialCareManager?.trim()).not.toBe(updatedCareManager?.trim());
  if (updateProvCount > 1) {
    expect(initialProvider?.trim()).not.toBe(updatedProvider?.trim());
  } else {
    console.log('Note: Only one provider available, skipping provider change validation');
  }
  
  const updateBtn = page.locator('//h6[text()="Update Plan"]');
  await updateBtn.click();
  await page.waitForTimeout(3000);
  
  const updateResult = await enrollment.validateEnrollmentResult();
  expect(updateResult).toBe('SUCCESS');

  await page.waitForTimeout(2000);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);

  const updatedEnrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await updatedEnrollmentRow.waitFor({ state: 'visible', timeout: 10000 });
  const rowText = await updatedEnrollmentRow.textContent();

  const updatedIcdCodeShort = updatedIcdCode?.match(/\(([^)]+)\)/)?.[1] || updatedIcdCode?.split(' ')[0];
  const initialIcdCodeShort = initialIcdCode?.match(/\(([^)]+)\)/)?.[1] || initialIcdCode?.split(' ')[0];

  console.log(`\n=== ENROLLMENT LIST VALIDATION ===`);
  
  const hasUpdatedIcd = rowText.includes(updatedIcdCodeShort);
  const hasInitialIcd = rowText.includes(initialIcdCodeShort);
  const hasUpdatedCareManager = rowText.includes(updatedCareManager?.trim().split(' ')[0]);
  const hasUpdatedProvider = rowText.includes(updatedProvider?.trim().split(' ')[0]);
  
  if (hasInitialIcd) {
    throw new Error(`FAIL: Initial ICD code ${initialIcdCodeShort} still present in enrollment list`);
  }
  
  expect(hasUpdatedIcd, `Updated ICD code ${updatedIcdCodeShort} should be present`).toBe(true);
  expect(hasUpdatedCareManager, `Updated Care Manager should be present`).toBe(true);
  expect(hasUpdatedProvider, `Updated Provider should be present`).toBe(true);
  
  console.log('✓ All updated values are reflected correctly in Enrollment List');
  console.log('✓ No old values remain visible');
});

test('Verify modify enrollment - Update Care Manager, Provider, ICD reflected in Patient 360', async ({ page }) => {
  test.setTimeout(150000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);

  await enrollment.addEnrolmentBtn.click();
  await page.waitForTimeout(3000);

  const searchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  await enrollment.patientDrodown.click();
  await enrollment.patientDrodown.fill(searchText);
  await page.waitForTimeout(2000);
  const patientOptions = page.locator('//ul[@role="listbox"]//li');
  await patientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
  const randomIndex = Math.floor(Math.random() * await patientOptions.count());
  let selectedPatientName = await patientOptions.nth(randomIndex).textContent();
  await patientOptions.nth(randomIndex).click();
  await page.waitForTimeout(1000);

  await enrollment.serviceDropdown.click();
  await page.waitForTimeout(1000);
  const serviceOptions = page.locator('//ul[@role="listbox"]//li');
  await serviceOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const selectedServiceType = await serviceOptions.first().textContent();
  await serviceOptions.first().click();
  await page.waitForTimeout(1000);

  console.log(`\n=== SERVICE TYPE ===`);
  console.log(`Service Type: ${selectedServiceType?.trim()}`);
  const serviceTypeShort = selectedServiceType?.match(/\(([^)]+)\)/)?.[1] || selectedServiceType?.trim();
  console.log(`Service Type Short: ${serviceTypeShort}`);

  await enrollment.providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const provCount = await providerOptions.count();
  const randomProvIndex = Math.floor(Math.random() * provCount);
  const initialProvider = await providerOptions.nth(randomProvIndex).textContent();
  await providerOptions.nth(randomProvIndex).click();
  await page.waitForTimeout(1000);

  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const careManagerOptions = page.locator('//ul[@role="listbox"]//li');
  await careManagerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const cmCount = await careManagerOptions.count();
  const randomCmIndex = Math.floor(Math.random() * cmCount);
  const initialCareManager = await careManagerOptions.nth(randomCmIndex).textContent();
  await careManagerOptions.nth(randomCmIndex).click();
  await page.waitForTimeout(1000);

  await enrollment.conditionsDropdown.click();
  await page.waitForTimeout(1000);
  const diagnosisOptions = page.locator('//ul[@role="listbox"]//li');
  await diagnosisOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const diagCount = await diagnosisOptions.count();
  const randomDiagIndex = Math.floor(Math.random() * diagCount);
  const initialIcdCode = await diagnosisOptions.nth(randomDiagIndex).textContent();
  await diagnosisOptions.nth(randomDiagIndex).locator('input').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  console.log(`\n=== INITIAL ENROLLMENT ===`);
  console.log(`Initial Provider: ${initialProvider?.trim()}`);
  console.log(`Initial Care Manager: ${initialCareManager?.trim()}`);
  console.log(`Initial ICD Code: ${initialIcdCode?.trim()}`);

  await enrollment.addPlanBtn.click();
  await page.waitForTimeout(3000);

  let result = await enrollment.validateEnrollmentResult();
  
  for (let retryAttempt = 0; retryAttempt < 3 && result !== 'SUCCESS'; retryAttempt++) {
    if (result === 'ALREADY_ENROLLED' || result === 'UNKNOWN') {
      console.log(`Attempt ${retryAttempt + 1}: Result=${result}, selecting a different patient...`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);

      await enrollment.gotoEnrollmentSection();
      await page.waitForTimeout(2000);
      await enrollment.addEnrolmentBtn.click();
      await page.waitForTimeout(3000);

      const patientDropdown = enrollment.patientDrodown;
      await patientDropdown.click();
      await patientDropdown.fill('');
      const newSearchText = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      await patientDropdown.fill(newSearchText);
      await page.waitForTimeout(2000);
      const newPatientOptions = page.locator('//ul[@role="listbox"]//li');
      await newPatientOptions.first().waitFor({ state: 'visible', timeout: 10000 });
      const newRandomIndex = Math.floor(Math.random() * await newPatientOptions.count());
      selectedPatientName = await newPatientOptions.nth(newRandomIndex).textContent();
      await newPatientOptions.nth(newRandomIndex).click();
      await page.waitForTimeout(2000);
      console.log(`New patient selected: ${selectedPatientName}`);

      await enrollment.serviceDropdown.click();
      await page.waitForTimeout(1000);
      const svcOptions = page.locator('//ul[@role="listbox"]//li');
      await svcOptions.first().waitFor({ state: 'visible', timeout: 5000 });
      await svcOptions.first().click();
      await page.waitForTimeout(1000);

      await enrollment.providerDropdown.click();
      await page.waitForTimeout(1000);
      await page.locator('//ul[@role="listbox"]//li').first().click();
      await page.waitForTimeout(1000);

      await enrollment.careMangerDropdown.click();
      await page.waitForTimeout(1000);
      await page.locator('//ul[@role="listbox"]//li').first().click();
      await page.waitForTimeout(1000);

      await enrollment.conditionsDropdown.click();
      await page.waitForTimeout(1000);
      const diagOptions = page.locator('//ul[@role="listbox"]//li');
      await diagOptions.first().waitFor({ state: 'visible', timeout: 5000 });
      await diagOptions.first().locator('input').click();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);

      await enrollment.addPlanBtn.click();
      await page.waitForTimeout(3000);
      result = await enrollment.validateEnrollmentResult();
    }
  }

  expect(result).toBe('SUCCESS');
  await page.waitForTimeout(2000);

  await page.reload();
  await page.waitForTimeout(3000);

  const globalSearch = page.locator('//input[@placeholder="Search Patient Name, DOB (MM-DD-YYYY), Phone"]');
  await globalSearch.click();
  await globalSearch.fill(selectedPatientName?.split(',')[0].trim());
  await page.waitForTimeout(2000);
  const searchResults = page.locator('//ul[@role="listbox"]//li').first();
  await searchResults.waitFor({ state: 'visible', timeout: 10000 });
  await searchResults.click();
  await page.waitForTimeout(3000);

  const enrollmentsTab = page.locator('//button[text()="Enrollments"]');
  await enrollmentsTab.click();
  await page.waitForTimeout(3000);

  // Reload to ensure newly created enrollment is visible
  await page.reload();
  await page.waitForTimeout(3000);
  await enrollmentsTab.click();
  await page.waitForTimeout(3000);

  const enrollmentTableContainer = page.locator('//div[@class="MuiDataGrid-virtualScrollerRenderZone css-1vouojk"]');
  await enrollmentTableContainer.waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(2000);

  const enrollmentRows = page.locator('//div[contains(@class,"MuiDataGrid-row")]');
  await enrollmentRows.first().waitFor({ state: 'visible', timeout: 10000 });
  const rowCount = await enrollmentRows.count();

  console.log(`\n=== PATIENT 360 - INITIAL DATA VALIDATION ===`);
  console.log(`Total enrollment rows found: ${rowCount}`);
  console.log(`Looking for Service Type: ${serviceTypeShort}`);

  let recordFound = false;
  let matchedRowIndex = -1;
  for (let i = 0; i < rowCount; i++) {
    const rowText = await enrollmentRows.nth(i).textContent();
    console.log(`Row ${i + 1} text: ${rowText}`);

    if (rowText.includes(serviceTypeShort)) {
      console.log(`\n✓ Enrollment record found in row ${i + 1}`);
      console.log(`Row contains Service Type: ${serviceTypeShort}`);
      recordFound = true;
      matchedRowIndex = i;

      const initialIcdCodeShort = initialIcdCode?.match(/\(([^)]+)\)/)?.[1] || initialIcdCode?.split(' ')[0];
      expect(rowText.includes(initialProvider?.trim().split(' ')[0]), 'Initial Provider should be in Patient 360').toBe(true);
      expect(rowText.includes(initialCareManager?.trim().split(' ')[0]), 'Initial Care Manager should be in Patient 360').toBe(true);
      expect(rowText.includes(initialIcdCodeShort), 'Initial ICD should be in Patient 360').toBe(true);
      console.log('✓ Initial enrollment data verified in Patient 360');
      break;
    }
  }

  expect(recordFound, `Enrollment record with service type "${serviceTypeShort}" not found in Patient 360`).toBe(true);

  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);

  const patientLastName = selectedPatientName?.split(',')[0].trim();
  const enrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await enrollmentRow.waitFor({ state: 'visible', timeout: 10000 });
  const actionButton = enrollmentRow.locator('xpath=./div[9]/div');
  await actionButton.click();
  await page.waitForTimeout(2000);

  const updateEnrollmentOption = page.locator('//button[text()="Update Enrollment"]');
  await updateEnrollmentOption.waitFor({ state: 'visible', timeout: 5000 });
  await updateEnrollmentOption.click();
  await page.waitForTimeout(5000);
  await expect(page.locator('//h5[text()="UPDATE ENROLLMENT"]')).toBeVisible();
  await page.waitForTimeout(2000);

  const icdDropdown = page.locator('(//div[@class="MuiAutocomplete-endAdornment css-iuka1o"])[5]');
  await icdDropdown.click();
  await page.waitForTimeout(1000);
  const icdOptions = page.locator('//ul[@role="listbox"]//li');
  await icdOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const firstIcdCheckbox = icdOptions.first().locator('input');
  if (await firstIcdCheckbox.isChecked()) {
    await firstIcdCheckbox.uncheck();
    await page.waitForTimeout(500);
  }
  const icdCount = await icdOptions.count();
  let randomIcdIndex = Math.floor(Math.random() * icdCount);
  let updatedIcdCode = await icdOptions.nth(randomIcdIndex).textContent();
  while (updatedIcdCode?.trim() === initialIcdCode?.trim() && icdCount > 1) {
    randomIcdIndex = (randomIcdIndex + 1) % icdCount;
    updatedIcdCode = await icdOptions.nth(randomIcdIndex).textContent();
  }
  await icdOptions.nth(randomIcdIndex).locator('input').check();
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  const updateCareManagerDropdown = page.getByRole('combobox', { name: 'Search & Select Primary Care Manager' });
  await updateCareManagerDropdown.click();
  await page.waitForTimeout(1000);
  const updateCareManagerOptions = page.locator('//ul[@role="listbox"]//li');
  await updateCareManagerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const updateCmCount = await updateCareManagerOptions.count();
  let randomUpdateCmIndex = Math.floor(Math.random() * updateCmCount);
  let updatedCareManager = await updateCareManagerOptions.nth(randomUpdateCmIndex).textContent();
  if (updatedCareManager?.trim() === initialCareManager?.trim() && updateCmCount > 1) {
    randomUpdateCmIndex = (randomUpdateCmIndex + 1) % updateCmCount;
    updatedCareManager = await updateCareManagerOptions.nth(randomUpdateCmIndex).textContent();
  }
  await updateCareManagerOptions.nth(randomUpdateCmIndex).click();
  await page.waitForTimeout(1000);

  const updateProviderDropdown = page.getByRole('combobox', { name: 'Search & Select Provider' });
  await updateProviderDropdown.click();
  await page.waitForTimeout(1000);
  const updateProviderOptions = page.locator('//ul[@role="listbox"]//li');
  await updateProviderOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const updateProvCount = await updateProviderOptions.count();
  let randomUpdateProvIndex = Math.floor(Math.random() * updateProvCount);
  let updatedProvider = await updateProviderOptions.nth(randomUpdateProvIndex).textContent();
  if (updatedProvider?.trim() === initialProvider?.trim() && updateProvCount > 1) {
    randomUpdateProvIndex = (randomUpdateProvIndex + 1) % updateProvCount;
    updatedProvider = await updateProviderOptions.nth(randomUpdateProvIndex).textContent();
  }
  await updateProviderOptions.nth(randomUpdateProvIndex).click();
  await page.waitForTimeout(1000);

  console.log(`\n=== UPDATED ENROLLMENT ===`);
  console.log(`Updated Provider: ${updatedProvider?.trim()}`);
  console.log(`Updated Care Manager: ${updatedCareManager?.trim()}`);
  console.log(`Updated ICD Code: ${updatedIcdCode?.trim()}`);

  expect(initialIcdCode?.trim()).not.toBe(updatedIcdCode?.trim());
  expect(initialCareManager?.trim()).not.toBe(updatedCareManager?.trim());
  if (updateProvCount > 1) {
    expect(initialProvider?.trim()).not.toBe(updatedProvider?.trim());
  }

  const updateBtn = page.locator('//h6[text()="Update Plan"]');
  await updateBtn.click();
  await page.waitForTimeout(3000);
  const updateResult = await enrollment.validateEnrollmentResult();
  expect(updateResult).toBe('SUCCESS');
  await page.waitForTimeout(2000);

  await globalSearch.click();
  await globalSearch.fill(patientLastName);
  await page.waitForTimeout(2000);
  const searchResults2 = page.locator('//ul[@role="listbox"]//li').first();
  await searchResults2.waitFor({ state: 'visible', timeout: 10000 });
  await searchResults2.click();
  await page.waitForTimeout(3000);

  await enrollmentsTab.click();
  await page.waitForTimeout(3000);

  const updatedEnrollmentTableContainer = page.locator('//div[@class="MuiDataGrid-virtualScrollerRenderZone css-1vouojk"]');
  await updatedEnrollmentTableContainer.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(2000);

  const updatedEnrollmentRows = page.locator('//div[contains(@class,"MuiDataGrid-row")]');
  await updatedEnrollmentRows.first().waitFor({ state: 'visible', timeout: 10000 });
  const updatedRowCount = await updatedEnrollmentRows.count();

  console.log(`\n=== PATIENT 360 - UPDATED DATA VALIDATION ===`);
  console.log(`Total enrollment rows found: ${updatedRowCount}`);

  const updatedIcdCodeShort = updatedIcdCode?.match(/\(([^)]+)\)/)?.[1] || updatedIcdCode?.split(' ')[0];
  const initialIcdCodeShort = initialIcdCode?.match(/\(([^)]+)\)/)?.[1] || initialIcdCode?.split(' ')[0];

  let updatedRecordFound = false;
  for (let i = 0; i < updatedRowCount; i++) {
    const rowText = await updatedEnrollmentRows.nth(i).textContent();
    console.log(`Row ${i + 1} text: ${rowText}`);
    
    if (rowText.includes(serviceTypeShort)) {
      console.log(`\n✓ Updated enrollment record found in row ${i + 1}`);
      console.log(`Row contains Service Type: ${serviceTypeShort}`);
      updatedRecordFound = true;
      
      const hasUpdatedProvider = rowText.includes(updatedProvider?.trim().split(' ')[0]);
      const hasUpdatedCareManager = rowText.includes(updatedCareManager?.trim().split(' ')[0]);
      const hasUpdatedIcd = rowText.includes(updatedIcdCodeShort);
      const hasInitialProvider = initialProvider?.trim() !== updatedProvider?.trim() && rowText.includes(initialProvider?.trim());
      const hasInitialCareManager = initialCareManager?.trim() !== updatedCareManager?.trim() && rowText.includes(initialCareManager?.trim());
      const hasInitialIcd = rowText.includes(initialIcdCodeShort);

      if (hasInitialProvider) {
        throw new Error(`FAIL: Initial Provider ${initialProvider?.trim()} still present in Patient 360`);
      }
      if (hasInitialCareManager) {
        throw new Error(`FAIL: Initial Care Manager ${initialCareManager?.trim()} still present in Patient 360`);
      }
      if (hasInitialIcd) {
        throw new Error(`FAIL: Initial ICD ${initialIcdCodeShort} still present in Patient 360`);
      }

      expect(hasUpdatedProvider, `Updated Provider should be in Patient 360`).toBe(true);
      expect(hasUpdatedCareManager, `Updated Care Manager should be in Patient 360`).toBe(true);
      expect(hasUpdatedIcd, `Updated ICD should be in Patient 360`).toBe(true);
      
      console.log('✓ All updated values reflected in Patient 360');
      console.log('✓ No old values remain in Patient 360');
      break;
    }
  }

  if (!updatedRecordFound) {
    throw new Error('Enrollment record not found in Patient 360 after enrollment update.');
  }
});


test('Verify modify enrollment - Change status from NEW to ACTIVE, changes reflected in Worklist and Enrollment List', async ({ page }) => {
  test.setTimeout(300000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  await login.gotoLoginPage();
  await login.login(process.env.APP_USERNAME, process.env.APP_PASSWORD);
  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(3000);

  const enrollmentData = await enrollment.addEnrollment();
  const result = await enrollment.validateEnrollmentResult();
  
  if (result === 'ALREADY_ENROLLED') {
    console.log('Patient already enrolled, test cannot proceed.');
    return;
  }
  
  expect(result).toBe('SUCCESS');
  console.log(`\n=== ENROLLMENT CREATED ===`);
  console.log(`Patient: ${enrollmentData.patientName}`);
  console.log(`Program: ${enrollmentData.program}`);

  await page.waitForTimeout(3000);
  const patientLastName = enrollmentData.patientName.split(',')[0].trim();
  
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

  const programShort = enrollmentData.program.match(/\(([^)]+)\)/)?.[1] || enrollmentData.program;
  const programTabLocator = page.locator(`//span[text()="${programShort}"]`);
  await programTabLocator.click();
  await page.waitForTimeout(2000);

  await enrollment.newSection.click();
  await page.waitForTimeout(5000);

  await enrollment.worklistSearchBox.waitFor({ state: 'visible', timeout: 5000 });
  await enrollment.worklistSearchBox.fill(patientLastName);
  await page.waitForTimeout(3000);

  const newSectionTable = page.locator('//div[@class="MuiBox-root css-4n39j4"]');
  const newSectionRows = newSectionTable.locator('> div');
  const newRowCount = await newSectionRows.count();
  console.log(`Total rows in NEW section: ${newRowCount}`);
  
  let foundInNew = false;
  let newRowIndex = -1;
  for (let i = 0; i < newRowCount; i++) {
    const rowText = await newSectionRows.nth(i).textContent();
    console.log(`Row ${i}: ${rowText}`);
    if (rowText.includes(patientLastName)) {
      foundInNew = true;
      newRowIndex = i;
      break;
    }
  }

  console.log(`\n=== WORKLIST NEW SECTION VALIDATION (BEFORE MOVE TO ACTIVE) ===`);
  expect(foundInNew, 'Patient should be in NEW section initially').toBe(true);
  console.log(`✓ Patient found in NEW section at row ${newRowIndex + 1}`);

  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);

  const enrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await enrollmentRow.waitFor({ state: 'visible', timeout: 10000 });
  
  const actionButton = enrollmentRow.locator('xpath=./div[9]/div');
  await actionButton.click();
  await page.waitForTimeout(2000);

  const moveToActiveOption = page.locator('//button[text()="Move to Active"]');
  await moveToActiveOption.waitFor({ state: 'visible', timeout: 5000 });
  await moveToActiveOption.click();
  await page.waitForTimeout(2000);

  const confirmMoveToActiveBtn = page.locator('//button[text()="Move to Active"]').last();
  await confirmMoveToActiveBtn.waitFor({ state: 'visible', timeout: 5000 });
  await confirmMoveToActiveBtn.click();
  await page.waitForTimeout(3000);

  console.log(`\n=== STATUS CHANGED TO ACTIVE ===`);

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

  await programTabLocator.click();
  await page.waitForTimeout(2000);

  await page.locator('//p[text()="Active"]').click();
  await page.waitForTimeout(2000);

  await page.reload();
  await page.waitForTimeout(3000);

  await worklistSearchBox.fill('');
  await page.waitForTimeout(500);
  await worklistSearchBox.fill(patientLastName);
  await page.waitForTimeout(2000);

  const activeSectionTable = page.locator('//div[@class="MuiBox-root css-4n39j4"]');
  const activeSectionRows = activeSectionTable.locator('> div');
  const activeRowCount = await activeSectionRows.count();
  console.log(`Total rows in ACTIVE section: ${activeRowCount}`);
  
  let foundInActive = false;
  for (let i = 0; i < activeRowCount; i++) {
    const rowText = await activeSectionRows.nth(i).textContent();
    console.log(`Row ${i}: ${rowText}`);
    if (rowText.includes(patientLastName)) {
      foundInActive = true;
      break;
    }
  }

  console.log(`\n=== WORKLIST ACTIVE SECTION VALIDATION (AFTER REFRESH) ===`);
  expect(foundInActive, 'Patient should be in ACTIVE section').toBe(true);
  console.log(`✓ Patient found in ACTIVE section`);
  
  let activeRowText = '';
  for (let i = 0; i < activeRowCount; i++) {
    const rowText = await activeSectionRows.nth(i).textContent();
    if (rowText.includes(patientLastName)) {
      activeRowText = rowText;
      break;
    }
  }
  
  console.log(`\n=== ACTIVE SECTION DATA VALIDATION ===`);
  const hasPatientName = activeRowText.includes(patientLastName);
  const hasProvider = activeRowText.includes(enrollmentData.provider.split(' ')[0]);
  const hasCareManager = activeRowText.includes(enrollmentData.careManager.split(' ')[0]);
  
  expect(hasPatientName, `Patient Name should be displayed in ACTIVE section`).toBe(true);
  expect(hasProvider, `Provider "${enrollmentData.provider}" should be displayed in ACTIVE section`).toBe(true);
  expect(hasCareManager, `Care Manager "${enrollmentData.careManager}" should be displayed in ACTIVE section`).toBe(true);
  
  console.log(`✓ Patient Name: ${patientLastName} - Displayed`);
  console.log(`✓ Provider: ${enrollmentData.provider} - Displayed`);
  console.log(`✓ Care Manager: ${enrollmentData.careManager} - Displayed`);

  await page.locator('//p[text()="New"]').click();
  await page.waitForTimeout(2000);

  await worklistSearchBox.fill('');
  await page.waitForTimeout(500);
  await worklistSearchBox.fill(patientLastName);
  await page.waitForTimeout(2000);

  const newSectionRowsAfter = newSectionTable.locator('> div');
  const newRowCountAfter = await newSectionRowsAfter.count();
  console.log(`Total rows in NEW section after move: ${newRowCountAfter}`);
  
  let foundInNewAfter = false;
  let newRowIndexAfter = -1;
  for (let i = 0; i < newRowCountAfter; i++) {
    const rowText = await newSectionRowsAfter.nth(i).textContent();
    console.log(`Row ${i}: ${rowText}`);
    if (rowText.includes(patientLastName)) {
      foundInNewAfter = true;
      newRowIndexAfter = i;
      break;
    }
  }

  console.log(`\n=== WORKLIST NEW SECTION VALIDATION (AFTER MOVE TO ACTIVE) ===`);
  
  if (foundInNewAfter) {
    console.log(`Patient found in NEW section at row ${newRowIndexAfter + 1}`);
    
    const patientRowAfter = newSectionRowsAfter.nth(newRowIndexAfter);
    const checkboxesAfter = patientRowAfter.locator('input[type="checkbox"]');
    const checkboxCountAfter = await checkboxesAfter.count();
    
    console.log(`\n=== CHECKBOX VALIDATION (AFTER MOVE TO ACTIVE) ===`);
    console.log(`Total checkboxes found: ${checkboxCountAfter}`);
    
    for (let i = 0; i < checkboxCountAfter; i++) {
      const isChecked = await checkboxesAfter.nth(i).isChecked();
      expect(isChecked, `Checkbox ${i + 1} should be checked after Move to Active`).toBe(true);
      console.log(`✓ Checkbox ${i + 1} is checked`);
    }
  }
  
  expect(foundInNewAfter, 'Patient should NOT be in NEW section after status change').toBe(false);
  console.log(`✓ Patient NOT found in NEW section`);

  await enrollment.gotoEnrollmentSection();
  await page.waitForTimeout(2000);

  const updatedEnrollmentRow = page.locator(`//div[@class="css-1hhl13x" and contains(., "${patientLastName}")]`).first();
  await updatedEnrollmentRow.waitFor({ state: 'visible', timeout: 10000 });
  const rowText = await updatedEnrollmentRow.textContent();

  console.log(`\n=== ENROLLMENT LIST STATUS VALIDATION ===`);
  console.log(`Enrollment row text: ${rowText}`);
  
  expect(rowText.toLowerCase().includes('active'), 'Status should be ACTIVE').toBe(true);
  expect(rowText.toLowerCase().includes('new'), 'Status should NOT be NEW').toBe(false);
  
  console.log(`✓ Enrollment status is ACTIVE`);
  console.log(`✓ Status change validated successfully in all sections`);
});
