import { Injectable } from '@angular/core';

export const UNSAVED_CHANGES_MESSAGE: string = 'WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to proceed.';

export const httpStatusCodeResponses = {
  "0"  : "Unknown Error",
  "400": "Malformed request",
  "404": "Resources are not found",
  "405": "Method Not Allowed",
  "409": "Conflict",
  "504": "Server is temporary unavailable, please try again later"
};

@Injectable()
export class TextMessages {
  errors = {

    default: {
      required: "Required",
      minlength: "Too short",
      maxlength: "Too long"
    },

    name: {
      required: "Name is required",
      notValid: "May contain only letters, numbers and characters: ' -"
    },

    firstName: {
      required: "First name is required",
      minlength: "First name is too short",
      maxlength: "First name is too long"
    },

    lastName: {
      required: "Last name is required",
      minlength: "Last name is too short",
      maxlength: "Last name is too long"
    },

    businessName: {
      required: "Business name is required",
    },

    zip: {
      required: "Zip code is required",
      pattern: "Please enter a valid ZIP code"
    },

    phone: {
      required: "Phone number is required",
      pattern: "Phone number format should be xxx-xxx-xxxx"
    },

    email: {
      required: "Email is required",
      pattern: "Email is not valid",
      emailUnique: "Email is already registered",
      companyEmailUnique: "Current email is already used"
    },

    password: {
      required: "Password is required",
      minlength: "Have at least 8 characters",
      letters: "Have at least 1 letter (a, b, c...)",
      number: "Have at least 1 number (1, 2, 3...)",
      specialCharacter: "Have at least 1 special character",
      letterCase: "Upper case and Lower case characters"
    },

    passwordConfirm: {
      required: "Password confirmation is required",
      validateEqual: "Password mismatch"
    },

    cardNumber: {
      required: "Card number is required",
      minlength: "Please enter a valid card number"
    },

    cvv: {
      required: "CVV code is required"
    },

    expDate: {
      required: "Expiration date is required",
      minlength: "Please enter a valid date",
      maxlength: "Please enter a valid date"
    },

    amount: {
      required: "Amount is required",
      minlength: "Amount at least 10$"
    },

    companyName: {
      required: "Company name is required",
      minlength: "Company name is too short",
      maxlength: "Company name is too long",
      nameUnique: "Current name is already used"
    },

    companyDescription: {
      required: "Company description is required",
      minlength: "Company description is too short",
      maxlength: "Company description is too long"
    },

    quickReplayMessage: {
      required: "Message is required",
      minlength: "Message is too short",
      maxlength: "Message is too long"
    }

  };

}


