import { Injectable } from '@angular/core';

export const httpStatusCodeResponses = {
  "400": "Malformed request",
  "404": "Resources are not found",
  "405": "Method Not Allowed",
  "409": "Conflict",
  "504": "Server is temporary unavailable, please try again later"
};

@Injectable()
export class Messages {
  errors = {

    default: {
      required: "Required",
      minlength: "Too short",
      maxlength: "Too long"
    },

    name: {
      required: "Name is required",
      notValid: "Name may contain only letters and characters: ',-"
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
      minlength: "Should contain 8 symbols",
      pattern: "Should contain letters and numbers"
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


