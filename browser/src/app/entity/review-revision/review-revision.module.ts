import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewRevisionComponent } from './review-revision.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CvInputModule } from '../../theme/input/cv-input.module';
import { CvButtonModule } from '../../theme/button/cv-button.module';
import { CvSpinnerModule } from '../../theme/spinner/cv-spinner.module';
import { CvIconModule } from '../../theme/icon/cv-icon-module';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    redirectTo: '/404',
    pathMatch: 'full'
  },
  {
    path: ':id',
    component: ReviewRevisionComponent
  },
]);

@NgModule({
  declarations: [ReviewRevisionComponent],
  imports: [
    CommonModule,
    CvIconModule,
    routing,
    SharedModule
  ]
})
export class ReviewRevisionModule {

}
