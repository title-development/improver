import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ProBannerComponent} from "../home/pro-banner/pro-banner.component";
import {LayoutModule} from "../../layout/layout.module";
import {InformationComponent} from "./information.component";

@NgModule({
  imports: [
    CommonModule,
    LayoutModule
  ],
  declarations: [
    InformationComponent
  ],
  bootstrap: [
    InformationComponent
  ]
})
export class InformationModule { }
