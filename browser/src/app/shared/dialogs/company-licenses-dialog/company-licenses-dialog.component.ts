import { Component, OnInit } from '@angular/core';
import { CompanyInfo, License } from "../../../model/data-model";
import { CompanyService } from "../../../api/services/company.service";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";
import { SecurityService } from "../../../auth/security.service";
import { CompanyInfoService } from "../../../api/services/company-info.service";
import { LicenseService } from "../../../api/services/license.service";
import { dialogsMap } from "../dialogs.state";
import { addLicenseDialogConfig } from "../dialogs.configs";

@Component({
  selector: 'company-licenses-dialog',
  templateUrl: './company-licenses-dialog.component.html',
  styleUrls: ['./company-licenses-dialog.component.scss']
})
export class CompanyLicensesDialogComponent implements OnInit {

  companyLicenses: Array<License> = [];
  spinnerProcessing: boolean = false;

  constructor(private licenseService: LicenseService,
              public currentDialogRef: MatDialogRef<any>,
              public popupService: PopUpMessageService,
              public securityService: SecurityService,
              public dialog: MatDialog,
              public companyInfoService: CompanyInfoService) {
    this.getCompanyLicenses();

    this.companyInfoService.companyLicensesChanged$.subscribe(changed => {
      this.getCompanyLicenses();
    })
  }

  ngOnInit(): void {
  }

  getCompanyLicenses() {
    this.spinnerProcessing = true;
    this.licenseService.getCompanyLicenses(this.securityService.getLoginModel().company)
        .subscribe(
          (licenses: Array<License>) => {
            this.companyLicenses = licenses;
            this.spinnerProcessing = false;
          },
          err => {
            console.error(err);
          });
  }

  close() {
    this.currentDialogRef.close();
  }

}
