import { Lead } from '../../../../model/data-model';

export interface InfoWindowInt {
  leads: Lead[],
  zip: string,
  leadsAmount: string,
  latLng: {
    lat: number,
    lng: number
  }
}
