import { Directive, HostListener, Input } from '@angular/core';
import { ProjectActionService } from '../util/project-action.service';
import { ServiceType } from '../model/data-model';
import { SecurityService } from '../auth/security.service';
import { Role } from '../model/security-model';

@Directive({
  selector: '[orderService]'
})
export class OrderServiceDirective {

  @Input('orderService') serviceType: ServiceType;
  @Input('orderServiceCompanyId') companyId: string;
  @Input('orderServiceDisabled') disable: boolean = false;

  Role = Role;

  constructor(private projectActionService: ProjectActionService,
              private securityService: SecurityService) {

  }

  @HostListener('click', ['$event'])
  orderService(event: MouseEvent): void {
    if ((this.securityService.getRole() != Role.CUSTOMER && this.securityService.getRole() != Role.ANONYMOUS) || this.disable) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.projectActionService.openQuestionaryForCompany(this.serviceType, this.companyId);
    }
  }
}
