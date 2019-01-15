import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Role } from '../../../model/security-model';
import { SecurityService } from '../../../auth/security.service';
import { CompanyService } from '../../../api/services/company.service';
import { ProjectMessage } from '../../../api/models/ProjectMessage';
import { ProjectRequest } from '../../../api/models/ProjectRequest';

@Component({
  selector: 'message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})

export class MessageComponent implements AfterViewInit {

  @Input() message: ProjectMessage;
  @Input() userIcon: string = '';
  @Input() customerName: string = '';
  @Input() contractorName: string = '';
  @Input() companyName: string = '';
  @Output() afterViewInit: EventEmitter<any> = new EventEmitter<any>();

  Role = Role;
  ProjectRequest = ProjectRequest;

  constructor(public securityService: SecurityService,
              public companyService: CompanyService) {
  }

  ngAfterViewInit(): void {
    this.afterViewInit.emit();
  }

}
