import { ApplicationRef, ChangeDetectorRef, Component } from '@angular/core';
import { MapOptions } from '@agm/core/services/google-maps-types';
import { defaultMapOptions } from '../../util/google-map-default-options';
import { CompanyRegistration, LoginModel } from '../../model/security-model';
import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from '../../util/messages';
import { TricksService } from '../../util/tricks.service';
import { LocationValidateService } from '../../api/services/location-validate.service';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { RegistrationService } from '../../api/services/registration.service';
import { BoundariesService } from '../../api/services/boundaries.service';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../util/google-map.utils';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
import {
  confirmDialogConfig,
  locationSuggestDialogConfig,
  personalPhotoDialogConfig
} from '../../shared/dialogs/dialogs.configs';
import { ValidatedLocation } from '../../api/models/LocationsValidation';
import { finalize, first, takeUntil } from 'rxjs/operators';
import { getErrorMessage } from '../../util/functions';
import { SystemMessageType } from '../../model/data-model';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import LatLng = google.maps.LatLng;
import Polygon = google.maps.Polygon;
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'signup-company',
  templateUrl: './signup-company.component.html',
  styleUrls: ['../signup-pro/signup-pro.component.scss', './signup-company.component.scss', '../shared/auth.scss']
})
export class SignupCompanyComponent {
  METERS_IN_MILE = 1609.34;
  MIN_COVERAGE_RADIUS = 5;
  MAX_COVERAGE_RADIUS = 50;
  MAX_SLIDER_COVERAGE_RADIUS = 50;
  DEFAULT_COVERAGE_RADIUS = 10;
  minLatLngPointsInCoverage: number = 9;
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

  isServiceAreaStepDisabled$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  infoWindow: any;
  processing: boolean = false;

  // tmp test data
  companyRegistration: CompanyRegistration = {
    company: {
      name: '',
      founded: '',
      siteUrl: '',
      email: '',
      phone: '',
      description: '',
      location: {
        streetAddress: '',
        state: '',
        city: '',
        zip: '',
        lat: 0,
        lng: 0
      },
      logo: ''
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

  coveragePolygon: Polygon;
  coverageArea: any;
  unsupportedArea: any;
  readonly confirmationResendBlockingTime: number = 15000;
  public static readonly COMPANY_REGISTRATION_STEP_KEY = 'COMPANY_REGISTRATION_STEP';
  public static readonly COMPANY_STORAGE_KEY = 'company';
  private readonly NOT_ACTIVE_USER_KEY: string = 'NOT_ACTIVE_USER';
  private readonly destroyed$ = new Subject<void>();
  private cancelRegistrationDialogRef: MatDialogRef<any>;

  isResendBlocked: boolean = false;

  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              public tricksService: TricksService,
              public locationValidateService: LocationValidateService,
              public popUpMessageService: PopUpMessageService,
              public registrationService: RegistrationService,
              public boundariesService: BoundariesService,
              private changeDetectorRef: ChangeDetectorRef,
              private gMapUtils: GoogleMapUtilsService,
              private applicationRef: ApplicationRef,
              public dialog: MatDialog,
              private router: Router) {
    this.years = this.tricksService.fillArrayWithNumbers(this.constants.COMPANY_FOUNDATION_MIN_YEAR, new Date().getFullYear(), false);
    this.companyRegistration.company.founded = (new Date()).getFullYear().toString();
    this.getIncompleteCompanyRegistration();
    this.getServedZipCodes();

    this.boundariesService.getUnsupportedArea().subscribe(unsupportedArea => {
      this.unsupportedArea = unsupportedArea;
    });
  }

  serviceAreaMoveHandler = () => this.onServiceAreaMove();
  serviceAreaRadiusChangeHandler = () => this.onServiceAreaRadiusChange();

  onServiceAreaMove() {
    this.companyRegistration.coverage.center.lat = this.serviceAreaCircle.center.lat();
    this.companyRegistration.coverage.center.lng = this.serviceAreaCircle.center.lng();
    this.applicationRef.tick();
    this.isCircleAreaInCoverage(this.minLatLngPointsInCoverage);
  }

  onServiceAreaRadiusChange() {
    let radius = Math.round(this.serviceAreaCircle.radius / this.METERS_IN_MILE);

    if (radius > this.MAX_COVERAGE_RADIUS) {
      this.serviceAreaCircle.setRadius(this.MAX_COVERAGE_RADIUS * this.METERS_IN_MILE);
      this.popUpMessageService.showWarning('Service area shouldn\'t be bigger than ' + this.MAX_COVERAGE_RADIUS + ' miles');
      return;
    }

    if (radius < this.MIN_COVERAGE_RADIUS) {
      this.serviceAreaCircle.setRadius(this.MIN_COVERAGE_RADIUS * this.METERS_IN_MILE);
      this.popUpMessageService.showWarning('Service area should be at least ' + this.MIN_COVERAGE_RADIUS + ' miles');
      return;
    }

    this.map.fitBounds(this.serviceAreaCircle.getBounds());
    this.companyRegistration.coverage.radius = radius;
    this.applicationRef.tick();
    this.isCircleAreaInCoverage(this.minLatLngPointsInCoverage);
  }

  getIncompleteCompanyRegistration() {
    if (sessionStorage.getItem(SignupCompanyComponent.COMPANY_REGISTRATION_STEP_KEY) && sessionStorage.getItem(SignupCompanyComponent.COMPANY_STORAGE_KEY)) {
      this.getCompanyModel();
    }
  }

  previousStep() {
    this.step--;
    this.setCompanyModel(this.companyRegistration, this.step);
  }

  nextStep() {
    this.step++;
    this.setCompanyModel(this.companyRegistration, this.step);
  }

  public getCompanyModel() {
    const company = sessionStorage.getItem(SignupCompanyComponent.COMPANY_STORAGE_KEY);
    const companyRegistrationStep = sessionStorage.getItem(SignupCompanyComponent.COMPANY_REGISTRATION_STEP_KEY);
    try {
      this.companyRegistration = JSON.parse(company);
      this.step = JSON.parse(companyRegistrationStep);
    } catch (e) {
      this.securityService.logoutFrontend();
    }
  }

  public setCompanyModel(company: CompanyRegistration, companyRegistrationStep: number){
    sessionStorage.setItem(SignupCompanyComponent.COMPANY_REGISTRATION_STEP_KEY, JSON.stringify(companyRegistrationStep));
    sessionStorage.setItem(SignupCompanyComponent.COMPANY_STORAGE_KEY, JSON.stringify(company));
  }

  removeIncompleteCompanyFromStorage(){
    sessionStorage.removeItem(SignupCompanyComponent.COMPANY_REGISTRATION_STEP_KEY);
    sessionStorage.removeItem(SignupCompanyComponent.COMPANY_STORAGE_KEY);
  }

  getServedZipCodes() {
    this.boundariesService.getAllServedZips().subscribe(zipCodes => {
      this.servedZipCodes = zipCodes;
    });
  }

  getCoveragePolygon() {
    this.boundariesService.getCoverageArea().subscribe(coverage => {
        this.coverageArea = coverage;
        let zipBoundaries: Array<any> = this.coverageArea.geometry.coordinates;

        for (let i = 0; i < zipBoundaries.length; i++) {
          for (let j = 0; j < zipBoundaries[i].length; j++) {
            let value: Array<any> = zipBoundaries[i][j];
            zipBoundaries[i][j] = new google.maps.LatLng(value[1], value[0]);
          }
        }

        this.coveragePolygon = new google.maps.Polygon({
          paths: zipBoundaries[0],
        });

      },
      error => console.log(error))
  }

  drawUnsupportedAreaUSA() {
    this.gMapUtils.drawZipBoundaries(this.map, this.unsupportedArea);
  }

  onMapReady(map: google.maps.Map): void {
    this.map = map;
    applyStyleToMapLayers(this.map);
    this.drawUnsupportedAreaUSA();
    this.getCoveragePolygon();

    let address = this.companyRegistration.company.location.streetAddress + ' ' + this.companyRegistration.company.location.city;

    this.gMapUtils.addressGeocode(address).subscribe(
      (location) => {
        let circleCenter: LatLng;
        let lat = (location as any).lat();
        let lng = (location as any).lng();
        this.companyRegistration.company.location.lat = lat;
        this.companyRegistration.company.location.lng = lng;
        if (this.companyRegistration.coverage.center.lat == 0 && this.companyRegistration.coverage.center.lng == 0) {
          this.companyRegistration.coverage.center.lat = lat;
          this.companyRegistration.coverage.center.lng = lng;
        }

        //Company locations in supported area
        if (!google.maps.geometry.poly.containsLocation(new google.maps.LatLng(this.companyRegistration.coverage.center.lat, this.companyRegistration.coverage.center.lng), this.coveragePolygon)) {
          let latLngBounds = new google.maps.LatLngBounds();
          let polygonPaths = this.coveragePolygon.getPaths();
          polygonPaths.getArray().forEach(polygons => {
            polygons.getArray().forEach(latlng => {
              latLngBounds.extend(latlng);
            })
          });

          circleCenter = new google.maps.LatLng(latLngBounds.getCenter().lat(), latLngBounds.getCenter().lng())
        } else {
          circleCenter = new google.maps.LatLng(this.companyRegistration.coverage.center.lat, this.companyRegistration.coverage.center.lng);
        }

        this.map.setCenter(circleCenter);
        this.gMapUtils.drawCompanyMarker(this.map, new google.maps.LatLng(this.companyRegistration.company.location.lat, this.companyRegistration.company.location.lng));

        this.serviceAreaCircle = new google.maps.Circle({
          strokeColor: '#009EDE',
          strokeOpacity: 0.5,
          strokeWeight: 1,
          fillColor: '#14ABE3',
          fillOpacity: 0.3,
          map: this.map,
          center: circleCenter,
          radius: this.companyRegistration.coverage.radius * this.METERS_IN_MILE,
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
    );

  }

  openDialogPhoto(): void {
    this.dialog.closeAll();
    this.photoDialogRef = this.dialog.open(dialogsMap['account-edit-photo-dialog'], personalPhotoDialogConfig);
    this.photoDialogRef.componentInstance.title = 'Company logo';
    this.photoDialogRef.componentInstance.onPhotoReady.subscribe(
      (photoBase64) => {
        this.companyRegistration.company.logo = photoBase64;
      }
    );
  }

  autocompleteSearch(search): void {
    if (search && search.length > 0) {
      const regExp: RegExp = new RegExp(`^${search.trim()}`, 'i');
      this.filteredStates = this.constants.states.filter(state => Object.values(state).some(str => regExp.test(str.toString())));
    } else {
      this.filteredStates = this.constants.states;
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  radiusChange(event) {
    this.serviceAreaCircle.setRadius(this.companyRegistration.coverage.radius * this.METERS_IN_MILE);
  }


  onTradesAndServicesChange(tradesAndServices) {
    this.companyRegistration.tradesAndServices = tradesAndServices;
  }

  submitCompanyInfo(form) {
    this.addressValidationProcessing = true;
    const locationRequest = {
      streetAddress: this.companyRegistration.company.location.streetAddress,
      city: this.companyRegistration.company.location.city,
      zip: this.companyRegistration.company.location.zip,
      state: this.companyRegistration.company.location.state
    };

    this.locationValidateService.validate(locationRequest)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.addressValidationProcessing = false)
      )
      .subscribe((validatedLocation: ValidatedLocation) => {
          if (validatedLocation.valid) {
            if (this.servedZipCodes.includes(this.companyRegistration.company.location.zip)) {
              this.nextStep();
              this.addressValidationProcessing = false;
            } else {
              this.openZipUnsupportedDialog(locationRequest.zip);
            }
          } else {
            if (validatedLocation.suggested) {
              this.addressValidationProcessing = false;
              this.locationSuggestDialog = this.dialog.open(dialogsMap['location-suggest-dialog'], locationSuggestDialogConfig);
              this.locationSuggestDialog.componentInstance.typed = this.companyRegistration.company.location;
              this.locationSuggestDialog.componentInstance.suggested = validatedLocation.suggested;
              this.locationSuggestDialog.componentInstance.validationMessage = validatedLocation.validationMsg;
              this.locationSuggestDialog.componentInstance.locationVerified.pipe(
                first()
              ).subscribe(formData => {
                this.companyRegistration.company.location = Object.assign(this.companyRegistration.company.location, formData);
                validatedLocation.error = null;
                if (this.servedZipCodes.includes(this.companyRegistration.company.location.zip)) {
                  this.nextStep();
                } else {
                  this.openZipUnsupportedDialog(validatedLocation.suggested.zip);
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
          console.log(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });

  }

  openZipUnsupportedDialog(zip) {
    let properties = {
      title: 'We are not serving ' + zip + ' yet.',
      message: "Home Improve doesn't support " + zip + " ZIP yet. Make sure you selected supported Service Area in the next step.",
      OK: 'OK',
      confirmOnly: true
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
        this.nextStep();
        this.addressValidationProcessing = false;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
  }


  getPointsOnCircle(center: LatLng, radius: number, pointsNumber: number) {
    let d2r = Math.PI / 180;   // degrees to radians
    let r2d = 180 / Math.PI;   // radians to degrees
    let earthsRadius = 3963; // 3963 is the radius of the earth in miles
    let points = pointsNumber;

    // find the radius in lat/lon
    let radiusLat = (radius / earthsRadius) * r2d;
    let radiusLng = radiusLat / Math.cos(center.lat() * d2r);

    let resultPoints = new Array();
    let start = 0;
    let end = points; // one extra here makes sure we connect the path

    for (let i = start; i < end; i = i + 1) {
      let theta = Math.PI * (i / (points / 2));
      let longitude = center.lng() + (radiusLng * Math.cos(theta)); // center a + radius x * cos(theta)
      let latitude = center.lat() + (radiusLat * Math.sin(theta)); // center b + radius y * sin(theta)
      resultPoints.push(new google.maps.LatLng(latitude, longitude));
    }
    return resultPoints;
  }

  isCircleAreaInCoverage(minPointsInCoverage: number) {
    if (this.infoWindow) {
      this.infoWindow.close();
    }

    let pointsNumber: number = 36;
    let infoWindowPosition: LatLng;
    let bigCirclePoints: Array<LatLng> = this.getPointsOnCircle(
      new google.maps.LatLng(this.serviceAreaCircle.center.lat(), this.serviceAreaCircle.center.lng()),
      this.companyRegistration.coverage.radius,
      pointsNumber
    );
    let smallCirclePoints: Array<LatLng> = this.getPointsOnCircle(
      new google.maps.LatLng(this.serviceAreaCircle.center.lat(), this.serviceAreaCircle.center.lng()),
      (this.companyRegistration.coverage.radius / 100 * 65),
      pointsNumber
    );

    if (this.companyRegistration.coverage.radius > 20){
      infoWindowPosition = new google.maps.LatLng(this.serviceAreaCircle.center.lat(), this.serviceAreaCircle.center.lng());
    } else {
      infoWindowPosition = bigCirclePoints[pointsNumber / 4];
    }

    let existsInSupportedZip: boolean = this.isMinPointsNumberInCoverage(bigCirclePoints, smallCirclePoints, minPointsInCoverage);

    if (existsInSupportedZip) {
      this.isServiceAreaStepDisabled$.next(false);
    } else {
      this.infoWindow = new google.maps.InfoWindow({
        content: 'Please, select from supported area '
      });
      this.infoWindow.open(this.map);
      this.infoWindow.setPosition(infoWindowPosition);
      this.isServiceAreaStepDisabled$.next(true);
    }
    this.changeDetectorRef.detectChanges();
  }

  /**
   * @param bigCirclePoints - points on the main circle
   * @param smallCirclePoints - points on a smaller circle for more coverage
   * @param minPointsInCoverage - the lowest number of points in the coverage
   * @return true - when circle are is in coverage
   */
  private isMinPointsNumberInCoverage(bigCirclePoints: Array<LatLng>, smallCirclePoints: Array<LatLng>, minPointsInCoverage: number): boolean {
    let isCircleCenterInCoverage: boolean = google.maps.geometry.poly.containsLocation(new google.maps.LatLng(this.companyRegistration.coverage.center.lat, this.companyRegistration.coverage.center.lng), this.coveragePolygon);
    let hasAdjacentPoints: boolean;
    let hasAdjacentPointsOnSmallCircle: boolean;

    //Center of the circle area is in Coverage
    if (isCircleCenterInCoverage) {
      return true;
    }

    hasAdjacentPoints = this.hasAdjacentPoints(bigCirclePoints, minPointsInCoverage);
    hasAdjacentPointsOnSmallCircle = this.hasAdjacentPoints(smallCirclePoints, (minPointsInCoverage));
    if (this.companyRegistration.coverage.radius <= this.MAX_COVERAGE_RADIUS / 100 * 75) {
      return hasAdjacentPoints && hasAdjacentPointsOnSmallCircle;
    } else {
      return hasAdjacentPoints || hasAdjacentPointsOnSmallCircle;
    }
  }

  hasAdjacentPoints(pointsLatLng: Array<LatLng>, minPointsInCoverage: number): boolean{
    for (let i = 0; i < pointsLatLng.length; i++) {
      if (google.maps.geometry.poly.containsLocation(pointsLatLng[i], this.coveragePolygon)) {
        let nextIndex = i;
        let pointsCounter: number = 1;
        for (let x = 0; x < minPointsInCoverage; x++) {
          nextIndex++;
          if (nextIndex == pointsLatLng.length) {
            nextIndex = 0;
          }
          if (google.maps.geometry.poly.containsLocation(pointsLatLng[nextIndex], this.coveragePolygon)) {
            pointsCounter++;
          } else {
            pointsCounter = 1;
          }
          if (pointsCounter >= minPointsInCoverage) {
            return true;
          }
        }
      }
    }
    return false;
  }

  submitServiceArea(form) {
    if (this.companyRegistration.coverage.radius < this.MIN_COVERAGE_RADIUS) {
      this.popUpMessageService.showWarning('Service area radius should be at least ' + this.MIN_COVERAGE_RADIUS + ' miles');
      return;
    } else if (this.companyRegistration.coverage.radius > this.MAX_COVERAGE_RADIUS) {
      this.popUpMessageService.showWarning('Service area radius shouldn\'t exceed ' + this.MAX_COVERAGE_RADIUS + ' miles');
      return;
    } else {
      this.nextStep();
    }
  }

  submitLeadPreferences(form) {
    let selectedServicesCount = this.companyRegistration.tradesAndServices.services.filter(item => item.enabled == true).length;
    let othersIndex = this.companyRegistration.tradesAndServices.trades.findIndex((obj => obj.id == 0));
    let allowedTradesCount = othersIndex >= 0 ? 1 : 0;
    if (selectedServicesCount == 0 || this.companyRegistration.tradesAndServices.trades.length <= allowedTradesCount) {
      this.popUpMessageService.showError('Please select at least one Trade and Service you can provide');
      return;
    }

    this.registrationProcessing = true;
    this.registrationService.registerCompany(this.companyRegistration)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.registrationProcessing = false)
      )
      .subscribe(
        (response: HttpResponse<any>) => {
          if ((response.body)) {
            this.securityService.loginUser(JSON.parse(response.body) as LoginModel, response.headers.get('authorization'), true);
          } else {
            this.nextStep();
            this.removeIncompleteCompanyFromStorage();
            this.storeUserIdIsSessionStorage(this.securityService.getLoginModel().id);
            this.securityService.logoutFrontend();
          }
        }, err => {
          this.popUpMessageService.showError(getErrorMessage(err));
        }
      );

  }

  setResendConfirmationTimeout() {
    setTimeout(() => {
      this.isResendBlocked = false;
    }, this.confirmationResendBlockingTime);
  }

  resendConfirmation() {
    if (!this.isResendBlocked) {
      this.setResendConfirmationTimeout();
      this.isResendBlocked = true;
      const userId = sessionStorage.getItem(this.NOT_ACTIVE_USER_KEY);
      if (userId) {
        this.registrationService.resendActivationMail(userId)
          .pipe(takeUntil(this.destroyed$))
          .subscribe(
            response => {
              this.popUpMessageService.showMessage({
                type: SystemMessageType.SUCCESS,
                text: 'A confirmation link has been resent to your email'
              });
            },
            err => {
              console.log(err);
              this.isResendBlocked = false;
              this.popUpMessageService.showError(JSON.parse(err.error).message);
            }
          );
      } else {
        this.popUpMessageService.showError('Resend activation to the email is not available anymore');
      }
    }
  }

  cancelRegistration(): void {
    const properties = {
      title: 'Leave Company creation?',
      message: `<p>Once you've created your account, you can come back later to finish the Company profile at your own pace.</p>
                <p>Note. If you leave now, to continue Company profile creation you need to login with your created PRO account credentials.</p>`,
      OK: 'Leave',
      CANCEL: 'Skip'
    };
    this.cancelRegistrationDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.cancelRegistrationDialogRef
      .afterClosed()
      .subscribe(result => {
        this.cancelRegistrationDialogRef = null;
      });
    this.cancelRegistrationDialogRef.componentInstance.properties = properties;
    this.cancelRegistrationDialogRef.componentInstance.onConfirm.subscribe(
      () => {
        this.removeIncompleteCompanyFromStorage();
        this.securityService.logout();
        this.router.navigate(['/become-pro']);
      },
      err => {
        console.log(err);
      }
    );
  }

  private storeUserIdIsSessionStorage(userId: string): void {
    sessionStorage.setItem(this.NOT_ACTIVE_USER_KEY, userId.toString());
  }
}
