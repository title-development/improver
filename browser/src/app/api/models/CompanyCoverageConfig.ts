import { Location } from '../../model/data-model';
import { CoverageConfig } from './CoverageConfig';

export class CompanyCoverageConfig {
  coverageConfig: CoverageConfig;
  companyLocation: Location;

  constructor(coverageConfig: CoverageConfig, companyLocation: Location) {
    this.coverageConfig = coverageConfig;
    this.companyLocation = companyLocation;
  }

  getCompanyLocationCenter(): google.maps.LatLng {
    return new google.maps.LatLng(this.companyLocation.lat, this.companyLocation.lng);
  }
  getCompanyCoverageCenter(): google.maps.LatLng {
    return new google.maps.LatLng(this.coverageConfig.centerLat, this.coverageConfig.centerLng);
  }
}
