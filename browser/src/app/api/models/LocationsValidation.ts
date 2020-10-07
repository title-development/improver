import { Location } from '../../model/data-model';

export interface ValidationMessages {
  source: string;
  code: string;
  text: string;
}

export interface ValidationResults {
  isValid: boolean;
  validationMessages: Array<ValidationMessages>;
}

export class LocationValidationRequest {
  streetAddress: string;
  city: string;
  zip: number;
  state: string;
}

export class LocationAddress {
  complete: boolean;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  validationResults: ValidationResults;
}

export class ValidatedLocation {
  valid: boolean;
  suggested: Location;
  error: string;
  validationMsg: string;
}

export class OrderValidationResult {
  projectId: number;
  validatedLocation: ValidatedLocation;
}
