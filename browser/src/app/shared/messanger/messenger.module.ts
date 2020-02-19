import { NgModule } from '@angular/core';
import { MessengerComponent } from './messenger.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PipesModule } from '../../pipes/pipes.module';
import { Autosize } from '../../directives/autosize.directive';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CvIconModule } from '../../theme/icon/cv-icon-module';
import { DropZoneDirective } from '../../directives/drop-zone.directive';
import { CvSpinnerModule } from '../../theme/spinner/cv-spinner.module';
import { SharedDirectivesModule } from '../shared-directives.module';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    PipesModule,
    PerfectScrollbarModule,
    CvIconModule,
    CvSpinnerModule,
    SharedDirectivesModule
  ],
  declarations: [
    MessengerComponent,
    MessageComponent,
    Autosize,
    DropZoneDirective
  ],
  exports: [
    MessengerComponent,
    MessageComponent
  ],
  providers: []
})

export class MessengerModule {
}












