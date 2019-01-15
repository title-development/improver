import { NgModule } from '@angular/core';
import { CvSwitchComponent } from './switch.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [CvSwitchComponent],
  exports: [CvSwitchComponent]
})
export class CvSwitchModule {
}
