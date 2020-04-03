import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CompanyInfo, License, Location, SystemMessageType } from '../../../../model/data-model';
import { SecurityService } from '../../../../auth/security.service';
import { Constants } from '../../../../util/constants';
import { Messages } from '../../../../util/messages';
import { CompanyService } from '../../../../api/services/company.service';
import {
  addLicenseDialogConfig,
  confirmDialogConfig,
  locationSuggestDialogConfig,
  personalPhotoDialogConfig
} from '../../../../shared/dialogs/dialogs.configs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LicenseService } from '../../../../api/services/license.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { TricksService } from '../../../../util/tricks.service';
import { LocationValidateService } from '../../../../api/services/location-validate.service';
import { ValidatedLocation } from '../../../../api/models/LocationsValidation';
import { dialogsMap } from '../../../../shared/dialogs/dialogs.state';
import { getErrorMessage } from '../../../../util/functions';
import { first } from "rxjs/internal/operators";
import { switchMap } from "rxjs/operators";

export enum Tabs {
  MAIN = 'MAIN',
  LOCATION = 'LOCATION',
  LICENSES = 'LICENSES'
}

@Component({
  selector: 'company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss']
})

export class CompanyInfoComponent implements OnInit {

  Tabs = Tabs;
  activeTab = Tabs.MAIN;
  photoDialogRef: MatDialogRef<any>;

  companyPicture: string;
  locationAddress: string = 'new';
  companyInfo: CompanyInfo;
  companyLocation: Location;
  licenses: Array<License>;
  filteredStates = [];
  years = [];
  processingAddressValidation: boolean = false;
  showCompanyInfoUpdateMessageTimer: any;
  showCompanyInfoUpdateMessage: boolean = false;
  locationValidation: string;
  private licenseDialogRef: MatDialogRef<any>;
  previousAdditionalEmail: string;
  private confirmDialogRef: MatDialogRef<any>;
  private locationSuggestDialog: MatDialogRef<any>;

  constructor(public constants: Constants,
              public messages: Messages,
              public securityService: SecurityService,
              public tricksService: TricksService,
              private dialog: MatDialog,
              private companyService: CompanyService,
              public popupService: PopUpMessageService,
              private licenseService: LicenseService,
              private locationValidate: LocationValidateService,
              private cd: ChangeDetectorRef) {
    this.constants = constants;
    this.messages = messages;
    this.getCompanyInfo();
    this.getCompanyLicenses();
    this.filteredStates = constants.states;
    this.years = this.tricksService.fillArrayWithNumbers(this.constants.COMPANY_FOUNDATION_MIN_YEAR, new Date().getFullYear(), false);
  }


  ngOnInit() {
  }

  autocompleteSearch(search) {
    if(search && search.length > 0) {
      const regExp: RegExp = new RegExp(`^${search.trim()}`, 'i');
      this.filteredStates = this.constants.states.filter(state => Object.values(state).some(str => regExp.test(str.toString())));
    } else {
      this.filteredStates = this.constants.states;
    }

  }

  getCompanyInfo() {
    this.companyService.get(this.securityService.getLoginModel().company)
      .subscribe(
        companyProfile => {
          this.companyInfo = companyProfile;
          this.companyLocation = companyProfile.location as Location;
          this.previousAdditionalEmail = companyProfile.email;
        },
        err => {
          console.error(err);
        });
  }

  updateCompanyInfo() {
    this.companyService.updateInfo(this.securityService.getLoginModel().company, this.companyInfo)
      .subscribe(
        response => {
          this.popupService.showMessage({
            text: 'Company info is updated',
            type: SystemMessageType.SUCCESS
          });
          this.previousAdditionalEmail = this.companyInfo.email;
        },
        err => {
          console.error(err);
        });
  }

  verifyLocation(form) {
    this.processingAddressValidation = true;
    const locationRequest = {
      streetAddress: form.value.streetAddress,
      city: form.value.city,
      zip: form.value.zip,
      state: form.value.state
    };
    this.locationValidate.validate(locationRequest)
      .subscribe((validatedLocation: ValidatedLocation) => {
        this.processingAddressValidation = false;
        if (validatedLocation.valid) {
          this.locationValidation = '';
          this.updateCompanyLocation(locationRequest);
        } else {
          if (validatedLocation.suggested) {
            this.locationSuggestDialog = this.dialog.open(dialogsMap['location-suggest-dialog'], locationSuggestDialogConfig);
            this.locationSuggestDialog.componentInstance.typed = form.value;
            this.locationSuggestDialog.componentInstance.suggested = validatedLocation.suggested;
            this.locationSuggestDialog.componentInstance.validationMessage = validatedLocation.validationMsg;
            this.locationSuggestDialog.componentInstance.locationVerified.pipe(
              first()
            ).subscribe(formData => {
              this.locationValidation = '';
              this.companyLocation = {...this.companyLocation, ...formData};
              this.updateCompanyLocation(formData);
              this.cd.markForCheck();
            });
          }
          this.locationValidation = validatedLocation.error;
          form.valueChanges.pipe(first()).subscribe(res => {
            this.locationValidation = '';
          });
        }
      }, err => {
        this.popupService.showError(getErrorMessage(err));
      });
    form.valueChanges.pipe(first()).subscribe(res => {
      this.locationValidation = '';
    });
  }

  updateCompanyLocation(companyLocation: any): void {
    this.companyService.updateLocation(this.securityService.getLoginModel().company, companyLocation)
      .subscribe(
        response => {
          this.popupService.showMessage({
            text: 'Company location is updated',
            type: SystemMessageType.SUCCESS
          });
        },
        err => {
          console.error(err);
        }
      );
  }

  getCompanyLicenses() {
    this.licenseService.getCompanyLicenses(this.securityService.getLoginModel().company)
      .subscribe(
        (licenses: Array<License>) => {
          this.licenses = licenses;
        },
        err => {
          console.error(err);
        });
  }

  openLicenseDialog(licenseId?) {
    this.dialog.closeAll();
    this.licenseDialogRef = this.dialog.open(dialogsMap['add-license-dialog'], addLicenseDialogConfig);
    this.licenseDialogRef
      .afterClosed()
      .subscribe(result => {
        this.licenseDialogRef = null;
      });

    this.licenseDialogRef.componentInstance.licenseId = licenseId;

    this.licenseDialogRef.componentInstance.onLicenseAdded.subscribe(
      () => {
        this.getCompanyLicenses();
      }
    );

  }

  openRemoveLicenseConfirm(licenseId) {
    let properties = {
      title: 'Confirm license removal',
      message: 'Are you sure that you want to delete this license?',
      OK: 'Confirm',
      CANCEL: 'Cancel'
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.object = licenseId;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      licenseId => {
        this.removeLicense(licenseId);
      }
    );
  }

  removeLicense(licenseId) {
    this.licenseService.deleteLicense(this.securityService.getLoginModel().company, licenseId).subscribe(
      () => {
        this.getCompanyLicenses();
      },
      err => {
        console.error(err);
      });
  }

  openDialogPhoto(): void {
    this.dialog.closeAll();
    this.photoDialogRef = this.dialog.open(dialogsMap['account-edit-photo-dialog'], personalPhotoDialogConfig);
    this.photoDialogRef.componentInstance.title = "Company logo";
    this.photoDialogRef.componentInstance.originalImage = this.companyInfo.iconUrl;
    this.photoDialogRef.componentInstance.onPhotoReady.pipe(
      switchMap(
        (base64: string) => {
          return this.companyService.updateLogo(this.securityService.getLoginModel().company, base64);
        }
      )
    ).subscribe(
      res => this.setCompanyIconUrl(res.body),
      err => this.popupService.showError(getErrorMessage(err)));
  }

  deleteCompanyLogo(): void {
    this.companyService.deleteLogo(this.securityService.getLoginModel().company).subscribe(
      () => {
        this.setCompanyIconUrl(null);
        this.popupService.showSuccess('Account icon has been deleted');
      }, err => {
        console.error(err);
      });
  }

  private setCompanyIconUrl(iconUrl: string) {
    this.companyInfo.iconUrl = iconUrl;
    // update loginModel icon
    this.securityService.getCurrentUser();
  }

}
