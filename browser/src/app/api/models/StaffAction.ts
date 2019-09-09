import { Role } from "../../model/security-model";

export class StaffAction {
  id?: number;
  author?: string;
  authorRole?: Role;
  description?: string;
  created?: string;
}

export namespace StaffAction {
  export enum Action {
    ADD_BONUS = "ADD_BONUS",
    CREATE_INVITATION = "CREATE_INVITATION",
    REMOVE_INVITATION = "REMOVE_INVITATION",
    CHANGE_LEAD_PRICE = "CHANGE_LEAD_PRICE",
    CREATE_SERVICE_TYPE = "CREATE_SERVICE_TYPE",
    REMOVE_SERVICE_TYPE = "REMOVE_SERVICE_TYPE",
    ACCOUNT_UPDATE = "ACCOUNT_UPDATE",
    ACCOUNT_DELETE = "ACCOUNT_DELETE",
    COMPANY_UPDATE = 'COMPANY_UPDATE',
    USER_CREATED = 'USER_CREATED',
    USER_RESTORED = 'USER_RESTORED',
    COVERAGE_UPDATE = 'COVERAGE_UPDATE'
  }
}
