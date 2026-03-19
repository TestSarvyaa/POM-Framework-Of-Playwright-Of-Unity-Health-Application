import { faker } from '@faker-js/faker';

export class PatientDataFactory {

  static generateIndianMobile() {
    const firstDigit = faker.helpers.arrayElement(['6', '7', '8', '9']);
    const remainingDigits = faker.number.int({ min: 100000000, max: 999999999 });
    return `${firstDigit}${remainingDigits}`;
  }

  static generateDOB(startDate = new Date('1980-01-01'), endDate = new Date('2000-01-01')) {
    const dob = faker.date.between({ from: startDate, to: endDate });

    return {
      dob,
      day: dob.getDate().toString(),
      monthYear: dob.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      formatted: `${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}-${dob.getFullYear()}`
    };
  }

  static generateAlphabeticName(nameGenerator, minLength = 2) {
    for (let i = 0; i < 10; i++) {
      const rawName = nameGenerator();
      const cleanName = rawName.replace(/[^A-Za-z]/g, '');
      if (cleanName.length >= minLength) {
        return cleanName;
      }
    }
    return faker.string.alpha({ length: { min: minLength, max: 10 }, casing: 'mixed' });
  }

  static createPatient() {
    const dobData = this.generateDOB();
    const firstName = this.generateAlphabeticName(() => faker.person.firstName());
    const lastName = this.generateAlphabeticName(() => faker.person.lastName());

    return {
      firstName,
      lastName,
      phoneNumber: this.generateIndianMobile(),
      dob: dobData
    };
  }
}
