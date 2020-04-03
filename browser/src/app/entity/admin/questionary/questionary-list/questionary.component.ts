import { Component, ViewChild } from '@angular/core';
import { Questionary } from '../../../../api/models/Questionary';
import { QuestionariesService } from '../../../../api/services/questionaries.service';
import { ConfirmationService, MenuItem } from 'primeng';
import { Router } from '@angular/router';
import { Pagination } from '../../../../model/data-model';
import { filtersToParams } from '../../../../util/tricks.service';
import { RestPage } from '../../../../api/models/RestPage';
import { Role } from '../../../../model/security-model';
import { SecurityService } from '../../../../auth/security.service';
import { PopUpMessageService } from "../../../../util/pop-up-message.service";

@Component({
  selector: 'questionary',
  templateUrl: './questionary.component.html',
  styleUrls: ['./questionary.component.scss']
})
export class QuestionaryListComponent {
  @ViewChild('dt') table: any;
  Role = Role;
  processing = true;
  selectedQuestionary: Questionary;
  questionaries: RestPage<Questionary> = new RestPage<Questionary>();
  rowsPerPage: Array<number> = [10, 50, 100];

  selectedColumns = [
    {field: 'id', header: 'Id'},
    {field: 'serviceTypes', header: 'ServiceTypes'},
    {field: 'name', header: 'Name'},
    {field: 'description', header: 'Description'},
  ];

  contextMenuItems: Array<MenuItem> = [
    {
      label: 'View',
      icon: 'fa fa-eye',
      command: () => this.router.navigate(['admin', 'questionaries', 'view', this.selectedQuestionary.id]),
      visible: this.securityService.hasRole(Role.SUPPORT)
    },
    {
      label: 'Edit',
      icon: 'fa fa-pencil',
      command: () => this.router.navigate(['admin', 'questionaries', 'edit', this.selectedQuestionary.id]),
      visible: this.securityService.hasRole(Role.ADMIN)
    },
    {
      label: 'Delete',
      icon: 'fa fa-trash',
      command: () => this.deleteQuestionary(this.selectedQuestionary),
      visible: this.securityService.hasRole(Role.ADMIN),
      styleClass: 'danger-menu-button'
    }
  ];

  constructor(private questionariesService: QuestionariesService,
              private popUpService: PopUpMessageService,
              private confirmationService: ConfirmationService,
              public securityService: SecurityService,
              private router: Router) {
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getQuestionarie(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  deleteQuestionary(questionary: Questionary): void {
    this.confirmationService.confirm({
      header: 'Delete questionary?',
      icon: 'fa fa-question-circle',
      message: `Do you want to delete <b>${questionary.name}</b>`,
      accept: () => {
        this.questionariesService.deleteQuestionaryById(questionary.id).subscribe(res => {
            this.refresh();
            this.popUpService.showSuccess(`Questionary <b>${questionary.name}</b> has been deleted`);
          }, err => {
            this.popUpService.showError(`Could not delete <b>${questionary.name}</b>`);
          }
        );
      }
    });
  }

  getQuestionarie(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.questionariesService.getAll(filters, pagination).subscribe(
      (restPage: RestPage<Questionary>) => {
        this.processing = false;
        this.questionaries = restPage;
      }, err => {
        this.processing = false;
      });
  }

}
