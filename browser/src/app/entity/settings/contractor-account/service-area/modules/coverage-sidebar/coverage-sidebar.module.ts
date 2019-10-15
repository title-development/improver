import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ZipUpdatesHistoryComponent } from './components/zip-updates-history/zip-updates-history.component';
import { CoverageSidebarComponent } from './coverage-sidebar.component';
import { MapControlsComponent } from './components/map-controls/map-controls.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [CommonModule, PerfectScrollbarModule, FlexLayoutModule,],
  declarations: [CoverageSidebarComponent, ZipUpdatesHistoryComponent, MapControlsComponent],
  exports: [CoverageSidebarComponent]
})
export class CoverageSidebarModule { }
