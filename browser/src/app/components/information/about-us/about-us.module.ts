import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from "../../../layout/layout.module";
import { RouterModule, Routes } from "@angular/router";
import { AboutUsComponent } from "./about-us.component";

const routes: Routes = [
  { path: '', component: AboutUsComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LayoutModule
  ],
  declarations: [
    AboutUsComponent
  ],
  bootstrap: [
    AboutUsComponent
  ]
})
export class AboutUsModule { }
