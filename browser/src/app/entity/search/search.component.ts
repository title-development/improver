import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CompanyInfo, ServiceType, Trade } from '../../model/data-model';
import { CompanyService } from '../../api/services/company.service';
import { ReplaySubject, Subject } from 'rxjs';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { RestPage } from '../../api/models/RestPage';
import { ProjectActionService } from '../../util/project-action.service';
import { getErrorMessage } from "../../util/functions";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { first, takeUntil } from "rxjs/operators";
import { UserSearchService } from "../../api/services/user-search.service";


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
  pageable: RestPage<CompanyInfo> = new RestPage<CompanyInfo>();
  loading = false;
  private page = 1;
  private size = 35;
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
      this.searchResults = this.popularServiceTypes;
    }
  }

  ngOnInit(): void {

  }

  getPopularServiceTypes() {
    this.loading = true;
    this.customerSuggestionService.popular$.subscribe(
        popularServiceTypes => {
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
