import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CompanyInfo, Pagination, ServiceType } from '../../model/data-model';
import { CompanyService } from '../../api/services/company.service';
import { Subscription } from 'rxjs';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { RestPage } from '../../api/models/RestPage';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { ProjectActionService } from '../../util/project-action.service';
import * as lunr from 'lunr';


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

  private page = 1;
  private size = 35;
  private search: string;
  private zip: string;
  private activatedRoute$: Subscription;
  private companyService$: Subscription;
  private lunrIndex;
  private serviceTypes: Array<ServiceType>;

  constructor(private activatedRoute: ActivatedRoute,
              private companyService: CompanyService,
              public projectActionService: ProjectActionService,
              private popUpService: PopUpMessageService,
              private serviceTypeService: ServiceTypeService) {

  }

  ngOnInit(): void {
    this.activatedRoute$ = this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.service = params['service'] ? params['service'] : '';
      this.zipCode = params['zip'] ? params['zip'] : '';
      this.indexServiceTypes();
    });
  }

  deepSearch(data: { service: string, zip: string }) {
    this.zip = data.zip;
    this.search = data.service;
    if(this.lunrIndex && this.search.length > 2) {
      this.searchResults = this.lunrIndex.search(`${this.search}*`)
        .map(item => this.serviceTypes.find(service => item.ref == service.id))
        .filter((el, index) => index <= this.page * this.size);
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
    if (!this.lunrIndex) {
      this.serviceTypeService.serviceTypes$.subscribe((services: Array<ServiceType>) => {
        this.serviceTypes = services;
        this.lunrIndex = lunr(function () {
          this.ref('id');
          this.field('name');
          services.forEach(service => this.add(service));
        });
        this.deepSearch({service: this.service, zip: this.zipCode});
      });
    }
  }
}
