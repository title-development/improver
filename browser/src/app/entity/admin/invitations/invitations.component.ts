import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ConfirmationService, DataTable, FilterMetadata, MenuItem, SelectItem } from 'primeng/primeng';
import { RestPage } from "../../../api/models/RestPage";
import { Role } from "../../../model/security-model";
import { CamelCaseHumanPipe } from "../../../pipes/camelcase-to-human.pipe";
import { Constants } from "../../../util/constants";
import { ActivatedRoute } from "@angular/router";
import { SecurityService } from "../../../auth/security.service";
import { dataTableFilter } from "../util";
import { enumToArrayList, filtersToParams } from "../../../util/tricks.service";
import { Pagination } from "../../../model/data-model";
import { Invitation } from "../../../api/models/Invitation";
import { InvitationService } from "../../../api/services/invitation.service";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../util/functions";
import { NgForm } from "@angular/forms";

@Component({
  selector: 'invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent {
  Role = Role;
  @ViewChild('dt') dataTable: DataTable;
  rowsPerPage: Array<number> = [10, 50, 100];
  invitationsPage: RestPage<Invitation> = new RestPage<Invitation>();
  selectedInvitation: Invitation;
  tableColumns: Array<SelectItem> = [];
  fetching: boolean = true;
  selectedTableCols: Array<string> = [
    'id',
    'email',
    'bonus',
    'created',
    'activated'
  ];
  roles: Array<SelectItem> = [];
  displayInviteDialog: boolean = false;

  bonusTimeout;
  maxBonusValue: number = 99900;
  minBonusValue: number = 10000;
  bonusFilter: Array<number> = [this.minBonusValue, this.maxBonusValue];

  contextMenuItems: Array<MenuItem>;

  filters: { [s: string]: FilterMetadata };
  invitation = new Invitation();

  constructor(private invitationService: InvitationService,
              private confirmationService: ConfirmationService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public constants: Constants,
              private popUpService: PopUpMessageService,
              private route: ActivatedRoute,
              public securityService: SecurityService,
              public changeDetectorRef: ChangeDetectorRef) {
    this.route.queryParams.subscribe(params => {
      this.filters = dataTableFilter('id', params['id']);
    });

    this.roles = enumToArrayList(Role).map(item => {
      return {label: item, value: item};
    });

    this.initContextMenu();

  }

  loadLazy(event, callback: () => void): void {
    const pagination: Pagination = new Pagination().fromPrimeNg(event);
    const filters = filtersToParams(event.filters);
    if (typeof callback == 'function') {
      callback.call(this, filters, pagination);
    }
  }

  initContextMenu () {
    this.contextMenuItems = [
      {
        label: 'Delete',
        icon: 'fa fa-trash',
        command: () => {
          this.delete();
        },
        visible: this.securityService.hasRole(Role.ADMIN)
      },
      {
        label: 'Resend',
        icon: 'fas fa-redo',
        command: () => {
          this.resend();
        },
        visible: this.securityService.hasRole(Role.ADMIN) && this.selectedInvitation && this.selectedInvitation.activated == null
      }
    ];
  }

  getInvitations(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.fetching = true;
    this.invitationService.getAll(filters, pagination).subscribe((invitations: RestPage<Invitation>) => {
      this.fetching = false;
      this.invitationsPage = invitations;
      // fill columns
      if (invitations.content.length > 0) {
        this.tableColumns = [...this.selectedTableCols, ...Object.keys(invitations.content[0])]
          .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
          .map(key => {
              return {label: this.camelCaseHumanPipe.transform(key, true), value: key};
            }
          );
      }
    }, err => {
      this.popUpService.showError(getErrorMessage(err));
      this.fetching = false;
    });
  }

  selectInvitation(selection: { originalEvent: MouseEvent, data: any }): void {
    this.selectedInvitation = selection.data;
    this.initContextMenu();
  }

  clearBonusFilter(col, dt: DataTable): void {
    if (this.bonusTimeout) {
      clearTimeout(this.bonusTimeout);
    }
    this.filters[col.field + 'From'] = {value: this.minBonusValue};
    this.filters[col.field + 'To'] = {value: this.maxBonusValue};
    this.bonusFilter = [this.minBonusValue, this.maxBonusValue];
    this.bonusTimeout = setTimeout(() => {
      dt.filter(null, col.field, col.filterMatchMode);
    }, 350);
  }

  onBonusFilterChange(event, dt: DataTable, col) {
    if (this.bonusTimeout) {
      clearTimeout(this.bonusTimeout);
    }
    this.filters[col.field + 'From'] = {value: event.values[0]};
    this.filters[col.field + 'To'] = {value: event.values[1]};
    this.bonusTimeout = setTimeout(() => {
      dt.filter(null, col.field, col.filterMatchMode);
    }, 350);
  }

  refresh(dataTable): void {
    const paging = {
      first: dataTable.first,
      rows: dataTable.rows
    };
    dataTable.expandedRows = [];
    dataTable.paginate(paging);
  }

  postInvitation(form: NgForm) {
    let invitation = new Invitation();
    Object.assign(invitation, this.invitation);
    invitation.bonus = invitation.bonus * 100;
    this.invitationService.post(invitation).subscribe(
      res => {
        this.popUpService.showSuccess(`Invitation for <b>${this.invitation.email}</b> successfully added`);
        this.displayInviteDialog = false;
        this.getInvitations();
        form.resetForm();
        this.changeDetectorRef.detectChanges();
        this.invitation = new Invitation();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err));
      }
    );

  }

  closeDialog(form: NgForm) {
    form.resetForm();
    this.changeDetectorRef.detectChanges();
    this.invitation = new Invitation();
  }

  delete() {
    this.confirmationService.confirm({
      header: 'Delete invitation',
      message: 'An email with a bonus amount has been already sent to the Contractor. He will not receive the bonus after you delete this invitation. Are you sure you want to delete this invitation?',
      icon: 'fa fa-trash',
      accept: () => {
        this.invitationService.delete(this.selectedInvitation.id).subscribe(
          res => {
            this.refresh(this.dataTable);
            this.popUpService.showSuccess('Invitation deleted');
          },
          err => {
            this.popUpService.showError(getErrorMessage(err));
          });
      }
    });
  }

  resend() {
        this.invitationService.resend(this.selectedInvitation.id).subscribe(
          res => {
            this.refresh(this.dataTable);
            this.popUpService.showSuccess('Invitation resent');
          },
          err => {
            this.popUpService.showError(getErrorMessage(err));
          });
      }
}
