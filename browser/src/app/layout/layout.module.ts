import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CvSelectModule } from '../theme/select/cv-select-module';
import { ProBannerComponent } from '../entity/home/pro-banner/pro-banner.component';
import { MainMenuComponent } from './header/main-menu/main-menu.component';
import { NotificationsPopupComponent } from "./header/notifications-popup/notifications-popup.component";
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    RouterModule,
    SharedModule,
    CvSelectModule,
    PerfectScrollbarModule
  ],
  declarations: [
    HeaderComponent,
    MainMenuComponent,
    NotificationsPopupComponent,
    FooterComponent,
    ProBannerComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    ProBannerComponent
  ]
})
export class LayoutModule {

}
