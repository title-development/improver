import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ValidatedLocation } from "../../api/models/LocationsValidation";
import { Location } from "../../model/data-model";
import { getErrorMessage } from "../../util/functions";
import { LocationValidateService } from "../../api/services/location-validate.service";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { FormGroup } from "@angular/forms";
import { ReplaySubject } from "rxjs";

@Component({
  selector: 'suggested-location',
  templateUrl: './suggested-location.component.html',
  styleUrls: ['./suggested-location.component.scss']
})
export class SuggestedLocationComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() startValidateLocation: ReplaySubject<boolean> = new ReplaySubject();
  @Output() saveLocation: EventEmitter<Location> = new EventEmitter<Location>();

  @Input() locationValidation: string;
  @Output() locationValidationChange: EventEmitter<string> = new EventEmitter<string>();

  originalAddress: any = {};
  suggestedAddress: any = {};
  validationMessage: string = '';
  spinnerProcessing: boolean = false;


  constructor(private locationValidateService: LocationValidateService,
              public popUpService: PopUpMessageService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.startValidateLocation.subscribe( () => {
      this.validateLocation();
    });
  }

  validateLocation() {
    this.spinnerProcessing = true;
    const location: Location = {
      streetAddress: this.form.value.streetAddress,
      city: this.form.value.city,
      zip: this.form.value.zip,
      state: this.form.value.state
    };
    this.locationValidateService.validate(location)
        .subscribe((validatedLocation: ValidatedLocation) => {
          this.changeDetectorRef.detectChanges();
          if (validatedLocation.valid) {
            this.locationValidationChange.emit('');
            this.saveLocation.emit(location);
          } else {
            if (validatedLocation.suggested) {
              this.spinnerProcessing = false;
              this.originalAddress = location;
              this.suggestedAddress = validatedLocation.suggested;
              this.validationMessage = validatedLocation.validationMsg;
            } else {
              this.spinnerProcessing = false;
            }
            this.locationValidationChange.emit(validatedLocation.error);
          }
        }, err => {
          this.popUpService.showError(getErrorMessage(err));
        });
  }

  choseDifferentAddress() {
    this.startValidateLocation.next(false);
  }

  saveSuggested(suggestedAddress) {
    this.spinnerProcessing = true;
    this.changeDetectorRef.detectChanges();
    this.saveLocation.emit(suggestedAddress);
  }

}
