import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SchedulingAvailabilityComponent } from './scheduling-availability.component';
import { SharedModule } from '../../../../shared/shared.module';
import { LayoutModule } from '../../../../layout/layout.module';
import { CvDateRangePickerModule } from '../../../../theme/date-range-picker/cv-date-range-picker.module';
import { UnavailabilityPeriodService } from '../../../../api/services/unavailability-period.service';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: SchedulingAvailabilityComponent,
  }
]);

@NgModule({
  imports: [
    routing,
    SharedModule,
    LayoutModule,
    CvDateRangePickerModule
  ],
  declarations: [SchedulingAvailabilityComponent],
  providers: [UnavailabilityPeriodService]
})
export class SchedulingAvailabilityModule {

}
