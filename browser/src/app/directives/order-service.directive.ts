import { Directive, HostListener, Input } from '@angular/core';
import { ProjectActionService } from '../util/project-action.service';
import { ServiceType } from '../model/data-model';
import { SecurityService } from '../auth/security.service';
import { Role } from '../model/security-model';
import { Router } from '@angular/router';

@Directive({
  selector: '[orderService]'
})
export class OrderServiceDirective {

  @Input('orderService') serviceType: ServiceType;
  @Input('orderServiceCompanyId') companyId: string;
  @Input('orderServiceDisabled') disable: boolean = false;

  Role = Role;

  constructor(private projectActionService: ProjectActionService,
              private securityService: SecurityService,
              private router: Router) {

  }

  //TODO: IMP-1493
  @HostListener('click', ['$event'])
  orderService(event: MouseEvent): void {
    switch (this.securityService.getRole()) {
      case Role.INCOMPLETE_PRO:
        event.preventDefault();
        event.stopPropagation();
        this.router.navigate(['/', 'signup-pro', 'company']);
        break;
      case Role.CUSTOMER:
      case Role.ANONYMOUS:
        this.projectActionService.openQuestionaryForCompany(this.serviceType, this.companyId);
        break;
      default:
        event.preventDefault();
        event.stopPropagation();
        break;
    }
  }
}
