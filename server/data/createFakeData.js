// generateMembers.js
const { faker } = require('@faker-js/faker');

const plans = ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
const genders = ['Male', 'Female', 'Other'];
const statuses = ['Active', 'Inactive'];

const generateMember = () => {
  const joinDate = faker.date.past({ years: 2 });
  const renewalDate = faker.date.between({ from: joinDate, to: new Date() });
  const expiryDate = faker.date.future({ refDate: renewalDate });

  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number('98########'),
    plan: faker.helpers.arrayElement(plans),
    gender: faker.helpers.arrayElement(genders),
    dob: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }),
    joinDate,
    renewalDate,
    expiryDate,
    status: faker.helpers.arrayElement(statuses),
    notes: faker.lorem.sentence(),
  };
};

const members = Array.from({ length: 50 }, generateMember);

module.exports = members;
