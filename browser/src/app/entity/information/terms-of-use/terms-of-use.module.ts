import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from "../../../layout/layout.module";
import { TermsOfUseComponent } from "./terms-of-use.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  { path: '', component: TermsOfUseComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LayoutModule
  ],
  declarations: [
    TermsOfUseComponent
  ],
  bootstrap: [
    TermsOfUseComponent
  ]
})
export class TermsOfUseModule { }
