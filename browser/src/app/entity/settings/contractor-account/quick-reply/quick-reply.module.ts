import { ModuleWithProviders, NgModule,  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule} from "@angular/forms";
import {
  MatAutocompleteModule,
  MatButtonModule, MatCardModule, MatCheckboxModule, MatDatepickerModule, MatIconModule, MatInputModule, MatNativeDateModule,
  MatRadioModule, MatSelectModule, MatSnackBarModule
} from "@angular/material";
import { QuickReplyComponent } from "./quick-reply.component";
import { SharedModule } from '../../../../shared/shared.module';
import { LayoutModule } from "../../../../layout/layout.module";

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: QuickReplyComponent
  }
]);

@NgModule({
  imports: [
    routing,
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatNativeDateModule,
    FlexLayoutModule,
    FormsModule,
    MatAutocompleteModule,
    SharedModule,
    LayoutModule
  ],
  declarations: [
    QuickReplyComponent
  ],
  exports: [
  ],
  providers: []
})

export class QuickReplyModule {}
