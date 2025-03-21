import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ConfirmationService, Table, FilterMetadata, MenuItem, SelectItem } from 'primeng';
import { RestPage } from "../../../api/models/RestPage";
import { Role } from "../../../model/security-model";
import { CamelCaseHumanPipe } from "../../../pipes/camelcase-to-human.pipe";
import { Constants } from "../../../util/constants";
import { ActivatedRoute } from "@angular/router";
import { SecurityService } from "../../../auth/security.service";
import { dataTableFilter } from "../util";
import { enumToArrayList, filtersToParams } from "../../../api/services/tricks.service";
import { Pagination } from "../../../model/data-model";
import { Invitation } from "../../../api/models/Invitation";
import { InvitationService } from "../../../api/services/invitation.service";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";
import { clone, getErrorMessage, ngPrimeFiltersToParams } from "../../../util/functions";
import { NgForm } from "@angular/forms";

@Component({
  selector: 'invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent {
  Role = Role;
  @ViewChild('dt') table: Table;
  rowsPerPage: Array<number> = [10, 50, 100];
  invitationsPage: RestPage<Invitation> = new RestPage<Invitation>();
  selectedInvitation: Invitation;
  fetching: boolean = true;

  bonusMinMax: [number, number] = [100, 999];
  bonusFromTo: [number, number] = clone(this.bonusMinMax);

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'email', header: 'Email', active: true},
    {field: 'bonus', header: 'Bonus', active: true},
    {field: 'created', header: 'Created', active: true},
    {field: 'activated', header: 'Activated', active: true},
    {field: 'description', header: 'Description', active: true},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  roles: Array<SelectItem> = [];
  displayInviteDialog: boolean = false;

  contextMenuItems: Array<MenuItem>;

  filters: { [s: string]: FilterMetadata };
  invitation = new Invitation();
  processing = false;
  createdFilters;

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

  initContextMenu () {
    this.contextMenuItems = [
      {
        label: 'Delete',
        icon: 'fa fa-trash',
        command: () => {
          this.delete();
        },
        visible: this.securityService.hasRole(Role.ADMIN) && this.selectedInvitation && this.selectedInvitation.activated == null
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

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getInvitations(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(ngPrimeFiltersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  getInvitations(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.fetching = true;
    this.invitationService.getAll(filters, pagination).subscribe((invitations: RestPage<Invitation>) => {
      this.fetching = false;
      this.invitationsPage = invitations;
    }, err => {
      this.popUpService.showError(getErrorMessage(err));
      this.fetching = false;
    });
  }

  selectInvitation(selection: { originalEvent: MouseEvent, data: any }): void {
    this.selectedInvitation = selection.data;
    this.initContextMenu();
  }

  onInvitationEmailAdd(event) {
    if (!new RegExp(this.constants.patterns.email).test(event.value)) {
      this.invitation.emails = this.invitation.emails.filter(item => item != event.value);
      this.popUpService.showError("Please enter a valid email")
    }
  }

  postInvitation(form: NgForm) {
    this.processing = true;
    if (this.invitation.emails.length === 0) {
      return this.popUpService.showError("Add at least one company email to invitation");
    }

    let invitation = new Invitation();
    Object.assign(invitation, this.invitation);
    invitation.bonus = invitation.bonus * 100;
    this.invitationService.post(invitation).subscribe(
      response => {
        this.processing = false;
        let emailDiff = invitation.emails.filter(item => !response.includes(item));
        if (response.length > 0) {
          this.popUpService.showSuccess(`Invitation for [<b>${response}</b>] successfully created`);
          if (response.length < invitation.emails.length) {
            this.popUpService.showWarning(`Invitation(s) can't be created. Invitation(s) or User(s) with email(s) [<b>${emailDiff}</b>] already exists`);
          }
        } else {
          this.popUpService.showWarning(`Invitation(s) can't be created. Invitation(s) or User(s) with email(s) [<b>${emailDiff}</b>] already exists`);
        }
        this.displayInviteDialog = false;
        this.getInvitations();
        form.resetForm();
        this.changeDetectorRef.detectChanges();
        this.invitation = new Invitation();
      },
      err => {
        this.processing = false;
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
            this.refresh();
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
            this.refresh();
            this.popUpService.showSuccess('Invitation resent');
          },
          err => {
            this.popUpService.showError(getErrorMessage(err));
          });
      }
}
