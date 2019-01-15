import { Component, OnInit, ViewChild } from '@angular/core';
import { ReviewService } from '../../../api/services/review.service';
import { Pagination, Review } from '../../../model/data-model';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { AdminProjectRequest } from '../../../api/models/AdminProjectRequest';
import { filtersToParams } from '../../../util/tricks.service';
import { RestPage } from '../../../api/models/RestPage';
import { CamelCaseHumanPipe } from '../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'admin-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class AdminReviewsComponent {
  displayReviewRevisionDialog: boolean = false;
  @ViewChild('dt') dataTable: any;
  processing = true;
  reviews: RestPage<Review> = new RestPage<Review>();
  rowsPerPage: Array<number> = [10, 50, 100];
  tableColumns: Array<SelectItem> = [];
  selected: Review;
  selectedTableCols: Array<string> = [
    'id',
    'created',
    'customer',
    'score',
    'company'
  ];
  contextMenuItems: Array<MenuItem> = [];
  filters: any;

  constructor(private reviewService: ReviewService, public camelCaseHumanPipe: CamelCaseHumanPipe, private router: Router) {
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

  refresh(): void {
    const paging = {
      first: this.dataTable.first,
      rows: this.dataTable.rows
    };
    this.dataTable.expandedRows = [];
    this.dataTable.paginate(paging);
  }

  loadLazy(event): void {
    this.getReviews(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  selectItem(selection: { originalEvent: MouseEvent, data: Review }): void {
    this.selected = selection.data;
    this.initContextMenu();
  }

  expandRow(selection: { originalEvent: MouseEvent, data: Review }): void {
    if (!this.dataTable.expandedRows) {
      this.dataTable.expandedRows = [];
    }
    if (this.dataTable.expandedRows.some(item => item.id == selection.data.id)) {
      this.dataTable.expandedRows = this.dataTable.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.dataTable.expandedRows = [];
      this.dataTable.expandedRows.push(selection.data);
    }
  }

  getReviews(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.reviewService.getAllReviews(filters, pagination).subscribe(
      (restPage: RestPage<Review>) => {
        this.processing = false;
        this.reviews = restPage;
        if (restPage.content.length > 0) {
          this.tableColumns = [...this.selectedTableCols, ...Object.keys(restPage.content[0])]
            .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
            .filter(item => !(item == 'customerIconUrl' || item == 'description'))
            .map(key => {
                return {label: this.camelCaseHumanPipe.transform(key, true), value: key};
              }
            );
        }
      }, err => {
        this.processing = false;
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
