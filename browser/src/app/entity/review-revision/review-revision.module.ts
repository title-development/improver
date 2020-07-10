import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewRevisionComponent } from './review-revision.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CvIconModule } from '../../theme/icon/cv-icon-module';

const routing = RouterModule.forChild([
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
