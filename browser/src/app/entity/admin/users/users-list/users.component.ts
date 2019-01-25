import { Component } from '@angular/core';
import { UserService } from '../../../../api/services/user.service';
import { User } from '../../../../api/models/User';


import { ConfirmationService, MenuItem, SelectItem } from 'primeng/primeng';
import { Role } from '../../../../model/security-model';
import { enumToArrayList, filtersToParams } from '../../../../util/tricks.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { Pagination } from '../../../../model/data-model';
import { getErrorMessage } from '../../../../util/functions';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { RestPage } from '../../../../api/models/RestPage';
import { FilterMetadata } from 'primeng/components/common/filtermetadata';
import { dataTableFilter } from '../../util';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/internal/operators';

@Component({
  selector: 'admin-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class AdminUsersComponent {
  users: RestPage<User> = new RestPage<User>();
  usersProcessing = true;
  editedUser: User;
  selectedUser: User;
  displayEditDialog: boolean = false;
  tableColumns: Array<SelectItem> = [];
  rowsPerPage: Array<number> = [10, 50, 100];
  selectedTableCols: Array<any> = [
    'email',
    'displayName',
    'role',
    'internalPhone',
    'blocked',
    'deleted',
    'created'
  ];
  roles: Array<SelectItem> = [];
  selectedRole = '';
  contextMenuItems: Array<MenuItem>;
  filters: { [s: string]: FilterMetadata };

  constructor(private userService: UserService,
              private confirmationService: ConfirmationService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public popUpService: PopUpMessageService,
              private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.filters = dataTableFilter('id', params['id']);
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
        visible: (this.selectedUser !== undefined) && !this.selectedUser.blocked && this.selectedUser.role != Role.ADMIN
      },
      {
        label: 'Unblock User',
        icon: 'fa fa-undo',
        command: () => this.unblockUser(this.selectedUser),
        visible: (this.selectedUser !== undefined) && this.selectedUser.blocked && this.selectedUser.role != Role.ADMIN
      },
      {
        label: 'Delete User',
        icon: 'fa fa-trash',
        command: () => this.deleteUser(this.selectedUser),
        visible: (this.selectedUser !== undefined) && !this.selectedUser.deleted && this.selectedUser.role != Role.ADMIN
      },
      {
        label: 'Restore User',
        icon: 'fas fa-undo',
        command: () => this.restoreUser(this.selectedUser),
        visible: (this.selectedUser !== undefined) && this.selectedUser.deleted && this.selectedUser.role != Role.ADMIN
      }
    ];
  }

  loadUsersLazy(event) {
    const pagination = new Pagination().fromPrimeNg(event);
    const filters = filtersToParams(event.filters);
    this.getUsers(filters, pagination);
  }

  refresh(dataTable) {
    const paging = {
      first: dataTable.first,
      rows: dataTable.rows
    };
    dataTable.expandedRows = [];
    dataTable.paginate(paging);
  }

  getUsers(filters: any = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])) {
    this.usersProcessing = true;
    this.userService.getAll(filters, pagination).subscribe(users => {
      this.users = users;
      if (users.numberOfElements > 0) {
        this.tableColumns = [...this.selectedTableCols, ...Object.keys(this.users.content[0])]
          .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
          .filter(item => !(item == 'socialConnections' || item == 'notifications' || item == 'nativeUser' || item == 'refreshId'))
          .map(key => {
              return {label: this.camelCaseHumanPipe.transform(key, true), value: key};
            }
          );
      }
      this.usersProcessing = false;
    }, err => {
      console.log(err);
      this.popUpService.showError(getErrorMessage(err));
      this.usersProcessing = false;
    });
  }

  selectUser(selection: { originalEvent: MouseEvent, data: any }): void {
    this.selectedUser = selection.data;
    this.initContextMenu();
  }

  editUser(): void {
    this.displayEditDialog = true;
    //clone object
    this.editedUser = Object.assign({}, this.selectedUser);
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
      error => {
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
            user.deleted = true;
            this.popUpService.showSuccess(`<b>${user.displayName}</b> has been deleted`);
          },
          error => {
            this.popUpService.showError(`Can't delete <b>${user.displayName}</b>`);
          });
      }
    });
  }

  // TODO: Implement this method
  restoreUser(user: User) {
    this.confirmationService.confirm({
      header: 'Restore user?',
      message: `Do you want to restore <b>${user.displayName}</b>?`,
      accept: () => {
        this.userService.restoreAccount(user.id).subscribe(
          res => {
            user.deleted = false;
            this.popUpService.showSuccess(`<b>${user.displayName}</b> has been restored`);
          },
          error => {
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
            user.blocked = true;
            this.popUpService.showSuccess(`<b>${user.displayName}</b> has been blocked`);
          },
          error => {
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
            user.blocked = false;
            this.popUpService.showSuccess(`<b>${user.displayName}</b> has been unblocked`);
          },
          error => {
            this.popUpService.showError(`Can't unblock <b>${user.displayName}</b>`);
          });
      }
    });
  }

}
