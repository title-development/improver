import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { SEARCH_ROUTES } from './search.routing';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CvButtonModule } from '../../theme/button/cv-button.module';

@NgModule({
  imports: [
    CommonModule,
    SEARCH_ROUTES,
    FormsModule,
    CvButtonModule,
    SharedModule
  ],
  declarations: [SearchComponent],
  providers: [],
  exports: []
})
export class SearchModule {
}
