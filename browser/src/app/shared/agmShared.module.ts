import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    AgmCoreModule
  ],
  declarations: [],
  providers: [],
  exports: [
    AgmCoreModule
  ]
})
export class AgmSharedModule {
}
