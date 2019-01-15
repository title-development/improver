import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { EqualValidator } from '../../validators/equal-validator.directive';

import {
  MatCardModule,
  MatIconModule,
  MatButtonModule,
  MatInputModule,
  MatRadioModule
} from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
import { SETTINGS_ROUTES } from './settings.routing';
import { NotificationGuard } from '../../auth/router-guards/notification.guard';


@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    SETTINGS_ROUTES,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    FlexLayoutModule,
    FormsModule,
    SharedModule,
  ],
  declarations: [],
  exports: [EqualValidator],
  providers: [NotificationGuard]
})

export class AccountModule {
}



