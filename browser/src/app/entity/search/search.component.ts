import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CompanyInfo, ServiceType } from '../../model/data-model';
import { CompanyService } from '../../api/services/company.service';
import { combineLatest, ReplaySubject, Subject } from 'rxjs';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { RestPage } from '../../api/models/RestPage';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { ProjectActionService } from '../../util/project-action.service';
import * as lunr from 'lunr';
import { getErrorMessage } from "../../util/functions";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { finalize, first, takeUntil } from "rxjs/operators";


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
  private searchTerm: string;
  private zip: string;
  private lunrIndex;
  private serviceTypes: Array<ServiceType>;
  popularServiceTypes: Array<ServiceType> = [];

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private companyService: CompanyService,
              public projectActionService: ProjectActionService,
              public customerSuggestionService: CustomerSuggestionService,
              private popUpService: PopUpMessageService,
              private serviceTypeService: ServiceTypeService) {

    this.init();

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
    this.deepSearch(this.service, this.zipCode)
  }

  ngOnInit(): void {

  }

  init() {
    this.loading = true;
    let requests = combineLatest([this.customerSuggestionService.popular$, this.serviceTypeService.serviceTypes$])
      .pipe(
        first(),
        finalize(() => this.loading = false)
      )
      .subscribe(result => {
          this.popularServiceTypes = result[0];
          let services = this.serviceTypes = result[1];
          this.lunrIndex = lunr(function () {
            this.ref('id');
            this.field('name');
            services.forEach(service => this.add(service));
          });
          this.loading = false;
          this.initialized$.next();
          this.initialized$.complete();
        },
        err => this.popUpService.showError(getErrorMessage(err)))

  }

  deepSearch(searchTerm: string, zip: string) {
    this.zip = zip;
    this.searchTerm = searchTerm;
    if (this.lunrIndex) {
      this.searchResults = this.lunrIndex.search(`${this.searchTerm}*`)
        .map(item => this.serviceTypes.find(service => item.ref == service.id))
        .filter((el, index) => index <= this.page * this.size);
    }

    if (this.searchResults.length == 0) {
      this.searchResults = this.popularServiceTypes;
    }
  }

  loadMore(): void {
    this.page++;
    this.searchResults = this.lunrIndex.search(`${this.searchTerm}*`)
      .map(item => this.serviceTypes.find(service => item.ref == service.id))
      .filter((el, index) => index <= this.page * this.size);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
