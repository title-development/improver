import { NgModule } from '@angular/core';
import { SocialButtonsComponent } from './social-buttons.component';
import { CvSpinnerModule } from '../../theme/spinner/cv-spinner.module';
import { CvButtonModule } from '../../theme/button/cv-button.module';
import { CvIconModule } from '../../theme/icon/cv-icon-module';

@NgModule({
  imports: [
    CvSpinnerModule,
    CvButtonModule,
    CvIconModule
  ],
  declarations: [SocialButtonsComponent],
  exports: [SocialButtonsComponent],
  providers: []
})
export class SocialButtonsModule {

}
