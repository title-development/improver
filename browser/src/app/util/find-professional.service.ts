import {Injectable} from "@angular/core";

@Injectable()
export class FindProfessionalService {
  showDropdown: boolean = false;

  constructor() {
  }

  toggle() {
    this.showDropdown = !this.showDropdown;
  }
}
