export const users = {
  customer: {
    email: 'user.improver@gmail.com',
    password: '2019bestHOMEimprove',
    firstName: 'John',
    lastName: 'Down'
  },
  newCustomer: {
    email: 'newuser@gmail.com',
    password: '1qaz2wsx3EDC',
    firstName: 'Morgan\'s-Jr',
    lastName: 'Freeman\'s-Jr',
  },
  notRegisteredCustomer: {
    email: 'notregistereduser@gmail.com',
    password: '1qaz2wsx3EDC',
    firstName: 'David',
    lastName: 'Hasselhof',
    phone: '3891234567'
  },
  anonymous: {
    email: 'anonymous@gmail.com',
    password: '1qaz2wsx3EDC',
    firstName: 'Anthony',
    lastName: 'Hopkins',
  },
  contractor: {
    email: 'contractor.improver@gmail.com',
    password: '2019bestHOMEimprove',
  },
  newContractor: {
    email: 'newcontractor@gmail.com',
    phone: '3891234567',
    password: '1qaz2wsx3EDC',
    firstName: 'Morgan',
    lastName: 'Freeman',
    company: {
      name: 'Best company',
      description: 'Its my Best Company. It was founded yesterday. We are the best Pros in the whole universe'
    }
  }
};

// Incorrect zip for this address
export const partlyValidLocation = {
  streetAddress: '3 ave',
  city: 'New York',
  state: 'New York',
  zip: '10022'
};

export const validLocation = {
  streetAddress: '60 E 54th St',
  city: 'New York',
  state: 'New York',
  zip: '10022'
};

export const validNames = ["David-J", "David1", "O'Connor"];

export const notAllowedNameSymbols = ["*", "$", "#", "+", ")", "&", ":", ";", "^", "/", "@", "_"];
export const zero = "0";
export const letter = "a";

export const notValidEmails = ["abc", "abc@", "abc@gmail", "abc@gmail.", "abc@gmail.c", "abc@gmail/com"];

export const notValidPhones = ["0891234567", "1891234567", "289123456", "0000000000"];

//TODO: create get random letter
export const notValidPasswords = ["aaaaaaaa", "123456789", "aaaa1234"];
export const tooShortPassword = "1aaaaaa";
export const validPasswords = ["aaaaaaa2A", "Sm2=-()*&?^:$#@!"];
export const validConfirmPassword = "bbbbbbb2B";

export const questionaries = {
  withQuestionary: {
    name: "Tile Installation",
    anonymous: {

    },
    user: {

    }
  },
  withoutQuestionary: {
    name: "Tile Floor Repair",
    anonymous: {

    },
    user: {

    }
  },
  projectDetails: 'I want the project to be done quickly and with high quality. I need real professionals'
};

export const unsupportedArea = {
  zip: '56565',
  notInYourAreaMessage: "Sorry, we are not in your area yet",
  comingSoonMessage: "We are coming to your area soon."
};

export const validPaymentCard = {
  cardNumber: 4242424242424242,
  expDate: 1130,
  cvc: 1111,
  postal: 10022
};

