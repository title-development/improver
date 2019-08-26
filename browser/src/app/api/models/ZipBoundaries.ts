export interface ZipFeature {
  geometry: ZipGeometry;
  properties: ZipProperties;
}

export class ZipProperties {
  city: string;
  country: string;
  county: string;
  selected: boolean;
  disabled: boolean;
  visible: boolean;
  state: string;
  zip: string;
}

export class ZipGeometry {
  type: string;
  coordinates: Array<number>;
}

export class ZipBoundaries {
  type: string;
  features: Array<ZipFeature>;

  constructor(type: string, features: Array<ZipFeature>) {
    this.type = type;
    this.features = features;
  }

  addFeature(zipFeature: Array<ZipFeature>): ZipBoundaries {
    this.features = [...this.features, ...zipFeature];
    return this
  }
}
