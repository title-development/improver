import { Component, OnInit, ViewChild } from '@angular/core';
import { ReviewService } from '../../../api/services/review.service';
import { Pagination, Review } from '../../../model/data-model';
import { MenuItem, SelectItem } from 'primeng';
import { AdminProjectRequest } from '../../../api/models/AdminProjectRequest';
import { filtersToParams } from '../../../api/services/tricks.service';
import { RestPage } from '../../../api/models/RestPage';
import { CamelCaseHumanPipe } from '../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';
import { finalize } from "rxjs/operators";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";
import { clone, getErrorMessage } from "../../../util/functions";

@Component({
  selector: 'admin-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class AdminReviewsComponent {
  displayReviewRevisionDialog: boolean = false;
  @ViewChild('dt') table: any;
  processing = true;
  reviews: RestPage<Review> = new RestPage<Review>();
  rowsPerPage: Array<number> = [10, 50, 100];
  selected: Review;

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'company', header: 'Company', active: true},
    {field: 'customer', header: 'Customer', active: true},
    {field: 'score', header: 'Score', active: true},
    {field: 'created', header: 'Created', active: true},
    {field: 'published', header: 'Published', active: false},
    {field: 'publishDate', header: 'Publish Date', active: false},
    {field: 'revisionRequested', header: 'Revision Requested', active: false},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  contextMenuItems: Array<MenuItem> = [];
  filters: any;

  scoreMinMax: [number, number] = [1, 5];
  scoreFromTo: [number, number] = clone(this.scoreMinMax);

  constructor(private reviewService: ReviewService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              private router: Router,
              private popUpService: PopUpMessageService) {
    this.initContextMenu()
  }

  initContextMenu() {
    this.contextMenuItems =[
      {
        label: 'View Company',
        icon: 'fa fa-building',
        command: () => this.moveToCompany(this.selected)
      },
      {
        label: 'View Customer',
        icon: 'fa fa-user',
        command: () => this.moveToCustomer(this.selected)
      },
      {
        label: 'View Revision Request',
        icon: 'fas fa-star-half-alt',
        visible: this.selected && this.selected.revisionRequested,
        command: () => this.viewRevisionRequest(this.selected)
      }
    ];
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getReviews(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  expandRow(selection: { originalEvent: MouseEvent, data: Review }): void {
    if (!this.table.expandedRows) {
      this.table.expandedRows = [];
    }
    if (this.table.expandedRows.some(item => item.id == selection.data.id)) {
      this.table.expandedRows = this.table.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.table.expandedRows = [];
      this.table.expandedRows.push(selection.data);
    }
  }

  getReviews(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.reviewService.getAllReviews(filters, pagination)
      .pipe(finalize(() => this.processing = false))
      .subscribe(
      (restPage: RestPage<Review>) => {
        this.reviews = restPage;
      }, err => {
          this.popUpService.showError(getErrorMessage(err));
      });
  }

  moveToCompany(review: Review): void {
    this.router.navigate(['admin', 'companies'], {queryParams: {id: review.company.id}});
  }

  moveToCustomer(review: Review): void {
    this.router.navigate(['admin', 'customers'], {queryParams: {id: review.customer.id}});
  }

  viewRevisionRequest(review: Review) {
    this.displayReviewRevisionDialog = true;
  }



}
