import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Pagination, Review, ServiceType } from '../../../../model/data-model';
import { ReviewService } from '../../../../api/services/review.service';
import { ReviewRating } from '../../../../api/models/ReviewRating';
import { Company } from '../../../../api/models/Company';
import { CompanyService } from '../../../../api/services/company.service';
import { RestPage } from '../../../../api/models/RestPage';
import { CompanyAction } from '../../../../api/models/CompanyAction';
import { BillingService } from '../../../../api/services/billing.service';
import { Project } from '../../../../api/models/Project';
import { Billing } from "../../../../api/models/Billing";
import Transaction = Billing.Transaction;
import { AdminContractor } from "../../../../api/models/AdminContractor";

@Component({
  selector: 'company-preview',
  templateUrl: './companies-preview.component.html',
  styleUrls: ['./companies-preview.component.scss']
})
export class CompaniesPreviewComponent implements OnInit, OnChanges {
  @Input() company: Company;

  reviewDialogToggle: boolean = false;
  reviewRating: ReviewRating = new ReviewRating(0, new RestPage<Review>());
  selectedReview: Review;
  projectPage: RestPage<Project> = new RestPage<Project>();
  companyLogsPage: RestPage<CompanyAction> = new RestPage<CompanyAction>();
  transactionsPage: RestPage<Transaction> = new RestPage<Transaction>();
  offeredServicesPage: RestPage<ServiceType> = new RestPage<ServiceType>();
  rowsPerPage: Array<number> = [10, 50, 100];
  accordionControls = [
    {active: false, first: 0},
    {active: false, first: 0},
    {active: false, first: 0},
    {active: false, first: 0},
    {active: false, first: 0}
  ];
  loading;

  constructor(private reviewService: ReviewService,
              private companyService: CompanyService,
              private billingService: BillingService) {
  }

  ngOnInit(): void {
    this.getContractors()
  }

  selectReview(selection: { originalEvent: MouseEvent, data: any }): void {
    this.reviewDialogToggle = !this.reviewDialogToggle;
    this.selectedReview = selection.data;
  }

  loadLazy(event, callback: (pagination: Pagination) => void): void {
    const pagination: Pagination = new Pagination().fromPrimeNg(event);
    if (typeof callback == 'function') {
      callback.call(this, pagination);
    }
  }

  getContractors() {
    this.companyService.getContractors(this.company.id).subscribe(
      (contractors: Array<AdminContractor>) => this.company.contractors = contractors);
  }

  getProjects(pagination: Pagination): void {
    this.companyService.getAllProjects(this.company.id, pagination).subscribe(
      (page: RestPage<Project>) => this.projectPage = page);
  }

  getReviews(pagination: Pagination): void {
    this.reviewService.getReviews(this.company.id, false, pagination).subscribe(
      (reviewRating: ReviewRating) => this.reviewRating = reviewRating);
  }

  getCompanyLogs(pagination: Pagination): void {
    this.companyService.getCompanyLogs(this.company.id, pagination).subscribe(
      (logs: RestPage<CompanyAction>) => this.companyLogsPage = logs);
  }

  getCompanyTransactions(pagination: Pagination): void {
    this.billingService.getTransactions(this.company.id, pagination).subscribe(
      (transactions: RestPage<Transaction>) => this.transactionsPage = transactions);
  }

  getCompanyServices(pagination: Pagination): void {
    this.companyService.getCompanyServices(this.company.id, pagination).subscribe(
      (offeredServices: RestPage<ServiceType>) => this.offeredServicesPage = offeredServices);
  }

  ngOnChanges(changes): void {
    if (changes.company && changes.company.currentValue) {
      //Getting data for opened accordion
      for (let index in this.accordionControls) {
        if (this.accordionControls[index].active) {
          this.accordionControls[index].first = 0;
          switch (index) {
            case '0':
              this.getCompanyServices(new Pagination(0, this.rowsPerPage[0]));
              break;
            case '1':
              this.getCompanyTransactions(new Pagination(0, this.rowsPerPage[0]));
              break;
            case '2':
              this.getProjects(new Pagination(0, this.rowsPerPage[0]));
              break;
            case '3':
              this.getReviews(new Pagination(0, this.rowsPerPage[0]));
              break;
            case '4':
              this.getCompanyLogs(new Pagination(0, this.rowsPerPage[0]));
              break;
            default:
              break;
          }
        }
      }
    }
  }

  onTabOpen(event): void {
    this.accordionControls[event.index].active = true;
    this.accordionControls[event.index].first = 0;
  }

  onTabClose(event): void {
    this.accordionControls[event.index].active = false;
    this.accordionControls[event.index].first = 0;
  }
}
