import { Component, ViewChild } from '@angular/core';
import { enumToArrayList, filtersToParams } from '../../../../util/tricks.service';
import { Pagination } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';
import { RefundService } from '../../../../api/services/refund.service';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { Refund } from '../../../../api/models/Refund';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';
import { Project } from '../../../../api/models/Project';
import { capitalize, getErrorMessage } from '../../../../util/functions';
import { ProjectService } from '../../../../api/services/project.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { RefundAction } from '../../../../api/models/RefundAction';

@Component({
  selector: 'refunds-inreview',
  templateUrl: './inreview.component.html',
  styleUrls: ['./inreview.component.scss']
})
export class RefundsInreviewComponent {
  @ViewChild('dt') dataTable: any;
  processing = true;
  refunds: RestPage<Refund> = new RestPage<Refund>();
  rowsPerPage: Array<number> = [10, 50, 100];
  tableColumns: Array<SelectItem> = [];
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
  selectedTableCols: Array<string> = [
    'id',
    'customer',
    'contractor',
    'issue',
    'status',
    'option',
    'created'
  ];
  contextMenuItems: Array<MenuItem> = [
    {
      label: 'Approve',
      icon: 'fa fa-check',
      command: () => {
        this.refundActionDialog = true;
        this.refundAction = RefundAction.Action.APPROVE;
      }
    },
    {
      label: 'Reject',
      icon: 'fa fa-minus',
      command: () => {
        this.refundActionDialog = true;
        this.refundAction = RefundAction.Action.REJECT;
      },
      styleClass: 'danger-menu-button'
    },
    {
      label: 'Comment',
      icon: 'fa fa-comment-o',
      command: () => {
        this.refundActionDialog = true;
        this.refundAction = RefundAction.Action.COMMENT;
      }
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

  refresh(): void {
    const paging = {
      first: this.dataTable.first,
      rows: this.dataTable.rows
    };
    this.dataTable.expandedRows = [];
    this.dataTable.paginate(paging);
  }

  loadLazy(event): void {
    this.getRefunds(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  getRefunds(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    filters['status'] = Refund.Status.IN_REVIEW;
    this.refundService.getAll(filters, pagination).subscribe(
      (restPage: RestPage<Refund>) => {
        this.processing = false;
        this.refunds = restPage;
        if (restPage.content.length > 0) {
          this.tableColumns = [...this.selectedTableCols, ...Object.keys(restPage.content[0])]
            .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
            .filter(item => !(item == 'projectId' || item == 'projectRequestId' || item == 'refundActions'))
            .map(key => {
                return {label: this.camelCaseHumanPipe.transform(key, true), value: key};
              }
            );
        }
      }, err => {
        this.processing = false;
      });
  }

  selectItem(selection: { originalEvent: MouseEvent, data: Refund }): void {
    this.selected = selection.data;
  }

  expandRow(selection: { originalEvent: MouseEvent, data }): void {
    if (!this.dataTable.expandedRows) {
      this.dataTable.expandedRows = [];
    }
    if (this.dataTable.expandedRows.some(item => item.id == selection.data.id)) {
      this.dataTable.expandedRows = this.dataTable.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.dataTable.expandedRows = [];
      this.projectService.getProject(selection.data.projectId).subscribe(
        (customerProject: Project) => {
          selection.data.project = customerProject; //making mutation
          this.dataTable.expandedRows.push(selection.data);
        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });
    }
  }

  submitRefundAction(): void {
    this.refundService.actions(this.selected.id, this.refundAction, this.refundActionComment)
      .subscribe(res => {
        this.popUpMessageService.showSuccess(`Return credit request has been ${capitalize(this.refundAction)}${this.refundAction == RefundAction.Action.APPROVE ? 'd' : 'ed'}`);
        this.refundActionDialog = false;
        this.refundActionComment = '';
        if (this.dataTable.expandedRows) {
          this.dataTable.expandedRows.forEach((item) => {
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
