export class WorkListPage
{
    constructor(page)
    {
        this.page = page
        this.enrolmentNewSection = page.locator('//div/div//p[text()="New"]');
    }
}