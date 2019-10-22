import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MapControlsComponent } from './components/map-controls/map-controls.component';
import { ZipUpdatesHistoryComponent } from './components/zip-updates-history/zip-updates-history.component';
import { GoogleMapSidebarComponent } from './google-map-sidebar.component';

@NgModule({
  imports: [CommonModule, PerfectScrollbarModule, FlexLayoutModule ],
  declarations: [GoogleMapSidebarComponent, ZipUpdatesHistoryComponent, MapControlsComponent],
  exports: [GoogleMapSidebarComponent],
})
export class GoogleMapSidebarModule { }
