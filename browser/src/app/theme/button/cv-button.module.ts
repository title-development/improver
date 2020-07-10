import { NgModule } from '@angular/core'
import { CvButtonComponent } from "./cv-button/cv-button.component";
import { CvButtonEmptyComponent } from "./cv-button-empty/cv-button-empty.component";
import { CvButtonFlatComponent } from "./cv-button-flat/cv-button-flat.component";
import { CommonModule } from '@angular/common';
import { CvSpinnerModule } from '../spinner/cv-spinner.module';
import { Button } from "./button";

@NgModule({
  imports: [CommonModule, CvSpinnerModule],
  declarations: [
    Button,
    CvButtonComponent,
    CvButtonEmptyComponent,
    CvButtonFlatComponent,
  ],
  exports: [
    CvButtonComponent,
    CvButtonEmptyComponent,
    CvButtonFlatComponent
  ]
})
export class CvButtonModule {
}
