import { Component, OnDestroy, OnInit } from '@angular/core';
import { CompanyInfo } from "../../../model/data-model";
import { CompanyService } from "../../../api/services/company.service";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { SecurityService } from "../../../auth/security.service";
import { CompanyInfoService } from "../../../api/services/company-info.service";
import { companyInfoDialogConfig, mobileMediaDialogConfig } from "../dialogs.configs";
import { dialogsMap } from "../dialogs.state";
import { takeUntil } from "rxjs/operators";
import { MediaQuery, MediaQueryService } from "../../../util/media-query.service";
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
	public changeCompanyNameDialogRef: MatDialogRef<any>;
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

	changeCompanyName() {
		this.dialog.closeAll();
		let dialogConfig = (this.mediaQuery.xs || this.mediaQuery.sm) ? mobileMediaDialogConfig : companyInfoDialogConfig;
		this.changeCompanyNameDialogRef = this.dialog.open(dialogsMap['company-info-editor'], dialogConfig);
		this.changeCompanyNameDialogRef
				.afterClosed()
				.subscribe(result => {
					this.changeCompanyNameDialogRef = null;
				});
		let properties = {
			title: 'Edit Company Name',
			placeholder: 'Company name',
			value: this.companyInfo.name
		};
		this.changeCompanyNameDialogRef.componentInstance.properties = properties;
		this.changeCompanyNameDialogRef.componentInstance.onSuccess.subscribe(() =>{
			//TODO implement change company name
		})
	}

	changeCompanyFounded() {
		this.dialog.closeAll();
		let dialogConfig = (this.mediaQuery.xs || this.mediaQuery.sm) ? mobileMediaDialogConfig : companyInfoDialogConfig;
		this.changeCompanyNameDialogRef = this.dialog.open(dialogsMap['company-info-editor'], dialogConfig);
		this.changeCompanyNameDialogRef
				.afterClosed()
				.subscribe(result => {
					this.changeCompanyNameDialogRef = null;
				});
		let properties = {
			title: 'Edit Company Founded',
			placeholder: 'Company Founded',
			value: this.companyInfo.founded
		};
		this.changeCompanyNameDialogRef.componentInstance.properties = properties;
		this.changeCompanyNameDialogRef.componentInstance.onSuccess.subscribe(() =>{
			//TODO implement change company founded
		})
	}

	ngOnDestroy(): void {
		this.destroyed$.next();
		this.destroyed$.complete();
	}

	close() {
		this.currentDialogRef.close();
	}

}
