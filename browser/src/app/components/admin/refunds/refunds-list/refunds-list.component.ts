import { Component, ViewChild } from '@angular/core';
import { enumToArrayList, filtersToParams } from '../../../../api/services/tricks.service';
import { Pagination } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';
import { RefundService } from '../../../../api/services/refund.service';
import { MenuItem, SelectItem } from 'primeng';
import { Refund } from '../../../../api/models/Refund';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';
import { Project } from '../../../../api/models/Project';
import { capitalize, getErrorMessage, ngPrimeFiltersToParams } from '../../../../util/functions';
import { ProjectService } from '../../../../api/services/project.service';
import { PopUpMessageService } from '../../../../api/services/pop-up-message.service';
import { RefundAction } from '../../../../api/models/RefundAction';
import { finalize, switchMap } from 'rxjs/operators';

@Component({
  selector: 'refunds-list',
  templateUrl: './refunds-list.component.html',
  styleUrls: ['./refunds-list.component.scss']
})
export class RefundsListComponent {
  @ViewChild('dt') table: any;
  processing = true;
  refunds: RestPage<Refund> = new RestPage<Refund>();
  rowsPerPage: Array<number> = [10, 50, 100];
  selected: Refund;
  refundAction;
  refundActionComment: string;
  refundActions: Array<SelectItem> = [
    {label: 'Approve', value: RefundAction.Action.APPROVE},
    {label: 'Reject', value: RefundAction.Action.REJECT},
    {label: 'Comment', value: RefundAction.Action.COMMENT}
  ];
  refundActionDialog: boolean = false;
  refundStatuses: Array<SelectItem> = [];
  refundIssues: Array<SelectItem> = [];
  refundOptions: Array<SelectItem> = [];
  createdFilters
  updatedFilters

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'customer', header: 'Customer', active: true},
    {field: 'contractor', header: 'Contractor', active: true},
    {field: 'issue', header: 'Issue', active: true},
    {field: 'option', header: 'Option', active: true},
    {field: 'status', header: 'Status', active: true},
    {field: 'notes', header: 'Notes', active: false},
    {field: 'comment', header: 'Comment', active: false},
    {field: 'updated', header: 'Updated', active: false},
    {field: 'created', header: 'Created', active: true},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  contextMenuItems: Array<MenuItem> = [];

  filters: any;

  constructor(private refundService: RefundService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              private router: Router,
              public projectService: ProjectService,
              public popUpMessageService: PopUpMessageService,
  ) {
    this.refundStatuses = enumToArrayList(Refund.Status).map(item => {
      return {label: item, value: item};
    });
    this.refundStatuses.unshift({label: 'All', value: ''});
    this.refundIssues = enumToArrayList(Refund.Issue).map(item => {
      return {label: item, value: item};
    });
    this.refundIssues.unshift({label: 'All', value: ''});
    this.refundOptions = enumToArrayList(Refund.Option).map(item => {
      return {label: item, value: item};
    });
    this.refundOptions.unshift({label: 'All', value: ''});
  }

  initContextMenu() {
    this.contextMenuItems = [
      {
        label: 'Approve',
        icon: 'fa fa-check',
        command: () => {
          this.refundActionDialog = true;
          this.refundAction = RefundAction.Action.APPROVE;
        },
        visible: this.selected.status == Refund.Status.IN_REVIEW
      },
      {
        label: 'Reject',
        icon: 'fa fa-minus',
        command: () => {
          this.refundActionDialog = true;
          this.refundAction = RefundAction.Action.REJECT;
        },
        visible: this.selected.status == Refund.Status.IN_REVIEW,
        styleClass: 'danger-menu-button'
      },
      {
        label: 'Comment',
        icon: 'fa fa-comment-o',
        command: () => {
          this.refundActionDialog = true;
          this.refundAction = RefundAction.Action.COMMENT;
        },
        visible: this.selected.status == Refund.Status.IN_REVIEW
      },
      {
        label: 'View Project',
        icon: 'fa fa-list-ul',
        command: () => this.router.navigate(['admin', 'projects'], {queryParams: {id: this.selected.projectId}})
      },
      {
        label: 'View Project Request',
        icon: 'fa fa-handshake-o',
        command: () => this.router.navigate(['admin', 'project-requests'], {queryParams: {id: this.selected.projectRequestId}})
      },
      {
        label: 'View Contractor',
        icon: 'fa fa-user',
        command: () => this.router.navigate(['admin', 'contractors'], {queryParams: {email: this.selected.contractor}})
      },
      {
        label: 'View Customer',
        icon: 'fa fa-user',
        command: () => this.router.navigate(['admin', 'customers'], {queryParams: {email: this.selected.customer}})
      }
    ];
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getRefunds(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(ngPrimeFiltersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  getRefunds(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.refundService.getAll(filters, pagination)
      .pipe(finalize(() => this.processing = false))
      .subscribe(
      (restPage: RestPage<Refund>) => {
        this.refunds = restPage;
      }, err => {
        console.error(err)
      });
  }

  expandRow(selection: { originalEvent: MouseEvent, data }): void {
    if (!this.table.expandedRows) {
      this.table.expandedRows = [];
    }
    if (this.table.expandedRows.some(item => item.id == selection.data.id)) {
      this.table.expandedRows = this.table.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.table.expandedRows = [];
      this.refundService.getRefundActions(selection.data.id).pipe(
        switchMap((refundActions: Array<RefundAction>) => {
            selection.data.refundActions = refundActions;

            return this.projectService.getProject(selection.data.projectId);
          }
        ))
        .subscribe(
          (customerProject: Project) => {
            selection.data.project = customerProject; //making mutation
            this.table.expandedRows.push(selection.data);
          },
          err => {
            console.error(err);
            this.popUpMessageService.showError(getErrorMessage(err));
          });
    }
  }

  submitRefundAction(): void {
    this.refundService.actions(this.selected.id, this.refundAction, this.refundActionComment)
      .subscribe(res => {
        this.popUpMessageService.showSuccess(`Refund request has been ${capitalize(this.refundAction)}${this.refundAction == RefundAction.Action.APPROVE ? 'd' : 'ed'}`);
        this.refundActionDialog = false;
        this.refundActionComment = '';
        if (this.table.expandedRows) {
          this.table.expandedRows.forEach((item) => {
            if (item.id == this.selected.id) {
              this.refundService.getRefundActions(this.selected.id).subscribe((refundActions: Array<RefundAction>) => {
                item.refundActions = refundActions;
              });
            }
          });
        }
        this.refresh();
      }, err => {
        if (err.status == 409) {
          this.popUpMessageService.showError('You can apply Action for Refund only with the status IN_REVIEW');
          this.refundActionComment = '';
        }
      });
  }

}
