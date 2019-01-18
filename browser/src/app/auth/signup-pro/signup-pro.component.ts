import { ApplicationRef, Component, OnDestroy } from '@angular/core';

import { SecurityService } from "../security.service";
import { Constants } from "../../util/constants";
import { Messages } from "app/util/messages";
import { RegistrationService } from '../../api/services/registration.service';
import { TricksService } from "../../util/tricks.service";
import { dialogsMap } from "../../shared/dialogs/dialogs.state";
import {
  confirmDialogConfig, locationSuggestDialogConfig,
  personalPhotoDialogConfig
} from "../../shared/dialogs/dialogs.configs";
import { MatDialog, MatDialogRef } from "@angular/material";
import { applyStyleToMapLayers, GoogleMapUtilsService } from "../../util/google-map.utils";
import { LocationValidateService } from "../../api/services/location-validate.service";
import { ValidatedLocation } from "../../api/models/LocationsValidation";
import { getErrorMessage } from "../../util/functions";
import { RegistrationContractorModel } from "../../model/security-model";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { defaultMapOptions } from "../../util/google-map-default-options";
import { MapOptions } from "@agm/core/services/google-maps-types";
import { SystemMessageType } from "../../model/data-model";
import { first } from "rxjs/internal/operators";
import { BoundariesService } from "../../api/services/boundaries.service";

@Component({
  selector: 'signup-pro-page',
  templateUrl: 'signup-pro.component.html',
  styleUrls: ['signup-pro.component.scss', '../shared/auth.scss']
})

export class SignupProComponent implements OnDestroy {

  METERS_IN_MILE = 1609.34;
  MIN_COVERAGE_RADIUS = 5;
  MAX_COVERAGE_RADIUS = 50;
  MAX_SLIDER_COVERAGE_RADIUS = 50;
  DEFAULT_COVERAGE_RADIUS = 10;
  step: number = 1;
  mapOptions: MapOptions = defaultMapOptions;
  locationSuggestDialog: MatDialogRef<any>;
  photoDialogRef: MatDialogRef<any>;
  confirmDialogRef: MatDialogRef<any>;
  years = [];
  filteredStates = [];
  map: google.maps.Map;
  addressValidationErrorMessage;

  serviceAreaCircle: any;

  addressValidationProcessing = false;
  registrationProcessing = false;

  servedZipCodes: string [];

  password: {
    confirm : ""
  };

  // tmp test data
  contractorRegistration: RegistrationContractorModel = {
    contractor: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
    },
    company: {
      name: "",
      founded: "",
      siteUrl: "",
      email: "",
      phone: "",
      description: "",
      location: {
        streetAddress: "",
        state: "",
        city: "",
        zip: "",
        lat: 0,
        lng: 0
      },
      logo: ""
    },
    tradesAndServices: {
      trades: [],
      services: []
    },
    coverage: {
      center: {
        lat: 0,
        lng: 0
      },
      radius: this.DEFAULT_COVERAGE_RADIUS
    }
  };

  formValidationProps = {
    agree: false
  };

  unsupportedArea: any;

  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              public dialog: MatDialog,
              public tricksService: TricksService,
              public locationValidateService: LocationValidateService,
              public popUpMessageService: PopUpMessageService,
              public registrationService: RegistrationService,
              public boundariesService: BoundariesService,
              private gMapUtils: GoogleMapUtilsService,
              private applicationRef: ApplicationRef) {
    this.years = this.tricksService.fillArrayWithNumbers(this.constants.COMPANY_FOUNDATION_MIN_YEAR, new Date().getFullYear(), false);
    this.contractorRegistration.company.founded = (new Date()).getFullYear().toString();
    this.getServedZipCodes();

    this.boundariesService.getUnsupportedArea().subscribe(unsupportedArea => {
      this.unsupportedArea = unsupportedArea;
    })
  }

  serviceAreaMoveHandler = () => this.onServiceAreaMove();
  serviceAreaRadiusChangeHandler = () => this.onServiceAreaRadiusChange();

  onServiceAreaMove() {
    this.contractorRegistration.coverage.center.lat = this.serviceAreaCircle.center.lat();
    this.contractorRegistration.coverage.center.lng = this.serviceAreaCircle.center.lng();
    this.applicationRef.tick();
  }

  onServiceAreaRadiusChange() {
    let radius = Math.round(this.serviceAreaCircle.radius / this.METERS_IN_MILE);

    if (radius > this.MAX_COVERAGE_RADIUS) {
      this.serviceAreaCircle.setRadius(this.MAX_COVERAGE_RADIUS * this.METERS_IN_MILE);
      this.popUpMessageService.showWarning("Service area shouldn't be bigger than " + this.MAX_COVERAGE_RADIUS + " miles");
      return;
    }

    if (radius < this.MIN_COVERAGE_RADIUS) {
      this.serviceAreaCircle.setRadius(this.MIN_COVERAGE_RADIUS * this.METERS_IN_MILE);
      this.popUpMessageService.showWarning("Service area should be at least " + this.MIN_COVERAGE_RADIUS + " miles");
      return;
    }

    this.map.fitBounds(this.serviceAreaCircle.getBounds());
    this.contractorRegistration.coverage.radius = radius;
    this.applicationRef.tick();
  }

  getServedZipCodes() {
    this.boundariesService.getAllServedZips().subscribe( zipCodes => {
      this.servedZipCodes = zipCodes;
    })
  }

  drawUnsupportedAreaUSA() {
    this.gMapUtils.drawBoundaries(this.map, this.unsupportedArea);
  }

  onMapReady(map: google.maps.Map): void {
    this.map = map;
    applyStyleToMapLayers(this.map);
    this.drawUnsupportedAreaUSA();

    let address = this.contractorRegistration.company.location.streetAddress + " " + this.contractorRegistration.company.location.city;

    this.gMapUtils.addressGeocode(address).subscribe(
      (location) => {
        let lat = (location as any).lat();
        let lng = (location as any).lng();
        this.contractorRegistration.company.location.lat = lat;
        this.contractorRegistration.company.location.lng = lng;
        if (this.contractorRegistration.coverage.center.lat == 0 && this.contractorRegistration.coverage.center.lng == 0) {
          this.contractorRegistration.coverage.center.lat = lat;
          this.contractorRegistration.coverage.center.lng = lng;
        }

        this.map.setCenter(new google.maps.LatLng(this.contractorRegistration.coverage.center.lat, this.contractorRegistration.coverage.center.lng));

        this.gMapUtils.drawCompanyMarker(this.map, new google.maps.LatLng(this.contractorRegistration.company.location.lat, this.contractorRegistration.company.location.lng));

        this.serviceAreaCircle = new google.maps.Circle({
          strokeColor: '#009EDE',
          strokeOpacity: 0.5,
          strokeWeight: 1,
          fillColor: '#14ABE3',
          fillOpacity: 0.3,
          map: this.map,
          center: new google.maps.LatLng(this.contractorRegistration.coverage.center.lat, this.contractorRegistration.coverage.center.lng),
          radius: this.contractorRegistration.coverage.radius * this.METERS_IN_MILE,
          draggable: true,
          editable: true
        });

        this.map.fitBounds(this.serviceAreaCircle.getBounds());

        this.serviceAreaCircle.addListener('center_changed', this.serviceAreaMoveHandler);
        this.serviceAreaCircle.addListener('radius_changed', this.serviceAreaRadiusChangeHandler);

      },
      (err) => {
        console.log(err);
        this.popUpMessageService.showError(err);
      }
    )

  }

  openDialogPhoto(): void {
    this.dialog.closeAll();
    this.photoDialogRef = this.dialog.open(dialogsMap['account-edit-photo-dialog'], personalPhotoDialogConfig);
    this.photoDialogRef.componentInstance.title = "Company logo";
    this.photoDialogRef.componentInstance.onPhotoReady.subscribe(
      (photoBase64) => {
        this.contractorRegistration.company.logo = photoBase64;
      }
    )
  }

  autocompleteSearch(search): void {
    const regExp: RegExp = new RegExp(`^${search.trim()}`, 'i');
    this.filteredStates = this.constants.states.filter(state => Object.values(state).some(str => regExp.test(str.toString())));
  }

  ngOnDestroy(): void {
  }

  radiusChange(event) {
    this.serviceAreaCircle.setRadius(this.contractorRegistration.coverage.radius * this.METERS_IN_MILE);
  }


  onTradesAndServicesChange(tradesAndServices) {
    this.contractorRegistration.tradesAndServices = tradesAndServices;
  }

  submitAccountInfo(form) {
    this.step++
  }

  submitCompanyInfo(form) {
    this.addressValidationProcessing = true;
    const locationRequest = {
      streetAddress: this.contractorRegistration.company.location.streetAddress,
      city: this.contractorRegistration.company.location.city,
      zip: this.contractorRegistration.company.location.zip,
      state: this.contractorRegistration.company.location.state
    };

    this.locationValidateService.validate(locationRequest)
      .subscribe((validatedLocation: ValidatedLocation) => {
          if (validatedLocation.valid) {
            if (this.servedZipCodes.includes(this.contractorRegistration.company.location.zip)) {
              this.step++;
              this.addressValidationProcessing = false;
            } else {
              this.openZipUnsupportedDialog(locationRequest.zip)
            }
          } else {
            if (validatedLocation.suggested) {
              this.addressValidationProcessing = false;
              this.locationSuggestDialog = this.dialog.open(dialogsMap['location-suggest-dialog'], locationSuggestDialogConfig);
              this.locationSuggestDialog.componentInstance.typed = this.contractorRegistration.company.location;
              this.locationSuggestDialog.componentInstance.suggested = validatedLocation.suggested;
              this.locationSuggestDialog.componentInstance.validationMessage = validatedLocation.validationMsg;
              this.locationSuggestDialog.componentInstance.locationVerified.pipe(
                first()
              ).subscribe(formData => {
                this.contractorRegistration.company.location = Object.assign(this.contractorRegistration.company.location, formData);
                validatedLocation.error = null;
                if (this.servedZipCodes.includes(this.contractorRegistration.company.location.zip)) {
                  this.step++;
                } else {
                  this.openZipUnsupportedDialog(validatedLocation.suggested.zip)
                }

              });
              this.locationSuggestDialog.afterClosed().subscribe(result => {
                this.addressValidationErrorMessage = validatedLocation.error;
              });
            } else {
              this.addressValidationProcessing = false;
              this.addressValidationErrorMessage = validatedLocation.error;
            }
          }
        },
        err => {
          this.addressValidationProcessing = false;
          console.log(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });

  }

    openZipUnsupportedDialog(zip) {
    let properties = {
      title: 'We are not serving ' + zip + ' yet.',
      message: 'Just finish registration to be notified when we will be in your area',
      OK: 'OK',
      confirmOnly: true
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
          this.step++;
          this.addressValidationProcessing = false;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
  }

  submitServiceArea(form) {
    if (this.contractorRegistration.coverage.radius < this.MIN_COVERAGE_RADIUS) {
      this.popUpMessageService.showWarning("Coverage should be at least " + this.MIN_COVERAGE_RADIUS + " miles");
      return
    } else if (this.contractorRegistration.coverage.radius > this.MAX_COVERAGE_RADIUS) {
      this.popUpMessageService.showWarning("Coverage shouldn't be bigger then " + this.MAX_COVERAGE_RADIUS + " miles");
      return
    } else {
      this.step++;
    }
  }

  submitLeadPreferences(form) {
    let selectedServicesCount = this.contractorRegistration.tradesAndServices.services.filter(item => item.enabled == true).length;
    let othersIndex = this.contractorRegistration.tradesAndServices.trades.findIndex((obj => obj.id == 0));
    let allowedTradesCount = othersIndex >= 0 ? 1 : 0;
    if (selectedServicesCount == 0 || this.contractorRegistration.tradesAndServices.trades.length <= allowedTradesCount) {
      this.popUpMessageService.showError("Please select at least one Business Category and Service you can provide");
      return
    }

    this.registrationProcessing = true;
    this.registrationService.registerContractor(this.contractorRegistration).subscribe(
      () => {
        this.registrationProcessing = false;
        this.step++;
      }, err => {
        this.registrationProcessing = false;
        console.log(err);
        this.popUpMessageService.showError(getErrorMessage(err));
      }
    );

  }

  resendConfirmation() {
    this.registrationService.resendActivationMail(this.contractorRegistration.contractor.email).subscribe(
      response => {
        this.popUpMessageService.showMessage({
          type: SystemMessageType.SUCCESS,
          text: "A confirmation link has been resent to your email"
        })
      },
      err => {
        console.log(err);
        this.popUpMessageService.showError(JSON.parse(err.error).message);
      }
    );
  }

}
