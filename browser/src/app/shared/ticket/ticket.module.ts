import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketComponent } from './ticket.component';
import { RouterModule } from "@angular/router";
import { LayoutModule } from "../../layout/layout.module";
import { SharedModule } from "../shared.module";

const routing = RouterModule.forChild([
  {
    path: '',
    component: TicketComponent
  }
]);

@NgModule({
  imports: [
    routing,
    CommonModule,
    LayoutModule,
    SharedModule
  ],
  declarations: [TicketComponent]
})
export class TicketModule { }
