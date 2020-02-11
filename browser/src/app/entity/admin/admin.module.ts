import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ADMIN_ROUTES } from './admin.routing';
import { AdminComponent } from './admin.component';

import { AdminUsersComponent } from './users/users-list/users.component';
import { AdminLoginComponent } from './login/login.component';
import { AdminLayoutComponent } from './layout/layout.component';
import { AdminSidebarComponent } from './layout/sidebar/admin-sidebar.component';
import { AdminAccordeonComponent } from './layout/sidebar/accordeon/accordeon.component';
import { AdminInfoComponent } from './layout/sidebar/admin-info/admin-info.component';
import { AdminHeaderComponent } from './layout/header/admin-header.component';

import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { CompaniesComponent } from './companies/companies-list/companies.component';
import { AdminSettingsComponent } from './settings/settings.component';
import { AdminReviewsComponent } from './reviews/reviews.component';

import { QuestionaryListComponent } from './questionary/questionary-list/questionary.component';
import { QuestionaryEditComponent } from './questionary/questionary-edit/questionary-edit.component';

import { TradesListComponent } from './trades/trades-list/trades-list.component';
import { TradesEditComponent } from './trades/trades-edit/trades-edit.component';

import { ServicesListComponent } from './services/services-list/services-list.component';
import { ServicesEditComponent } from './services/services-edit/services-edit.component';

import { AdminProjectsComponent } from './projects/projects-list/projects-list.component';
import { AdminProjectsValidationComponent } from './projects/projects-validation/projects-validation.component';

import { QuestionariesService } from '../../api/services/questionaries.service';
import { UserService } from '../../api/services/user.service';
import { MessageService } from 'primeng/components/common/messageservice';

import {
  AccordionModule,
  ButtonModule,
  CalendarModule,
  CardModule,
  ChartModule,
  ChipsModule,
  ConfirmationService,
  ConfirmDialogModule,
  ContextMenuModule,
  DataTableModule,
  DialogModule,
  DropdownModule,
  FileUploadModule,
  GrowlModule,
  InputSwitchModule,
  InputTextModule,
  KeyFilterModule,
  MenuModule,
  MessageModule,
  MessagesModule,
  OverlayPanelModule,
  PaginatorModule,
  PanelModule,
  ProgressSpinnerModule,
  RadioButtonModule,
  SelectButtonModule,
  SharedModule,
  SliderModule,
  SpinnerModule,
  SplitButtonModule,
  TabViewModule,
  TieredMenuModule
} from 'primeng/primeng';
import { MultiSelectModule } from 'primeng/multiselect';
import { QuestionPreviewComponent } from './components/question-preview/question-preview.component';
import { DragulaModule } from 'ng2-dragula';
import { ImagePreviewComponent } from './components/image-preview/image-preview.component';
import { PipesModule } from '../../pipes/pipes.module';
import { StatusToString } from '../../pipes/status-to-string.pipe';
import { CamelCaseHumanPipe } from '../../pipes/camelcase-to-human.pipe';
import { TableModule } from 'primeng/table';
import { CompaniesPreviewComponent } from './companies/companies-preview/companies-preview.component';
import { LocationValidationComponent } from './components/location-validation/location-validation.component';
import { SharedDirectivesModule } from '../../shared/shared-directives.module';
import { ProjectValidationRequestComponent } from './components/project-validation-request/project-validation-request.component';
import { ProjectCommentComponent } from './components/project-comment/project-comment.component';
import { ProjectPreviewComponent } from './projects/projects-preview/project-preview.component';
import { ContractorsComponent } from './users/contractors-list/contractors.component';
import { ProjectRequestsComponent } from './projects/requests/project-requests.component';
import { ProjectRequestService } from '../../api/services/project-request.service';
import { CustomersListComponent } from './users/customers-list/customers-list.component';
import { RefundsListComponent } from './refunds/refunds-list/refunds-list.component';
import { RefundService } from '../../api/services/refund.service';
import { RefundsInreviewComponent } from './refunds/inreview/inreview.component';
import { TicketsListComponent } from "./tickets/tickets-list/tickets.component";
import { TicketsInreviewComponent } from "./tickets/inreview/inreview.component";
import { ImageCropperComponent } from './components/image-cropper/image-cropper.component';
import { InvitationsComponent } from "./invitations/invitations.component";
import { InvitationService } from "../../api/services/invitation.service";
import { StatisticService } from '../../api/services/statistic.service';
import { AddUserComponent } from './users/add-user/add-user.component';
import { AdminAccountComponent } from './account/admin-account.component';
import { AdminCoverageComponent } from './coverage/admin-coverage.component';
import { GoogleMapsAPIWrapper } from '@agm/core';
import { AgmSharedModule } from '../../shared/agmShared.module';
import { AdminMap } from './coverage/admin-map';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { AdminJobsComponent } from "./jobs/jobs.component";
import { JobService } from "../../api/services/job.service";
import { ReviewRevisionRequestComponent } from "./components/review-revision-request/review-revision-request.component";
import { NgArrayPipesModule } from "angular-pipes";
import { MyTicketsComponent } from "./tickets/my/my-tickets.component";
import { TicketEditDialogComponent } from "./tickets/ticket-edit-dialog/ticket-edit-dialog.component";
import { StaffService } from "../../api/services/staff.service";
import { StaffActionsComponent } from "./staff-actions/staff-actions.component";
import { RecaptchaModule } from 'ng-recaptcha';
import { ProjectCancelComponent } from "./components/project-cancel/project-cancel.component";
import { ProjectCompleteComponent } from "./components/project-complete/project-complete.component";
import {StatusCapitalize} from "../../pipes/status-capitalize.pipe";


@NgModule({
  imports: [
    ADMIN_ROUTES,
    CommonModule,
    SharedModule,
    SharedDirectivesModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    ChartModule,
    DataTableModule,
    TableModule,
    ContextMenuModule,
    ConfirmDialogModule,
    FileUploadModule,
    CardModule,
    GrowlModule,
    MultiSelectModule,
    DialogModule,
    TabViewModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    ProgressSpinnerModule,
    MenuModule,
    TieredMenuModule,
    DragulaModule.forRoot(),
    TieredMenuModule,
    SelectButtonModule,
    PaginatorModule,
    PipesModule,
    NgArrayPipesModule,
    OverlayPanelModule,
    ChipsModule,
    AccordionModule,
    PanelModule,
    SplitButtonModule,
    CalendarModule,
    KeyFilterModule,
    SliderModule,
    RadioButtonModule,
    MessagesModule,
    MessageModule,
    SpinnerModule,
    AgmSharedModule,
    AgmSnazzyInfoWindowModule,
    RecaptchaModule,
  ],
  declarations: [
    AdminComponent,
    AdminAccordeonComponent,
    AdminDashboardComponent,
    AdminLoginComponent,
    AdminUsersComponent,
    AdminLayoutComponent,
    AdminSidebarComponent,
    AdminHeaderComponent,
    CompaniesComponent,
    CompaniesPreviewComponent,
    AdminInfoComponent,
    AdminJobsComponent,
    AdminSettingsComponent,
    AdminReviewsComponent,
    QuestionaryListComponent,
    QuestionaryEditComponent,
    QuestionPreviewComponent,
    ImagePreviewComponent,
    ImageCropperComponent,
    ReviewRevisionRequestComponent,
    AdminProjectsComponent,
    AdminProjectsValidationComponent,
    ProjectPreviewComponent,
    ProjectValidationRequestComponent,
    ProjectCommentComponent,
    TradesListComponent,
    TradesEditComponent,
    ServicesListComponent,
    ServicesEditComponent,
    LocationValidationComponent,
    ProjectCancelComponent,
    ProjectCompleteComponent,
    ContractorsComponent,
    CustomersListComponent,
    ProjectRequestsComponent,
    RefundsListComponent,
    RefundsInreviewComponent,
    TicketsListComponent,
    TicketsInreviewComponent,
    MyTicketsComponent,
    TicketEditDialogComponent,
    InvitationsComponent,
    AddUserComponent,
    AdminAccountComponent,
    AdminCoverageComponent,
    StaffActionsComponent,
    AdminMap
  ],
  providers: [
    UserService,
    StaffService,
    ConfirmationService,
    MessageService,
    QuestionariesService,
    StatusToString,
    StatusCapitalize,
    CamelCaseHumanPipe,
    RefundService,
    ProjectRequestService,
    InvitationService,
    StatisticService,
    GoogleMapsAPIWrapper,
    JobService
  ]
})
export class AdminModule {
}
