import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from "../../../layout/layout.module";
import { PrivacyPolicyComponent } from "./privacy-policy.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  { path: '', component: PrivacyPolicyComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LayoutModule
  ],
  declarations: [
    PrivacyPolicyComponent
  ],
  bootstrap: [
    PrivacyPolicyComponent
  ]
})
export class PrivacyPolicyModule { }
