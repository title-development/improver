import { EventEmitter, Injectable } from '@angular/core';
import LatLng = google.maps.LatLng;
import { isNumber } from 'util';

import { ZipBoundaries, ZipFeature } from '../api/models/ZipBoundaries';
import { InfoWindowInt } from '../entity/contractor/contractor-leads-search/intefaces/infoWindowInt';
import { MapMarkersStore } from './google-map-markers-store.service';
import { boundaryDefaultStyle, boundaryHighlightStyle } from './google-map-default-options';
import { Observable } from 'rxjs';
import Feature = google.maps.Data.Feature;


@Injectable()
export class GoogleMapUtilsService {
  EARTH_RADIUS_KM = 6378.137;
  zipBoundariesStore = new Map<string, ZipFeature>();
  companyMarker;
  private biggestArray = [];
  private companyMarkerInfoWindow;
  private companyMarkerMouseLeaveListener;
  private companyMarkerMouseOverListener;

  constructor(private markersStore: MapMarkersStore) {
  }

  getPolygonBounds(coordinates: Array<any>): google.maps.LatLngBounds {
    this.biggestArray = [];
    const bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
    const biggest = this.getBiggestChildArray(coordinates);
    for (const cor of biggest) {
      bounds.extend(new google.maps.LatLng(cor[1], cor[0]));
    }

    return bounds;
  }

  getBiggestChildArray(coordinates): Array<any> {
    if (coordinates.length > 0) {
      for (const i of coordinates) {
        if (i.length > 0 && !isNumber(i[0])) {
          this.getBiggestChildArray(i);
          if (i.length > this.biggestArray.length) {
            this.biggestArray = i;
          }
        }
      }
    }

    return this.biggestArray;
  }

  clearAllDataLayers(map: google.maps.Map): void {
    map.data.forEach(feature => {
      map.data.remove(feature);
    });
  }

  clearCoverageDataLayers(map: google.maps.Map): void {
    map.data.forEach(feature => {
      if (!feature.getProperty('disabled')) map.data.remove(feature);
    });
  }

  updateZipFeatureSelectedProperty(zip, prop: boolean): void {
    const zipFeature: ZipFeature = this.zipBoundariesStore.get(zip);
    zipFeature.properties.selected = prop;
    this.zipBoundariesStore.set(zip, zipFeature);
  }

  drawCompanyMarker(map, latLng: LatLng | google.maps.LatLngLiteral): void {
    this.companyMarker = new google.maps.Marker({
      anchorPoint: new google.maps.Point(-4, -35),
      position: latLng,
      map: map,
      icon: '../../../../assets/img/company-marker.png'
    });
  }

  createCompanyMarkerInfoWindow(map: google.maps.Map): void {
    this.companyMarkerInfoWindow = new google.maps.InfoWindow({
      content: 'Company Location'
    });
    this.companyMarkerMouseOverListener = this.companyMarker.addListener('mouseover', () => {
      this.companyMarkerInfoWindow.open(map, this.companyMarker);
    });
    this.companyMarkerMouseLeaveListener = this.companyMarker.addListener('mouseout', () => {
      this.companyMarkerInfoWindow.close(map);
    });
  }

  removeCompanyMarkerInfoWindowListeners(): void {
    google.maps.event.removeListener(this.companyMarkerMouseLeaveListener);
    google.maps.event.removeListener(this.companyMarkerMouseOverListener);
  }

  removeCompanyMarker(): void {
    if (this.companyMarker) {
      this.companyMarker.setMap(null);
    }

  }

  updateCoverageInStore(selectedZips: Array<string>, map): void {
    Array.from(this.zipBoundariesStore.values()).forEach((feature: ZipFeature) => {
      feature.properties.selected = selectedZips.some(zip => zip == feature.properties.zip);
    });
    map.data.forEach(feature => {
      const selected = selectedZips.some(zip => zip == feature.getProperty('zip'));
      feature.setProperty('selected', selected);
    });
  }

  /**
   * @param {map} map Google map Object
   * @param {ZipBoundaries} zipBoundaries
   * @param {Array<string>} areas
   * @param {Array<string>} servedZipCodes
   * @returns {Array<ZipFeature>}
   */
  zipsToDraw(map, zipBoundaries: ZipBoundaries, areas: Array<string>, servedZipCodes: Array<string> = []): Array<ZipFeature> {
    return zipBoundaries.features
      .map((zipFeature: ZipFeature) => {
        let drawnZip = false;
        let isZipCovered: boolean = servedZipCodes.includes(zipFeature.properties.zip);
        let isZipInArea: boolean = areas.includes(zipFeature.properties.zip);
        map.data.forEach((feature: Feature) => {
          if (feature.getProperty('zip') == zipFeature.properties.zip) {
            drawnZip = true;
            return; // exit from loop if zip already  drawn
          }
        });
        if (drawnZip) {
          return;
        }

        if(servedZipCodes.length > 0 && !isZipCovered) {
          return
        }

        zipFeature.properties.selected = isZipInArea;

        return zipFeature;
      })
      //deleting undefined objects
      .filter((zipFeature: ZipFeature) => !!zipFeature);
  }

  /**
   * Modify zip boundaries with 'selected' property to display served area
   * @param {ZipBoundaries} zipBoundaries all boundaries in map view
   * @param {Array<string>} servedZipCodes served zip codes array
   * @returns {Array<ZipFeature>} modified zip boundaries
   */
  markAreasZips(zipBoundaries: ZipBoundaries, servedZipCodes: Array<string> = []): Array<ZipFeature> {
    return zipBoundaries.features.filter(feature => {
      feature.properties.selected = true;
      return servedZipCodes.length > 0 ? servedZipCodes.includes(feature.properties.zip) : true;
    });
  }

  /**
   * Draws only service area zip codes
   * @param {google.maps.Map} map
   * @param {ZipBoundaries} coverage company service area boundaries
   */
  drawAreasZips(map, coverage: ZipBoundaries | Array<ZipFeature>): void {
    const zipData: ZipBoundaries = coverage instanceof Array ? new ZipBoundaries('FeatureCollection', coverage) : coverage;
    zipData.features.map(feature => feature.properties.selected = true);
    map.data.addGeoJson(zipData, {
      idPropertyName: 'zip'
    });
  }

  drawLeadsMarkers(map, leads, infoWindow: EventEmitter<InfoWindowInt>): Map<string, Array<ZipFeature>> {
    const zipCodesWithLeads = new Map<string, Array<ZipFeature>>();
    const outsizeZips = new Map<string, Array<ZipFeature>>();
    this.markersStore.deleteMarkers();
    leads.forEach((lead) => {
      const zip = lead.location.zip.toString();
      if (!zipCodesWithLeads.has(zip)) {
        zipCodesWithLeads.set(zip, [lead]);
      } else {
        zipCodesWithLeads.set(zip, [...zipCodesWithLeads.get(zip), lead]);
      }
    });
    Array.from(zipCodesWithLeads.keys()).forEach(zip => {
      if (this.zipBoundariesStore.has(zip)) {
        const zipFeature: ZipFeature = this.zipBoundariesStore.get(zip);
        const zipCenterLatLng = this.getPolygonBounds(zipFeature.geometry.coordinates).getCenter();
        this.createLeadMarker(map, zipFeature, zipCenterLatLng, zipCodesWithLeads, infoWindow);
      } else {
        outsizeZips.set(zip, zipCodesWithLeads.get(zip));
      }
    });

    return outsizeZips;
  }

  /**
   *
   * @param {ZipBoundaries | Array<ZipFeature>} zipBoundaries
   */
  drawBoundaries(map, zipBoundaries: ZipBoundaries | Array<ZipFeature>): void {
    const zipData: ZipBoundaries = zipBoundaries instanceof Array ? new ZipBoundaries('FeatureCollection', zipBoundaries) : zipBoundaries;
    map.data.addGeoJson(zipData, {
      idPropertyName: 'zip'
    });
  }

  drawZipBoundary(map, zipFeature: ZipFeature): google.maps.LatLngBounds {
    zipFeature.properties.selected = true;
    const zipData = new ZipBoundaries('FeatureCollection', [zipFeature]);
    map.data.addGeoJson(zipData, {
      idPropertyName: 'zip'
    });
    return this.getPolygonBounds(zipFeature.geometry.coordinates);
  }

  drawZipCircle(map, zipFeature: ZipFeature): google.maps.LatLngBounds {
    let zipBounds = this.getPolygonBounds(zipFeature.geometry.coordinates);

    let radius = this.distanceBetweenPoints(
      zipBounds.getSouthWest().lat(),
      zipBounds.getSouthWest().lng(),
      zipBounds.getNorthEast().lat(),
      zipBounds.getNorthEast().lng())
      / 2;

    let zipCircle = new google.maps.Circle({
      strokeColor: '#009EDE',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#14ABE3',
      fillOpacity: 0.3,
      map: map,
      center: zipBounds.getCenter(),
      radius: radius,
      draggable: false,
      editable: false
    });

    return zipCircle.getBounds();
  }

  addressGeocode(address: string): Observable<google.maps.LatLng | google.maps.LatLngBounds> {
    const geocoder = new google.maps.Geocoder();

    return Observable.create(observer => {
      geocoder.geocode({address: address}, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          observer.next(results[0].geometry.location);
          observer.complete();
        } else {
          observer.error('Google geocoder can not find address');
          observer.complete();
        }
      });
    });
  }

  //todo add animation
  highlightZip(map, zip: string, time: number = 8000, callback: Function = undefined): void {
    map.data.forEach(feature => {
      if (feature.getProperty('zip') === zip) {
        const selected = feature.getProperty('selected');
        const fillOpacity = selected ? 1 : 0;
        map.data.overrideStyle(feature, boundaryHighlightStyle);
        setTimeout(() => {
          map.data.overrideStyle(feature, Object.assign(boundaryDefaultStyle, {fillOpacity: fillOpacity}));
          if (typeof callback == 'function') {
            callback.call(this);
          }
        }, time);
      }
    });
  }

  createLeadMarker(map, feature, zipCenterLatLng, zipCodesWithLeads, infoWindow: EventEmitter<InfoWindowInt>): void {
    const svgIcon = {
      url: '../../../../assets/img/marker.png',
      size: new google.maps.Size(36, 40),
      origin: new google.maps.Point(-1, -1),
      labelOrigin: new google.maps.Point(18, 20),
      anchor: new google.maps.Point(18, 40),
    };
    const marker = new google.maps.Marker({
      position: zipCenterLatLng,
      title: feature.properties.zip,
      map: map,
      icon: svgIcon,
      label: {
        text: zipCodesWithLeads.get(feature.properties.zip).length.toString(),
        color: '#ffffff',
        fontSize: '12px',
        fontFamily: 'Lato',
        fontWeight: '600'
      }
    });
    const handler = () => {
      infoWindow.emit({
        leadsAmount: zipCodesWithLeads.get(feature.properties.zip).length.toString(),
        zip: feature.properties.zip.toString(),
        leads: zipCodesWithLeads.get(feature.properties.zip.toString()),
        latLng: {lat: zipCenterLatLng.lat(), lng: zipCenterLatLng.lng()}
      });
    };
    this.markersStore.addMarker(marker);
    this.markersStore.setListener('mouseover', handler);
    marker.addListener('mouseover', handler);
  }

  distanceBetweenPoints(lat1, lon1, lat2, lon2) {
    let dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    let dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let distance = this.EARTH_RADIUS_KM * c;
    return distance * 1000; // meters
  }

  fitMapToDataLayer(map: google.maps.Map): void {
    const bounds = new google.maps.LatLngBounds();
    map.data.forEach(feature => {
      if (feature.getProperty('disabled')) return;
      feature.getGeometry().forEachLatLng(latlng => bounds.extend(latlng));
    });
    map.fitBounds(bounds);
  }

  fitMapToCoverage(map: google.maps.Map): void {
    const bounds = new google.maps.LatLngBounds();
    map.data.forEach(feature => {
      if (!feature.getProperty('selected')) return;
      feature.getGeometry().forEachLatLng(latlng => bounds.extend(latlng));
    });
    map.fitBounds(bounds);
  }

}

export function applyStyleToMapLayers(map, clickable: boolean = false) {
  const areasStyleOptions = {
    strokeColor: '#8b8b8b',
    fillColor: '#14abe3'
  };
  map.data.setStyle(feature => {
    const selected = feature.getProperty('selected');
    const fillOpacity = selected ? 0.20 : 0;
    const disabled = feature.getProperty('disabled');

    return {
      visible: feature.getProperty('visible'),
      clickable: disabled ? !disabled : clickable,
      strokeColor: areasStyleOptions.strokeColor,
      fillColor: disabled ? '#5b5b5b' : areasStyleOptions.fillColor,
      strokeWeight: disabled ? 0 : 1,
      strokeOpacity: disabled ? 0.22 : 0.6,
      fillOpacity: disabled ? 0.22 : fillOpacity
    };
  });
}

/**
 *
 * @param {google.maps.Map} map

 */
export function applyDisabledStyleToMap(map) {
  const areasStyleOptions = {
    strokeColor: '#8b8b8b',
  };
  map.data.setStyle(feature => {
    return {
      visible: true,
      clickable: false,
      strokeColor: areasStyleOptions.strokeColor,
      fillColor: '#5b5b5b',
      strokeWeight: 0,
      strokeOpacity: 0.22,
      fillOpacity: 0.22
    };
  });
}

