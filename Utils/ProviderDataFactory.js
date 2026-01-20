import { faker } from '@faker-js/faker';

export class ProviderDataFactory {

  static createProvider() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Take first 2 letters (safe even for short names)
    const firstPart = firstName.substring(0, 2).toLowerCase();
    const lastPart = lastName.substring(0, 2).toLowerCase();

    // Generate 2-digit number (00–99)
    const twoDigitNumber = faker.number.int({ min: 0, max: 99 })
      .toString()
      .padStart(2, '0');

      const username = `${firstPart}${lastPart}${twoDigitNumber}`;

    return {
      firstName,
      lastName,
      username,
      email: faker.internet.email({
        firstName,
        lastName,
        provider: 'testmail.com',
      }).toLowerCase(),

    //   username: `${faker.internet.username({
    //     firstName,
    //     lastName,
    //   }).toLowerCase()}_${Date.now()}`, // ensures uniqueness
    };
  }
}
