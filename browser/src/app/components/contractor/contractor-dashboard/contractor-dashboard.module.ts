import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContractorDashboardComponent } from './contractor-dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectsListComponent } from './projects/projects-list/projects-list.component';
import { MoneyChartsComponent } from './money-charts/money-charts.component';
import { DashboardMapComponent } from './find-more-leads/find-more-card.component';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { ChartsModule } from 'ng2-charts';
import { PayAndGoComponent } from './pay-and-go/pay-and-go.component';
import { DashboardSubscriptionsComponent } from './subscription/dashboard-subscriptions.component';
import { NgArrayPipesModule, NgStringPipesModule } from 'angular-pipes';
import { SharedModule } from '../../../shared/shared.module';
import { LayoutModule } from '../../../layout/layout.module';
import { CvFieldsModule } from '../../../theme/fields/cv-fields.module';
import { CvInputModule } from '../../../theme/input/cv-input.module';
import { CvButtonModule } from '../../../theme/button/cv-button.module';
import { CvInputFieldModule } from '../../../theme/input-field/form-field.module';
import { CvIconModule } from '../../../theme/icon/cv-icon-module';
import { CommonModule } from '@angular/common';
import { CvSpinnerModule } from '../../../theme/spinner/cv-spinner.module';
import { CvHintModule } from '../../../theme/hint/cv-hint.module';
import { ChartData, ChartDataSets } from "chart.js";
import { ChartModule } from "primeng";

const contractorDashboardRouting = RouterModule.forChild([
    {
      path: '',
      component: ContractorDashboardComponent,
    }
  ])
;

@NgModule({
  imports: [
    CommonModule,
    contractorDashboardRouting,
    MatTabsModule,
    MatListModule,
    ChartsModule,
    LayoutModule,
    SharedModule,
    NgArrayPipesModule,
    NgStringPipesModule,
    CvFieldsModule,
    CvInputFieldModule,
    CvInputModule,
    CvButtonModule,
    CvIconModule,
    CvSpinnerModule,
    CvHintModule,
    ChartModule
  ],
  declarations: [
    ContractorDashboardComponent,
    ProjectsComponent,
    ProjectsListComponent,
    MoneyChartsComponent,
    DashboardMapComponent,
    PayAndGoComponent,
    DashboardSubscriptionsComponent
  ],
  providers: [

  ]
})

export class ContractorDashboardModule {
}



