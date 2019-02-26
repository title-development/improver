import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import {
  License
} from '../../../model/data-model';
import { MatDialogRef } from '@angular/material';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { LicenseService } from '../../../api/services/license.service';
import { SecurityService } from '../../../auth/security.service';
import { TricksService } from '../../../util/tricks.service';
import { Constants } from '../../../util/constants';
import { getErrorMessage } from "../../../util/functions";

@Component({
  selector: 'add-license-dialog',
  templateUrl: './add-license-dialog.component.html',
  styleUrls: ['./add-license-dialog.component.scss']
})
export class AddLicenseDialogComponent implements OnInit {

  licenseId: any;
  license: License = {
    state: '',
    accreditation: '',
    number: '',
    expired: ''
  };
  filteredStates: Array<any> = [];
  onLicenseAdded: EventEmitter<any> = new EventEmitter<any>();
  selectedState = null;
  retrieving = false;
  saving = false;


  constructor(public constants: Constants,
              public currentDialogRef: MatDialogRef<any>,
              public securityService: SecurityService,
              public popUpService: PopUpMessageService,
              public licenseService: LicenseService,
              public tricksService: TricksService) {
    this.filteredStates = this.constants.states;
  }

  ngOnInit(): void {
    if (this.licenseId !== undefined) this.getLicense(this.licenseId);
  }

  close(): void {
    this.currentDialogRef.close();
  }

  onAutoCompleteSearch(search: string) {
    const regExp: RegExp = new RegExp(`^${search}`, 'i');
    //todo refactor search
    this.filteredStates = this.constants.states.filter(state => {
      let res: boolean;
      for (let key in state) {
        res = regExp.test(state[key]);
        if (res) {
          break;
        }
      }
      return res;
    });
  }

  getLicense(id): void {
    this.retrieving = true;
    this.licenseService.getLicense(this.securityService.getLoginModel().company, id)
      .subscribe(
        license => {
          this.license = license;
          this.selectedState = license.state;
          this.retrieving = false;
        },
        err => {
          this.retrieving = false;
          this.popUpService.showError(getErrorMessage(err));
        });
  }

  saveLicense(): void {
    this.saving = true;
    this.licenseService.postLicense(this.securityService.getLoginModel().company, this.license)
      .subscribe(
        () => {
          this.saving = false;
          this.onLicenseAdded.emit();
          this.close();
        }, err => {
          this.saving = false;
          this.popUpService.showError(getErrorMessage(err));
        });
  }

  updateLicense(): void {
    this.licenseService.updateLicense(this.securityService.getLoginModel().company, this.license)
      .subscribe(() => {
        this.onLicenseAdded.emit();
        this.close();
      }, err => {
        this.popUpService.showError(getErrorMessage(err));
      })
  }

  onSubmit(form): void {
    this.saveLicense();
  }

}
