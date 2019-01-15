import { Component, EventEmitter, Output } from '@angular/core';
import { SecurityService } from '../../../../auth/security.service';
import { MenuItem } from 'primeng/primeng';

@Component({
  selector: 'admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent {
  sidebar: boolean = true;
  @Output() toggleSidebar: EventEmitter<void> = new EventEmitter<void>();
  userActions: Array<MenuItem> = [
    {icon: 'fas fa-pencil-alt', label: 'Account', routerLink: 'account'},
    {icon: 'fas fa-sign-out-alt', label: 'Logout', command: () => this.logout()}
  ];

  constructor(public securityService: SecurityService) {
  }

  logout(): void {
    this.securityService.logout();
  }

}
