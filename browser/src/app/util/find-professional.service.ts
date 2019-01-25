import {Injectable} from "@angular/core";
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FindProfessionalService {
  visibilityState: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private showDropdown: boolean = false;

  constructor() {
  }

  toggle(): void {
    this.showDropdown = !this.showDropdown;
    this.visibilityState.next(this.showDropdown);
  }

  close (): void {
    this.showDropdown = false;
    this.visibilityState.next(this.showDropdown);
  }

  open (): void {
    this.showDropdown = true;
    this.visibilityState.next(this.showDropdown);
  }

}
