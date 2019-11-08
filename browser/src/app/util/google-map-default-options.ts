import { MapOptions } from '@agm/core/services/google-maps-types';
import { mapStyles } from '../layout/map.style';
import { InfoWindowInt } from '../entity/contractor/contractor-leads-search/intefaces/infoWindowInt';

export const defaultMapOptions: MapOptions = {
  center: {
    lat: 40.730610,
    lng: -73.935242
  },
  zoom: 11,
  minZoom: 10,
  maxZoom: 16,
  rotateControl: false,
  panControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  zoomControl: false,
  styles: mapStyles
};

export const mapStyle = [
  {
    "featureType": "landscape.natural",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "saturation": -40
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "saturation": -40
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
]

export const infoWindowDefaults: InfoWindowInt = {
  zip: '07002',
  leads: [],
  leadsAmount: '1',
  latLng: {
    lat: 40.730610,
    lng: -73.935242,
  },
  inCoverage: true,
};

export const boundaryDefaultStyle: google.maps.FusionTablesPolygonOptions = {
  strokeColor: '#6e696c',
  fillColor: '#14ABE3',
  strokeWeight: 1,
  fillOpacity: 0
};

export const boundaryHighlightStyle: google.maps.FusionTablesPolygonOptions = {
  strokeColor: '#3098bf',
  fillColor: 'rgb(0, 185, 255)',
  strokeWeight: 2,
  fillOpacity: 0.55

};
