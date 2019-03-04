import { Component, HostBinding, Input } from '@angular/core';
import { SecurityService } from '../../../../auth/security.service';
import { Role } from '../../../../model/security-model';
import { MenuItem } from 'primeng/primeng';

@Component({
  selector: 'admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  @Input()
  @HostBinding('class.-opened')
  toggleSidebar: boolean;
  leftMenuItems: Array<MenuItem> = [
    {
      icon: 'fa fa-home',
      label: 'Dashboard',
      url: 'dashboard'
    },
    {
      icon: 'fa fa-users',
      label: 'Users',
      url: '',
      visible: this.isVisible(Role.ADMIN, Role.SUPPORT),
      items: [
        {
          icon: 'fa fa-plus',
          label: 'Add User',
          url: 'users/new',
          visible: this.isVisible(Role.ADMIN)
        }, {
          icon: 'fa fa-users',
          label: 'All Users',
          url: 'users',
          visible: this.isVisible(Role.ADMIN)
        },
        {
          icon: 'fa fa-users',
          label: 'Contractors',
          url: 'contractors'
        },
        {
          icon: 'fa fa-users',
          label: 'Customers',
          url: 'customers'
        }
        ,
        {
          icon: 'fa fa-envelope-o',
          label: 'Invitations',
          url: 'invitations'
        }
      ]
    },
    {
      icon: 'fa fa-building',
      label: 'Companies',
      url: 'companies',
      visible: this.isVisible(Role.ADMIN, Role.SUPPORT),
    },
    {
      icon: 'fa fa-file-text',
      label: 'Projects',
      url: '',
      visible: this.isVisible(Role.ADMIN, Role.SUPPORT),
      items: [
        {
          icon: 'fa fa-list',
          label: 'Customer Projects',
          url: 'projects'
        },
        {
          icon: 'fa fa-retweet',
          label: 'Projects validation',
          url: 'projects-validation'
        },
        {
          icon: 'fa fa-paper-plane',
          label: 'Project requests',
          url: 'project-requests'
        }
      ]
    },
    {
      icon: 'fa fa-cart-arrow-down',
      label: 'Trades',
      url: 'trades',
      visible: this.isVisible(Role.ADMIN, Role.SUPPORT),
    },
    {
      icon: 'fa fa-shopping-bag',
      label: 'Services',
      url: 'services',
      visible: this.isVisible(Role.ADMIN, Role.SUPPORT),
    },
    {
      icon: 'fa fa-question-circle',
      label: 'Questionaries',
      url: 'questionaries',
      visible: this.isVisible(Role.ADMIN, Role.SUPPORT),
    },
    {
      icon: 'fa fa-money',
      label: 'Refunds',
      url: '',
      visible: this.isVisible(Role.ADMIN, Role.SUPPORT),
      items: [
        {
          icon: 'fa fa-list-ul',
          label: 'All Refunds',
          url: 'refunds'
        },
        {
          icon: 'fa fa-retweet',
          label: 'In Review',
          url: 'refunds/inreview'
        }
      ]
    },
    {
      icon: 'far fa-star',
      label: 'Reviews',
      url: 'reviews',
      visible: this.isVisible(Role.ADMIN, Role.SUPPORT),
    },
    {
      icon: 'fa fa-list-alt',
      label: 'Tickets',
      url: '',
      visible: this.isVisible(Role.ADMIN, Role.SUPPORT),
      items: [
        {
          icon: 'fa fa-list-ul',
          label: 'All Tickets',
          url: 'tickets'
        },
        {
          icon: 'fa fa-retweet',
          label: 'Unassigned Tickets',
          url: 'tickets/unassigned'
        },
        {
          icon: 'fas fa-headset',
          label: 'My Tickets',
          url: 'tickets/my'
        }
      ]
    },
    {
      icon: 'fa fa-map',
      label: 'Coverage',
      url: 'coverage',
      visible: this.isVisible(Role.ADMIN)
    },
    {
      icon: 'fas fa-hammer',
      label: 'Jobs',
      url: 'jobs',
      visible: this.isVisible(Role.ADMIN),
    },
    {
      icon: 'fas fa-history',
      label: 'Staff Actions',
      url: 'staff-actions',
      visible: this.isVisible(Role.ADMIN),
    },
    {
      icon: 'fa fa-cogs',
      label: 'Settings',
      url: 'settings',
      visible: this.isVisible(Role.ADMIN),
    }
  ];

  constructor(private securityService: SecurityService) {

  }

  private isVisible(...roles: Array<Role>) {
    return roles.some(role => this.securityService.getRole() == role);
  }

}
