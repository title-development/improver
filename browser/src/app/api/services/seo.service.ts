import { Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { CompanyProfile } from "../../model/data-model";

@Injectable({providedIn: 'root'})
export class SeoService {

  private title = 'Home Improve';
  private description = 'Online service for any kind of home improvement';
  private logo = 'https://www.homeimprove.com/assets/img/logo-200x200.png';
  private url = 'https://www.homeimprove.com';


  constructor(private titleService: Title,
              private metaTagService: Meta) {
  }

  reset() {
    // Common
    this.titleService.setTitle(this.title);
    this.metaTagService.updateTag({name: 'description', content: this.description});
    // Facebook
    this.metaTagService.updateTag({property: 'og:image', content: this.logo});
    this.metaTagService.updateTag({property: 'og:image:url', content: this.logo});
    this.metaTagService.updateTag({property: 'og:image:secure_url', content: this.logo});
    this.metaTagService.updateTag({property: 'og:image', content: this.logo});
    this.metaTagService.updateTag({property: 'og:description', content: this.description});
    // Twitter
    this.metaTagService.updateTag({name: 'twitter:description', content: this.description});
    this.metaTagService.updateTag({name: 'twitter:image', content: this.logo});
    this.metaTagService.updateTag({name: 'twitter:card', content: this.logo});
  }

  companyProfile(company: CompanyProfile) {
    let image = company.iconUrl ? this.url + company.iconUrl : this.logo;
    let title = company.name + " profile on Home Improve";
    // Common
    this.titleService.setTitle(company.name);
    this.metaTagService.updateTag({name: 'description', content: title});
    // Facebook
    this.metaTagService.updateTag({property: 'og:image', content: image});
    this.metaTagService.updateTag({property: 'og:image:url', content: image});
    this.metaTagService.updateTag({property: 'og:image:secure_url', content: image});
    this.metaTagService.updateTag({property: 'og:image', content: image});
    this.metaTagService.updateTag({property: 'og:description', content: title});
    // Twitter
    this.metaTagService.updateTag({name: 'twitter:description', content: title});
    this.metaTagService.updateTag({name: 'twitter:image', content: image});
    this.metaTagService.updateTag({name: 'twitter:card', content: image});
  }

}
