export interface CountyFeature {
  id: any;
  geometry: CountyGeometry;
  properties: CountyProperties;
}

export class CountyProperties {
  city: string;
  state: string;
  selected: boolean;
  disabled: boolean;
  visible: boolean;
  name: string;
}

export class CountyGeometry {
  type: string;
  coordinates: Array<number>;
}

export class CountyBoundaries {
  type: string;
  features: Array<CountyFeature>;

  constructor(type: string, features: Array<CountyFeature>) {
    this.type = type;
    this.features = features;
  }

  addFeature(countyFeature: Array<CountyFeature>): CountyBoundaries {
    this.features = [...this.features, ...countyFeature];
    return this
  }
}

export class CountyMapArea {
  id: any;
  name: string;
  state: string;

  constructor(id: any, name: string, state: string) {
    this.id = id;
    this.name = name;
    this.state = state;
  }
}
