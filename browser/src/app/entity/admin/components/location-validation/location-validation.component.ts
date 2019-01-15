import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { LocationValidateService } from '../../../../api/services/location-validate.service';
import { ValidatedLocation } from '../../../../api/models/LocationsValidation';
import { Location } from '../../../../model/data-model';
import { SelectItem } from 'primeng/primeng';
import { Constants } from '../../../../util/constants';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'admin-location-validation',
  templateUrl: './location-validation.component.html',
  styleUrls: ['./location-validation.component.scss']
})
export class LocationValidationComponent {

  @Input() location: Location;
  @Input() get toggle(): boolean {
    return this._toggle;
  }

  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onValidatedLocation: EventEmitter<Location> = new EventEmitter<Location>();
  @ViewChild('form') form: NgForm;

  set toggle(value: boolean) {
    this.toggleChange.emit(value);
    this._toggle = value;
  }

  validatedLocation: ValidatedLocation;
  suggested: boolean = false;
  states: Array<SelectItem> = [];
  processing: boolean = false;

  private _toggle: boolean = false;


  constructor(private locationValidateService: LocationValidateService,
              private constants: Constants) {
    this.states = this.constants.states;
  }

  validateLocation(location: Location): void {
    this.processing = true;
    this.locationValidateService.validate(location).subscribe((validatedLocation: ValidatedLocation) => {
      this.processing = false;
      this.validatedLocation = validatedLocation;
      if (validatedLocation.valid) {
        this.save(location);
      } else {
        if (validatedLocation.suggested) {
          this.suggested = true;
        }
      }
    }, err => this.processing = false);
  }

  resetLocation(): void {
    this.suggested = false;
    this.validatedLocation = null;
  }

  save(location: Location): void {
    this.toggle = false;
    this.onValidatedLocation.emit(location);
  }

  onHide(event): void {
    this.resetLocation();
  }

}
