import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { EqualValidator } from "../../../../validators/equal-validator.directive";

import { MatCardModule } from "@angular/material/card";

import { CommunicationSettingsComponent } from "./communication-settings.component";
import { SharedModule } from '../../../../shared/shared.module';
import { LayoutModule } from "../../../../layout/layout.module";
import { QuickReplyComponent } from "../quick-reply/quick-reply.component";

const routing = RouterModule.forChild([
  { path: '', component: CommunicationSettingsComponent },
]);

@NgModule({
  imports: [
    CommonModule,
    routing,
    MatCardModule,
    FormsModule,
    SharedModule,
    LayoutModule
  ],
  declarations: [
    CommunicationSettingsComponent,
    QuickReplyComponent
  ],
  exports: [
    EqualValidator,
    QuickReplyComponent
  ],
  providers: []
})
export class CommunicationSettingsModule {}



