import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CompanyInfo, ServiceType } from '../../model/data-model';
import { CompanyService } from '../../api/services/company.service';
import { Subscription } from 'rxjs';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { RestPage } from '../../api/models/RestPage';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { ProjectActionService } from '../../util/project-action.service';
import * as lunr from 'lunr';
import { getErrorMessage } from "../../util/functions";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";


@Component({
  selector: 'search-page',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  service: string;
  zipCode: string;
  notFound: boolean;
  searchResults: Array<ServiceType> = [];
  pageable: RestPage<CompanyInfo> = new RestPage<CompanyInfo>();
  loading = false;

  private page = 1;
  private size = 35;
  private search: string;
  private zip: string;
  private activatedRoute$: Subscription;
  private companyService$: Subscription;
  private lunrIndex;
  private serviceTypes: Array<ServiceType>;
  popularServiceTypes: Array<ServiceType> = [];

  constructor(private activatedRoute: ActivatedRoute,
              private companyService: CompanyService,
              public projectActionService: ProjectActionService,
              public customerSuggestionService: CustomerSuggestionService,
              private popUpService: PopUpMessageService,
              private serviceTypeService: ServiceTypeService) {
    this.getPopularServices();
  }

  ngOnInit(): void {
    this.activatedRoute$ = this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.service = params['service'] ? params['service'] : '';
      this.zipCode = params['zip'] ? params['zip'] : '';
      this.indexServiceTypes();
    });
  }

  getPopularServices() {
    this.customerSuggestionService.popular$.subscribe(
      popularServiceTypes => this.popularServiceTypes = popularServiceTypes,
      err => this.popUpService.showError(getErrorMessage(err))
    )
  }

  deepSearch(data: { service: string, zip: string }) {
    this.zip = data.zip;
    this.search = data.service;
    if (this.lunrIndex) {
      this.searchResults = this.lunrIndex.search(`${this.search}*`)
        .map(item => this.serviceTypes.find(service => item.ref == service.id))
        .filter((el, index) => index <= this.page * this.size);
    }

    if (this.searchResults.length == 0) {
      this.searchResults = this.popularServiceTypes;
    }
  }

  loadMore(): void {
    this.page++;
    this.searchResults = this.lunrIndex.search(`${this.search}*`)
      .map(item => this.serviceTypes.find(service => item.ref == service.id))
      .filter((el, index) => index <= this.page * this.size);
  }

  ngOnDestroy(): void {
    this.activatedRoute$.unsubscribe();
    if (this.companyService$) {
      this.companyService$.unsubscribe();
    }
  }

  private indexServiceTypes() {
    this.loading = true;
    if (!this.lunrIndex) {
      this.serviceTypeService.serviceTypes$
        .subscribe((services: Array<ServiceType>) => {
            this.serviceTypes = services;
            this.lunrIndex = lunr(function () {
              this.ref('id');
              this.field('name');
              services.forEach(service => this.add(service));
            });
            this.deepSearch({service: this.service, zip: this.zipCode});
            this.loading = false;
          },
          err => {
            this.popUpService.showError(getErrorMessage(err));
            this.loading = false
          })
    }
  }
}
