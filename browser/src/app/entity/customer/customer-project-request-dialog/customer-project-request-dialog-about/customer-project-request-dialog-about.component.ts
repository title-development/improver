import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CompanyService } from '../../../../api/services/company.service';
import { CompanyProfile } from '../../../../model/data-model';
import { MediaQuery, MediaQueryService } from '../../../../util/media-query.service';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from "rxjs/internal/operators";

@Component({
  selector: 'customer-project-request-dialog-about',
  templateUrl: './customer-project-request-dialog-about.component.html',
  styleUrls: ['./customer-project-request-dialog-about.component.scss']
})
export class CustomerProjectRequestDialogAboutComponent implements OnDestroy {

  @Input() projectRequestId;
  @Input() companyProfile: CompanyProfile;

  mediaQuery: MediaQuery;
  private mediaWatcher: Subscription;

  truncateAboutInfo: number = 300;
  truncateOfferedServicesInfo: number = 16;

  constructor(private query: MediaQueryService) {
    this.mediaWatcher = this.query.screen.pipe(
      distinctUntilChanged()
    ).subscribe((res: MediaQuery) => {
      this.mediaQuery = res;
    });
  }

  ngOnDestroy(): void {
    this.mediaWatcher.unsubscribe();
  }
}
