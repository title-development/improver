import { ChangeDetectorRef, Component, EventEmitter, OnInit } from '@angular/core';
import { CompanyInfo, Location } from "../../../model/data-model";
import { CompanyService } from "../../../api/services/company.service";
import { SecurityService } from "../../../auth/security.service";
import { MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { CompanyInfoService } from "../../../api/services/company-info.service";
import { LocationValidateService } from "../../../api/services/location-validate.service";
import { ReplaySubject } from "rxjs";

@Component({
  selector: 'company-location-dialog',
  templateUrl: './company-location-dialog.component.html',
  styleUrls: ['./company-location-dialog.component.scss']
})
export class CompanyLocationDialogComponent implements OnInit {

  companyLocation: Location = new Location();
  locationValidation: string;
  spinnerProcessing: boolean = false;
  filteredStates: Array<any> = [];
  validationMessage: string = '';
  startValidateLocation: ReplaySubject<boolean> = new ReplaySubject();
  onSuccess: EventEmitter<any> = new EventEmitter<any>();

  constructor(private companyService: CompanyService,
              public currentDialogRef: MatDialogRef<any>,
              public popupService: PopUpMessageService,
              public securityService: SecurityService,
              private locationValidateService: LocationValidateService,
              private changeDetectorRef: ChangeDetectorRef,
              public companyInfoService: CompanyInfoService) {
    this.getCompanyInfo();
  }

  ngOnInit(): void {
  }

  validateLocation(value: boolean) {
    this.startValidateLocation.next(value);
    this.changeDetectorRef.detectChanges()
  }

  getCompanyInfo() {
    this.spinnerProcessing = true;
    this.companyService.get(this.securityService.getLoginModel().company)
        .subscribe(
          (companyInfo: CompanyInfo) => {
            this.companyLocation = companyInfo.location;
            this.filteredStates.push(companyInfo.location.state);
            this.spinnerProcessing = false;
          },
          err => {
            console.error(err);
          });
  }

  autocompleteSearch(search): void {
    setTimeout(() => {
      this.filteredStates = this.companyInfoService.autocompleteStatesSearchResult(search);
    },);
  }

  close() {
    this.currentDialogRef.close();
  }
}
