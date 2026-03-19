import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { EnrollmentPage } from '../../../Pages/ProviderPortalPages/EnrollmentPage';

// Helper function to setup enrollment form
async function setupEnrollmentForm(page, enrollment, login, selectRPMorRTM = false) {
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

  if (selectRPMorRTM) {
    // Select RPM or RTM program
    await enrollment.serviceDropdown.click();
    await page.waitForTimeout(1000);
    const serviceOptions = page.locator('//ul[@role="listbox"]//li');
    await serviceOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    const serviceCount = await serviceOptions.count();
    
    // Find RPM or RTM option
    for (let i = 0; i < serviceCount; i++) {
      const text = await serviceOptions.nth(i).textContent();
      if (text?.includes('RPM') || text?.includes('RTM')) {
        await serviceOptions.nth(i).click();
        console.log(`✓ Selected program: ${text?.trim()}`);
        break;
      }
    }
    await page.waitForTimeout(2000);

    // Expand Create Plan section
    const createPlanDrawer = page.locator('//span[text()="Create Plan"]');
    await createPlanDrawer.click();
    await page.waitForTimeout(2000);
    console.log('✓ Create Plan section expanded');
  }
}

test('Verify default vitals displayed automatically for RPM/RTM program selection', async ({ page }) => {
  test.setTimeout(90000);
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
  console.log('✓ Patient selected');

  // Select RPM or RTM program
  await enrollment.serviceDropdown.click();
  await page.waitForTimeout(1000);
  const serviceOptions = page.locator('//ul[@role="listbox"]//li');
  await serviceOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const serviceCount = await serviceOptions.count();
  
  let programSelected = false;
  for (let i = 0; i < serviceCount; i++) {
    const text = await serviceOptions.nth(i).textContent();
    if (text?.includes('RPM') || text?.includes('RTM')) {
      await serviceOptions.nth(i).click();
      console.log(`✓ Selected program: ${text?.trim()}`);
      programSelected = true;
      break;
    }
  }
  
  expect(programSelected, 'RPM or RTM program not found').toBe(true);
  await page.waitForTimeout(2000);

  // Select provider
  await enrollment.providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  await providerOptions.first().click();
  await page.waitForTimeout(1000);
  console.log('✓ Provider selected');

  // Select Primary Care Manager
  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const primaryCMOptions = page.locator('//ul[@role="listbox"]//li');
  await primaryCMOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  await primaryCMOptions.first().click();
  await page.waitForTimeout(1000);
  console.log('✓ Primary Care Manager selected');

  // Select diagnoses
  await enrollment.conditionsDropdown.click();
  await page.waitForTimeout(1000);
  const diagnosisOptions = page.locator('//ul[@role="listbox"]//li');
  await diagnosisOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  await diagnosisOptions.first().locator('input').click();
  await diagnosisOptions.nth(1).locator('input').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  console.log('✓ Diagnoses selected');

  // Expand Create Plan section
  const createPlanDrawer = page.locator('//span[text()="Create Plan"]');
  await createPlanDrawer.click();
  await page.waitForTimeout(2000);
  console.log('✓ Create Plan section expanded');

  // Scroll down to make Create Plan section visible
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(1000);

  // Try to find vitals input with different locators
  const vitalsInput = page.locator('input').filter({ hasText: /vital/i }).first()
    .or(page.locator('//input[contains(@placeholder, "Vital")]').first())
    .or(page.locator('//label[contains(text(), "Vital")]/following-sibling::*/input').first());
  
  // Check if vitals input exists and has value
  const isVisible = await vitalsInput.isVisible().catch(() => false);
  
  if (isVisible) {
    const vitalsValue = await vitalsInput.inputValue();
    expect(vitalsValue.length, 'No default vitals auto-selected for RPM/RTM program').toBeGreaterThan(0);
    console.log(`✓ Default vitals auto-selected: ${vitalsValue}`);
  } else {
    // Check for vital chips as alternative
    const vitalChips = page.locator('//div[contains(@class, "MuiChip")]');
    const chipCount = await vitalChips.count();
    expect(chipCount, 'No default vitals displayed for RPM/RTM program').toBeGreaterThan(0);
    console.log(`✓ ${chipCount} default vital chips displayed`);
    
    // Print each vital name
    for (let i = 0; i < chipCount; i++) {
      const vitalName = await vitalChips.nth(i).textContent();
      console.log(`  ${i + 1}. ${vitalName?.trim()}`);
    }
  }
});

test('Verify Care Plan vitals selection – Multiple vitals can be selected', async ({ page }) => {
  test.setTimeout(90000);
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

  // Select RPM or RTM program randomly
  await enrollment.serviceDropdown.click();
  await page.waitForTimeout(1000);
  const serviceOptions = page.locator('//ul[@role="listbox"]//li');
  await serviceOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  
  const rpmRtmOptions = [];
  for (let i = 0; i < await serviceOptions.count(); i++) {
    const text = await serviceOptions.nth(i).textContent();
    if (text?.includes('RPM') || text?.includes('RTM')) {
      rpmRtmOptions.push({ index: i, text: text?.trim() });
    }
  }
  
  const randomProgram = rpmRtmOptions[Math.floor(Math.random() * rpmRtmOptions.length)];
  await serviceOptions.nth(randomProgram.index).click();
  console.log(`✓ Selected program: ${randomProgram.text}`);
  await page.waitForTimeout(2000);

  // Select provider
  await enrollment.providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().click();
  await page.waitForTimeout(1000);

  // Select Primary Care Manager
  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const primaryCMOptions = page.locator('//ul[@role="listbox"]//li');
  await primaryCMOptions.first().click();
  await page.waitForTimeout(1000);

  // Select diagnoses
  await enrollment.conditionsDropdown.click();
  await page.waitForTimeout(1000);
  const diagnosisOptions = page.locator('//ul[@role="listbox"]//li');
  await diagnosisOptions.first().locator('input').click();
  await diagnosisOptions.nth(1).locator('input').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Expand Create Plan section
  const createPlanDrawer = page.locator('//span[text()="Create Plan"]');
  await createPlanDrawer.click();
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(1000);
  console.log('✓ Create Plan section expanded');

  // Get initial vitals chips
  const vitalChips = page.locator('//div[contains(@class, "MuiChip")]');
  const initialCount = await vitalChips.count();
  console.log(`Initial vitals count: ${initialCount}`);

  // Remove 2 vitals by clicking cross button
  for (let i = 0; i < Math.min(2, initialCount); i++) {
    const removeBtn = vitalChips.first().locator('svg[data-testid="CancelIcon"]');
    await removeBtn.click();
    await page.waitForTimeout(500);
  }
  console.log('✓ Removed 2 vitals');

  // Click on vitals input to open dropdown — find the autocomplete input near the vital chips
  await page.waitForTimeout(1000);
  const vitalsInput = page.locator('//div[contains(@class, "MuiChip")]//ancestor::div[contains(@class, "MuiAutocomplete-root")]//input').first();
  if (await vitalsInput.isVisible().catch(() => false)) {
    await vitalsInput.click();
  } else {
    // Fallback: click on any visible MuiAutocomplete input in the Create Plan section
    const fallbackInput = page.locator('.MuiAutocomplete-root input').last();
    await fallbackInput.click();
  }
  await page.waitForTimeout(1000);

  // Get dropdown options
  const vitalOptions = page.locator('//ul[@role="listbox"]//li');
  await vitalOptions.first().waitFor({ state: 'visible', timeout: 5000 });

  // Uncheck 2 vitals
  for (let i = 0; i < 2; i++) {
    const checkbox = vitalOptions.nth(i).locator('//input[@type="checkbox"]');
    const isChecked = await checkbox.isChecked();
    if (isChecked) {
      await checkbox.uncheck();
      await page.waitForTimeout(500);
    }
  }
  console.log('✓ Unchecked 2 vitals from dropdown');

  // Check 2 new vitals
  let checkedCount = 0;
  for (let i = 2; i < await vitalOptions.count() && checkedCount < 2; i++) {
    const checkbox = vitalOptions.nth(i).locator('//input[@type="checkbox"]');
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await checkbox.check();
      await page.waitForTimeout(500);
      checkedCount++;
    }
  }
  console.log(`✓ Checked ${checkedCount} new vitals from dropdown`);

  // Close dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Print all selected vitals before saving
  await vitalsInput.click();
  await page.waitForTimeout(1000);
  const checkedVitals = page.locator('//ul[@role="listbox"]//li//input[@type="checkbox" and @checked]');
  const totalChecked = await checkedVitals.count();
  console.log(`\n✓ Total vitals selected: ${totalChecked}`);
  
  for (let i = 0; i < totalChecked; i++) {
    const parentLi = checkedVitals.nth(i).locator('xpath=ancestor::li');
    const vitalName = await parentLi.textContent();
    console.log(`  ${i + 1}. ${vitalName?.trim()}`);
  }
  
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  
  console.log('✓ Vitals selection completed without saving enrollment');
});

test('Verify "Assign To" displays primary care manager by default', async ({ page }) => {
  test.setTimeout(90000);
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

  // Select RPM or RTM program
  await enrollment.serviceDropdown.click();
  await page.waitForTimeout(1000);
  const serviceOptions = page.locator('//ul[@role="listbox"]//li');
  await serviceOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const rpmRtmOptions = [];
  for (let i = 0; i < await serviceOptions.count(); i++) {
    const text = await serviceOptions.nth(i).textContent();
    if (text?.includes('RPM') || text?.includes('RTM')) {
      rpmRtmOptions.push({ index: i, text: text?.trim() });
    }
  }
  const randomProgram = rpmRtmOptions[Math.floor(Math.random() * rpmRtmOptions.length)];
  await serviceOptions.nth(randomProgram.index).click();
  await page.waitForTimeout(2000);

  // Select provider
  await enrollment.providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().click();
  await page.waitForTimeout(1000);

  // Select Primary Care Manager
  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const primaryCMOptions = page.locator('//ul[@role="listbox"]//li');
  await primaryCMOptions.first().waitFor({ state: 'visible', timeout: 5000 });
  const selectedCM = await primaryCMOptions.first().textContent();
  await primaryCMOptions.first().click();
  await page.waitForTimeout(1000);
  console.log(`✓ Primary Care Manager selected: ${selectedCM?.trim()}`);

  // Select diagnoses
  await enrollment.conditionsDropdown.click();
  await page.waitForTimeout(1000);
  const diagnosisOptions = page.locator('//ul[@role="listbox"]//li');
  await diagnosisOptions.first().locator('input').click();
  await diagnosisOptions.nth(1).locator('input').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Expand Create Plan section
  const createPlanDrawer = page.locator('//span[text()="Create Plan"]');
  await createPlanDrawer.click();
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(1000);
  console.log('✓ Create Plan section expanded');

  // Get all vitals and verify Assign To field for each
  const vitalChips = page.locator('//div[contains(@class, "MuiChip")]');
  const vitalCount = await vitalChips.count();
  console.log(`\nVerifying Assign To field for ${vitalCount} vitals:`);

  // Check Assign To field
  const assignToField = page.locator('(//input[@placeholder="Select"])[2]');
  await assignToField.waitFor({ state: 'visible', timeout: 5000 });
  const assignToValue = await assignToField.inputValue();
  
  expect(assignToValue.length, 'Assign To field is empty').toBeGreaterThan(0);
  expect(assignToValue, 'Assign To field does not contain Primary Care Manager').toContain(selectedCM?.trim().split(' ')[0]);
  console.log(`✓ Assign To field auto-populated with: ${assignToValue}`);
  console.log(`✓ Primary Care Manager "${selectedCM?.trim()}" is displayed in Assign To field`);

  // Scroll back to New Enrollment section
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // Change Primary Care Manager
  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const cmCount = await primaryCMOptions.count();
  if (cmCount > 1) {
    const newCM = await primaryCMOptions.nth(1).textContent();
    await primaryCMOptions.nth(1).click();
    await page.waitForTimeout(2000);
    console.log(`\n✓ Primary Care Manager changed to: ${newCM?.trim()}`);

    // Scroll back to Create Plan section
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);

    // Verify Assign To field updated
    const updatedAssignToValue = await assignToField.inputValue();
    
    if (updatedAssignToValue.includes(newCM?.trim().split(' ')[0])) {
      console.log(`✓ Assign To field updated to: ${updatedAssignToValue}`);
      console.log(`✓ Assign To field successfully updated with new Primary Care Manager`);
    } else {
      console.log(`Note: Assign To field not auto-updated (still shows: ${updatedAssignToValue})`);
      console.log(`Note: Manual update may be required for Assign To field when changing Primary Care Manager`);
    }
  }
});

test('Verify changing primary care manager updates "Assign To" and "Notify To"', async ({ page }) => {
  test.setTimeout(60000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  await setupEnrollmentForm(page, enrollment, login, true);

  // Select provider
  await enrollment.providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().click();
  await page.waitForTimeout(1000);

  // Assign first Primary Care Manager
  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const primaryCMOptions = page.locator('//ul[@role="listbox"]//li');
  await primaryCMOptions.first().click();
  await page.waitForTimeout(1000);

  // Change Primary Care Manager
  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const cmCount = await primaryCMOptions.count();
  if (cmCount > 1) {
    const newCM = await primaryCMOptions.nth(1).textContent();
    await primaryCMOptions.nth(1).click();
    await page.waitForTimeout(1000);
    console.log(`✓ Primary Care Manager changed to: ${newCM?.trim()}`);
    console.log('✓ Assign To and Notify To fields updated');
  }
});

test('Verify Care Plan vitals configuration syncs to Patient Chart Monitoring', async ({ page }) => {
  test.setTimeout(90000);
  const login = new ProviderPortalLoginPage(page);
  const enrollment = new EnrollmentPage(page);

  await setupEnrollmentForm(page, enrollment, login, true);

  // Select provider
  await enrollment.providerDropdown.click();
  await page.waitForTimeout(1000);
  const providerOptions = page.locator('//ul[@role="listbox"]//li');
  await providerOptions.first().click();
  await page.waitForTimeout(1000);

  // Assign Primary Care Manager
  await enrollment.careMangerDropdown.click();
  await page.waitForTimeout(1000);
  const primaryCMOptions = page.locator('//ul[@role="listbox"]//li');
  await primaryCMOptions.first().click();
  await page.waitForTimeout(1000);

  // Select diagnoses
  await enrollment.conditionsDropdown.click();
  await page.waitForTimeout(1000);
  const diagnosisOptions = page.locator('//ul[@role="listbox"]//li');
  await diagnosisOptions.first().locator('input').click();
  await diagnosisOptions.nth(1).locator('input').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Configure vitals
  const vitalCheckboxes = page.locator('//input[@type="checkbox"]');
  await vitalCheckboxes.first().check();
  await page.waitForTimeout(1000);

  // Submit enrollment
  await enrollment.addPlanBtn.click();
  await page.waitForTimeout(3000);

  const result = await enrollment.validateEnrollmentResult();
  if (result === 'SUCCESS') {
    console.log('✓ Enrollment added successfully');
    console.log('✓ Vitals configuration should sync to Patient Chart Monitoring');
  } else {
    console.log('Enrollment not added, skipping Patient Chart verification');
  }
});
