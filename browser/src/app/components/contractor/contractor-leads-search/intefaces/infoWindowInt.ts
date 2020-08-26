import { ShortLead } from '../../../../model/data-model';

export interface InfoWindowInt {
  leads: ShortLead[],
  zip: string,
  leadsAmount: string,
  latLng: {
    lat: number,
    lng: number,
  },
  inCoverage: boolean
}
