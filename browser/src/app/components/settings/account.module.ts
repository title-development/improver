import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { EqualValidator } from '../../validators/equal-validator.directive';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { SharedModule } from '../../shared/shared.module';
import { settingsRouting } from './settings.routing';
import { NotificationGuard } from '../../auth/router-guards/notification.guard';


@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    settingsRouting,
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



