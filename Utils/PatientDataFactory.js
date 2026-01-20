import { faker } from '@faker-js/faker';

export class PatientDataFactory {

  static generateIndianMobile() {
    const firstDigit = faker.helpers.arrayElement(['6', '7', '8', '9']);
    const remainingDigits = faker.number.int({ min: 100000000, max: 999999999 });
    return `${firstDigit}${remainingDigits}`;
  }

  static generateDOB(minAge = 2, maxAge = 3) {
    const dob = faker.date.birthdate({
      min: minAge,
      max: maxAge,
      mode: 'age'
    });

    return {
      dob,
      day: dob.getDate().toString(),
      monthYear: dob.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    };
  }

  static createPatient() {
    const dobData = this.generateDOB();

    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: this.generateIndianMobile(),
      dob: dobData
    };
  }
}
