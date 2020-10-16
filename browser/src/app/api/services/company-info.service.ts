import { EventEmitter, Injectable, Input } from '@angular/core';
import { CompanyInfo, SystemMessageType } from "../../model/data-model";
import { dialogsMap } from "../../shared/dialogs/dialogs.state";
import {
  addLicenseDialogConfig,
  confirmDialogConfig,
  mobileMediaDialogConfig
} from "../../shared/dialogs/dialogs.configs";
import { CompanyService } from "./company.service";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "./pop-up-message.service";
import { SecurityService } from "../../auth/security.service";
import { LocationValidateService } from "./location-validate.service";
import { Constants } from "../../util/constants";
import { LicenseService } from "./license.service";
import { MediaQuery, MediaQueryService } from "./media-query.service";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class CompanyInfoService {

  DEFAULT_COMPANY_IMAGE_URL: string = 'url(/assets/img/pro_avatar.svg)';
  private licenseDialogRef: MatDialogRef<any>;
  private confirmDialogRef: MatDialogRef<any>;
  companyLicensesChanged$: EventEmitter<boolean> = new EventEmitter<boolean>();
  companyLicensesAdd$: EventEmitter<boolean> = new EventEmitter<boolean>();
  companyReviewAdd$: EventEmitter<boolean> = new EventEmitter<boolean>();
  mediaQuery: MediaQuery;


  constructor(private companyService: CompanyService,
              private licenseService: LicenseService,
              private dialog: MatDialog,
              private domSanitizer: DomSanitizer,
              public popupService: PopUpMessageService,
              public securityService: SecurityService,
              public constants: Constants,
              public mediaQueryService: MediaQueryService,
              private locationValidate: LocationValidateService) {
    this.subscribeForMediaQuery();
  }

  subscribeForMediaQuery(){
    this.mediaQueryService.screen
        .subscribe((mediaQuery: MediaQuery) => {
          this.mediaQuery = mediaQuery;
        });
  }

  autocompleteStatesSearchResult(search) {
    let filteredStates;
    if(search && search.length > 0) {
      const regExp: RegExp = new RegExp(`^${search.trim()}`, 'i');
      filteredStates = this.constants.states.filter(state => Object.values(state).some(str => regExp.test(str.toString())));
    } else {
      filteredStates = this.constants.states;
    }
    return filteredStates;
  }

  updateCompanyLocation(companyLocation: any): void {
    this.companyService.updateLocation(this.securityService.getLoginModel().company, companyLocation)
        .subscribe(
          response => {
            this.popupService.showMessage({
              text: 'Company location is updated',
              type: SystemMessageType.SUCCESS
            });
            this.dialog.closeAll();
          },
          err => {
            console.error(err);
          }
        );
  }

  updateCompanyInfo(companyInfo: CompanyInfo) {
    this.companyService.updateInfo(this.securityService.getLoginModel().company, companyInfo)
        .subscribe(
          response => {
            this.dialog.closeAll();
            this.popupService.showMessage({
              text: 'Company info is updated',
              type: SystemMessageType.SUCCESS
            });
          },
          err => {
            console.error(err);
          });
  }

  openLicenseDialog(licenseId?) {
    this.dialog.closeAll();
    let dialogConfig = (this.mediaQuery.xs || this.mediaQuery.sm)? mobileMediaDialogConfig: addLicenseDialogConfig;
    this.licenseDialogRef = this.dialog.open(dialogsMap['add-license-dialog'], dialogConfig);
    this.licenseDialogRef
        .afterClosed()
        .subscribe(result => {
          this.licenseDialogRef = null;
        });

    this.licenseDialogRef.componentInstance.licenseId = licenseId;
    this.licenseDialogRef.componentInstance.onLicenseAdded.subscribe( added => {
      this.companyLicensesAdd$.emit();
    });
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
        this.popupService.showMessage({
          text: 'Company license is deleted',
          type: SystemMessageType.WARN
        });
        this.companyLicensesChanged$.emit();
      },
      err => {
        console.error(err);
      });
  }

  makeTrustedImageURL(image): SafeStyle {
    let imageUrl: string;
    if (image != null && image != '') {
      let imageData: string = JSON.stringify(image).replace(/\\n/g, '');
      imageUrl = 'url(' + imageData + ')';
    } else {
      imageUrl = this.DEFAULT_COMPANY_IMAGE_URL;
    }
    return this.domSanitizer.bypassSecurityTrustStyle(imageUrl);
  }
}
