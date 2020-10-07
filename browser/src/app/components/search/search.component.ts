import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CompanyInfo, ServiceType } from '../../model/data-model';
import { CompanyService } from '../../api/services/company.service';
import { ReplaySubject, Subject } from 'rxjs';
import { PopUpMessageService } from '../../api/services/pop-up-message.service';
import { RestPage } from '../../api/models/RestPage';
import { ProjectActionService } from '../../api/services/project-action.service';
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { first, takeUntil } from "rxjs/operators";
import { UserSearchService } from "../../util/user-search.service";


@Component({
  selector: 'search-page',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  private readonly destroyed$ = new Subject<void>();
  private readonly initialized$ = new ReplaySubject<void>(1);
  public initialized = false;

  service: string;
  zipCode: string;
  notFound: boolean;
  searchResults: Array<ServiceType> = [];
  searchResultMessageText: string;
  pageable: RestPage<CompanyInfo> = new RestPage<CompanyInfo>();
  loading = false;
  public page = 1;
  public size = 35;
  popularServiceTypes: Array<ServiceType> = [];

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private companyService: CompanyService,
              public userSearchService: UserSearchService,
              public projectActionService: ProjectActionService,
              public customerSuggestionService: CustomerSuggestionService,
              private popUpService: PopUpMessageService) {

    this.getPopularServiceTypes();

    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroyed$))
      .subscribe((params: Params) => {
        if (this.initialized) {
          this.retrieveParams(params);
        } else {
          this.initialized$
            .pipe(first())
            .subscribe(() => {
              this.initialized = true;
              this.retrieveParams(params);
            })
        }
      });
  }

  retrieveParams(params: Params) {
    this.service = params['service'] ? params['service'] : '';
    this.zipCode = params['zip'] ? params['zip'] : '';
    this.searchResults = this.userSearchService.getSearchResults(this.service)
      .filter((el, index) => index <= this.page * this.size);
    if (this.searchResults.length == 0) {
      this.searchResultMessageText = `No results were found for "${this.service}". The following are results for a similar search`;
      this.searchResults = this.popularServiceTypes;
    } else {
      this.searchResultMessageText = '';
    }
  }

  ngOnInit(): void {

  }

  getPopularServiceTypes() {
    this.loading = true;
    this.customerSuggestionService.popularServices$.subscribe((popularServiceTypes: Array<ServiceType>) => {
          this.popularServiceTypes = this.searchResults = popularServiceTypes;
          this.loading = false;
          this.initialized$.next();
          this.initialized$.complete();
        }
      );
  }

  loadMore(): void {
    this.page++;
    this.searchResults = this.userSearchService.loadMore(this.service)
      .filter((el, index) => index <= this.page * this.size);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
