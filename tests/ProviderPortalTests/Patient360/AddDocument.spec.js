import { test, expect } from '@playwright/test';
import { ProviderPortalLoginPage } from '../../../Pages/ProviderPortalPages/ProviderPortalLoginPage';
import { Patient360Document } from '../../../Pages/ProviderPortalPages/Patient360Document';
import { WorkListpage } from '../../../Pages/ProviderPortalPages/WorkListpage';
import path from 'path';

test('Add document to patient', async ({ page }) => {
  // Test data
  const testData = {
    patientName: 'Zemlak, Chelsey',
    documentName: `Test Document ${Date.now()}`,
    filePath: path.join(process.cwd(), 'Test-Files', 'AEP Schedule 2024.pdf')
  };

  const login = new ProviderPortalLoginPage(page);
  const worklist = new WorkListpage(page);
  const documents = new Patient360Document(page);

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;

  // Login
  await login.gotoLoginPage();
  await login.login(username, password);
  await page.waitForTimeout(3000);

  // Search patient and navigate to Patient 360
  await worklist.searchPatient(testData.patientName);
  await page.waitForTimeout(3000);

  // Navigate to Documents section
  await documents.clickDocumentsSection();

  // Add document
  await documents.addDocument(testData.documentName, testData.filePath);

  // Verify success message
  const successMsg = await documents.getSuccessMessage();
  console.log('Success message:', successMsg);
  await expect(documents.successMessage).toBeVisible({ timeout: 10000 });
  console.log('Document uploaded successfully');

  // Verify document appears in Education section
  const documentRecord = await documents.verifyDocumentInEducationSection(testData.documentName);
  await expect(documentRecord).toBeVisible();
  console.log(`Document "${testData.documentName}" verified in Education section`);
});
