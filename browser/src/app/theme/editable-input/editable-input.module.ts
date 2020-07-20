import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableInputComponent } from './editable-input/editable-input.component';
import { CvButtonModule } from '../button/cv-button.module';
import { CvInputModule } from '../input/cv-input.module';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  imports: [CommonModule, CvButtonModule, CvInputModule, FormsModule, MatIconModule],
  declarations: [EditableInputComponent],
  exports: [EditableInputComponent],
})
export class CvEditableInputModule {

}
