import { Component, OnDestroy, OnInit } from '@angular/core';
import { CompanyInfo } from "../../../model/data-model";
import { CompanyService } from "../../../api/services/company.service";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";
import { SecurityService } from "../../../auth/security.service";
import { CompanyInfoService } from "../../../api/services/company-info.service";
import { takeUntil } from "rxjs/operators";
import { MediaQuery, MediaQueryService } from "../../../api/services/media-query.service";
import { Subject } from "rxjs";

@Component({
	selector: 'about-company-dialog',
	templateUrl: './about-company-dialog.component.html',
	styleUrls: ['./about-company-dialog.component.scss']
})
export class AboutCompanyDialogComponent implements OnInit, OnDestroy {

	private readonly destroyed$ = new Subject<void>();

	companyInfo: CompanyInfo = new CompanyInfo();
	spinnerProcessing: boolean = false;
	mediaQuery: MediaQuery;

	constructor(private companyService: CompanyService,
							public currentDialogRef: MatDialogRef<any>,
							public popupService: PopUpMessageService,
							public securityService: SecurityService,
							public dialog: MatDialog,
							public mediaQueryService: MediaQueryService,
							public companyInfoService: CompanyInfoService) {
		this.subscribeForMediaQuery();
		this.getCompanyInfo();
	}

	ngOnInit(): void {
	}

	subscribeForMediaQuery(){
		this.mediaQueryService.screen
				.pipe(takeUntil(this.destroyed$))
				.subscribe((mediaQuery: MediaQuery) => {
					this.mediaQuery = mediaQuery;
				});
	}

	getCompanyInfo() {
		this.spinnerProcessing = true;
		this.companyService.get(this.securityService.getLoginModel().company)
				.subscribe(
					companyProfile => {
						this.companyInfo = companyProfile;
						console.log(this.companyInfo);
						this.spinnerProcessing = false;
					},
					err => {
						console.error(err);
					});
	}

	ngOnDestroy(): void {
		this.destroyed$.next();
		this.destroyed$.complete();
	}

	close() {
		this.currentDialogRef.close();
	}

}
