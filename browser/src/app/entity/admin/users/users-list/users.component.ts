import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../../../api/services/user.service';
import { User } from '../../../../api/models/User';
import { ConfirmationService, FilterMetadata, MenuItem, SelectItem } from 'primeng';
import { Role } from '../../../../model/security-model';
import { enumToArrayList, filtersToParams } from '../../../../util/tricks.service';
import { Pagination } from '../../../../model/data-model';
import { clone, getErrorMessage } from '../../../../util/functions';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { RestPage } from '../../../../api/models/RestPage';
import { dataTableFilter } from '../../util';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/internal/operators';
import { Table } from "primeng/table";

@Component({
  selector: 'admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class AdminUsersComponent {
  @ViewChild('dt') private table: Table;

  users: RestPage<User> = new RestPage<User>();
  usersProcessing = true;
  editedUser: User;
  selectedUser: User;
  displayEditDialog: boolean = false;
  rowsPerPage: Array<number> = [10, 50, 100];

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'iconUrl', header: 'Icon', active: true},
    {field: 'email', header: 'Email', active: true},
    {field: 'displayName', header: 'Display name', active: true},
    {field: 'firstName', header: 'First name', active: false},
    {field: 'lastName', header: 'Last name', active: false},
    {field: 'role', header: 'Role', active: true},
    {field: 'internalPhone', header: 'Internal phone', active: true},
    {field: 'isDeleted', header: 'Deleted', active: true},
    {field: 'isBlocked', header: 'Blocked', active: true},
    {field: 'isActivated', header: 'Activated', active: true},
    {field: 'created', header: 'Created', active: true},
    {field: 'updated', header: 'Updated', active: true},
    {field: 'lastLogin', header: 'Last login', active: false},
    {field: 'isNativeUser', header: 'Native User', active: false},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  roles: Array<SelectItem> = [];
  contextMenuItems: Array<MenuItem>;
  filters: { [s: string]: FilterMetadata };

  constructor(private userService: UserService,
              private confirmationService: ConfirmationService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public popUpService: PopUpMessageService,
              private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.filters = {};
      if (params['id']) this.filters = dataTableFilter('id', params['id']);
      if (params['email']) this.filters = dataTableFilter('email', params['email']);
    });
    this.roles = enumToArrayList(Role)
      .filter(item => item != Role.ANONYMOUS)
      .map(item => {
        return {label: item, value: item};
      });
    this.roles.unshift({label: 'All', value: ''});
    this.initContextMenu();
  }

  initContextMenu () {
    this.contextMenuItems =[
      {
        label: 'Edit',
        icon: 'fa fa-pencil',
        command: () => this.editUser()
      },
      {
        label: 'Block User',
        icon: 'fa fa-ban',
        command: () => this.blockUser(this.selectedUser),
        visible: (this.selectedUser !== undefined) && !this.selectedUser.isDeleted && !this.selectedUser.isBlocked && this.selectedUser.role != Role.ADMIN,
        styleClass: 'danger-menu-button'
      },
      {
        label: 'Unblock User',
        icon: 'fa fa-undo',
        command: () => this.unblockUser(this.selectedUser),
        visible: (this.selectedUser !== undefined) && !this.selectedUser.isDeleted && this.selectedUser.isBlocked && this.selectedUser.role != Role.ADMIN
      },
      {
        label: 'Delete User',
        icon: 'fa fa-trash',
        command: () => this.deleteUser(this.selectedUser),
        visible: (this.selectedUser !== undefined) && !this.selectedUser.isDeleted && this.selectedUser.role != Role.ADMIN,
        styleClass: 'danger-menu-button'
      },
      {
        label: 'Restore User',
        icon: 'fas fa-undo',
        command: () => this.restoreUser(this.selectedUser),
        visible: (this.selectedUser !== undefined) && this.selectedUser.isDeleted && this.selectedUser.role != Role.ADMIN
      }
    ];
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getUsers(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  getUsers(filters: any = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])) {
    this.usersProcessing = true;
    this.userService.getAll(filters, pagination).subscribe(users => {
      this.users = users;
      this.usersProcessing = false;
    }, err => {
      console.error(err);
      this.popUpService.showError(getErrorMessage(err));
      this.usersProcessing = false;
    });
  }

  editUser(): void {
    this.displayEditDialog = true;
    this.editedUser = clone(this.selectedUser);
  }

  saveUser(): void {
    this.userService.updateUser(this.editedUser.id, this.editedUser).pipe(
      first()
    ).subscribe(
      res => {
        this.popUpService.showSuccess(`<b> ${this.editedUser.displayName}</b> has been updated`);
        this.displayEditDialog = false;
        //updating user
        this.users.content = this.users.content.map((item: User, index: number) => {
          if (this.editedUser.id !== item.id) {
            return item;
          }
          return {
            ...item,
            ...this.editedUser
          };
        });
        this.selectedUser = null;
      },
      err => {
        this.popUpService.showError(`Cannot update <b>${this.editedUser.displayName}</b>`);
        this.displayEditDialog = false;
        this.selectedUser = null;
      }
    );
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      header: 'Delete user?',
      message: `Do you want to delete ${user.displayName}?`,
      accept: () => {
        this.userService.deleteAccount(user.id).subscribe(
          res => {
            user.isDeleted = true;
            this.popUpService.showSuccess(`<b>${user.displayName}</b> has been deleted`);
          },
          err => {
            this.popUpService.showError(`Can't delete <b>${user.displayName}</b>`);
          });
      }
    });
  }

  restoreUser(user: User) {
    this.confirmationService.confirm({
      header: 'Restore user?',
      message: `Do you want to restore <b>${user.displayName}</b>?`,
      accept: () => {
        this.userService.restoreAccount(user.id).subscribe(
          res => {
            user.isDeleted = false;
            this.popUpService.showSuccess(`<b>${user.displayName}</b> has been restored`);
          },
          err => {
            this.popUpService.showError(`Can't restore <b>${user.displayName}</b>`);
          });
      }
    });
  }

  blockUser(user: User) {
    this.confirmationService.confirm({
      header: 'Block user?',
      message: `Do you want to block <b>${user.displayName}</b>?`,
      accept: () => {
        this.userService.blockUser(user.id, true).subscribe(
          res => {
            user.isBlocked = true;
            this.popUpService.showSuccess(`<b>${user.displayName}</b> has been blocked`);
          },
          err => {
            this.popUpService.showError(`Can't block user ${user.displayName}`);
          });
      }
    });
  }

  unblockUser(user: User) {
    this.confirmationService.confirm({
      header: 'Unblock user?',
      message: `Do you want to unblock <b>${user.displayName}</b>?`,
      accept: () => {
        this.userService.blockUser(user.id, false).subscribe(
          res => {
            user.isBlocked = false;
            this.popUpService.showSuccess(`<b>${user.displayName}</b> has been unblocked`);
          },
          err => {
            this.popUpService.showError(`Can't unblock <b>${user.displayName}</b>`);
          });
      }
    });
  }

}
