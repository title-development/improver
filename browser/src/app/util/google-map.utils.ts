import { EventEmitter, Injectable } from '@angular/core';
import { isNumber } from 'util';

import { Observable } from 'rxjs';
import { CountyBoundaries, CountyFeature } from "../api/models/CountyBoundaries";
import { ZipBoundaries, ZipFeature } from '../api/models/ZipBoundaries';
import { InfoWindowInt } from '../entity/contractor/contractor-leads-search/intefaces/infoWindowInt';
import { boundaryDefaultStyle, boundaryHighlightStyle } from './google-map-default-options';
import { MapMarkersStore } from './google-map-markers-store.service';
import LatLng = google.maps.LatLng;
import Feature = google.maps.Data.Feature;
import { GoogleMap } from '@agm/core/services/google-maps-types';

@Injectable()
export class GoogleMapUtilsService {
  EARTH_RADIUS_KM = 6378.137;
  zipBoundariesStore = new Map<string, ZipFeature>();
  countyBoundariesStore = new Map<string, CountyFeature>();
  companyMarker;
  private biggestArray = [];
  private companyMarkerInfoWindow;
  private companyMarkerMouseLeaveListener;
  private companyMarkerMouseOverListener;

  constructor(private markersStore: MapMarkersStore) {
  }

  getPolygonBounds(coordinates: any[]): google.maps.LatLngBounds {
    this.biggestArray = [];
    const bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();
    const biggest = this.getBiggestChildArray(coordinates);
    for (const cor of biggest) {
      bounds.extend(new google.maps.LatLng(cor[1], cor[0]));
    }

    return bounds;
  }

  getBiggestChildArray(coordinates): any[] {
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

  clearAllDataLayers(gMap: google.maps.Map): void {
    gMap.data.forEach((feature) => {
      gMap.data.remove(feature);
    });
  }

  clearCoverageDataLayers(gMap: google.maps.Map): void {
    gMap.data.forEach((feature) => {
      if (!feature.getProperty('disabled')) { gMap.data.remove(feature); }
    });
  }

  updateZipFeatureSelectedProperty(zip, prop: boolean): void {
    const zipFeature: ZipFeature = this.zipBoundariesStore.get(zip);
    zipFeature.properties.selected = prop;
    this.zipBoundariesStore.set(zip, zipFeature);
  }

  drawCompanyMarker(gMap: google.maps.Map, latLng: LatLng | google.maps.LatLngLiteral): void {
    this.companyMarker = new google.maps.Marker({
      anchorPoint: new google.maps.Point(-4, -35),
      position: latLng,
      map: gMap,
      icon: '../../../../assets/img/company-marker.png',
    });
  }

  createCompanyMarkerInfoWindow(gMap: google.maps.Map): void {
    this.companyMarkerInfoWindow = new google.maps.InfoWindow({
      content: 'Company Location',
    });
    this.companyMarkerMouseOverListener = this.companyMarker.addListener('mouseover', () => {
      this.companyMarkerInfoWindow.open(gMap, this.companyMarker);
    });
    this.companyMarkerMouseLeaveListener = this.companyMarker.addListener('mouseout', () => {
      this.companyMarkerInfoWindow.close(gMap);
    });
  }

  removeCompanyMarkerInfoWindow(): void {
    if (this.companyMarkerInfoWindow) {
      this.companyMarkerInfoWindow.setMap(null);
    }
    google.maps.event.removeListener(this.companyMarkerMouseLeaveListener);
    google.maps.event.removeListener(this.companyMarkerMouseOverListener);
  }

  removeCompanyMarker(): void {
    if (this.companyMarker) {
      this.companyMarker.setMap(null);
    }

  }

  updateCountyCoverageInStore(selectedCounties: string[], gMap: google.maps.Map): void {
    Array.from(this.countyBoundariesStore.values()).forEach((feature: CountyFeature) => {
      feature.properties.selected = selectedCounties.some((area) => area == feature.id);
    });
    gMap.data.forEach((feature) => {
      const selected = selectedCounties.some((area) => area == feature.getId());
      feature.setProperty('selected', selected);
    });
  }

  updateZipCoverageInStore(selectedZips: string[], gMap: google.maps.Map): void {
    Array.from(this.zipBoundariesStore.values()).forEach((feature: ZipFeature) => {
      feature.properties.selected = selectedZips.some((zip) => zip == feature.properties.zip);
    });
    gMap.data.forEach((feature) => {
      const selected = selectedZips.some((zip) => zip == feature.getProperty('zip'));
      feature.setProperty('selected', selected);
    });
  }

  zipsToDraw(gMap: google.maps.Map, zipBoundaries: ZipBoundaries, areas: string[], servedZipCodes: string[] = []): ZipFeature[] {
    return zipBoundaries.features
      .map((zipFeature: ZipFeature) => {
        let drawnZip = false;
        const isZipCovered: boolean = servedZipCodes.includes(zipFeature.properties.zip);
        const isZipInArea: boolean = areas.includes(zipFeature.properties.zip);
        gMap.data.forEach((feature: Feature) => {
          if (feature.getProperty('zip') == zipFeature.properties.zip) {
            drawnZip = true;
            return; // exit from loop if zip already  drawn
          }
        });
        if (drawnZip) {
          return;
        }

        if (servedZipCodes.length > 0 && !isZipCovered) {
          return;
        }

        zipFeature.properties.selected = isZipInArea;

        return zipFeature;
      })
      // deleting undefined objects
      .filter((zipFeature: ZipFeature) => !!zipFeature);
  }

  /**
   * @param {google.maps.Map} gMap Google map Object
   * @param {CountyBoundaries} countyBoundaries
   * @param {Array<string>} areas
   * @param {Array<string>} servedCounties
   * @returns {Array<ZipFeature>}
   */
  countiesToDraw(gMap: google.maps.Map, countyBoundaries: CountyBoundaries, areas: string[], servedCounties: string[] = []): CountyFeature[] {
    return countyBoundaries.features
      .map((countyFeature: CountyFeature) => {
        let drawnArea = false;
        const isCountyCovered: boolean = servedCounties.includes(countyFeature.id);
        const isCountyInArea: boolean = areas.includes(countyFeature.id);
        gMap.data.forEach((feature: Feature) => {
          if (feature.getId() == countyFeature.id) {
            drawnArea = true;
            return; // exit from loop if county already drawn
          }
        });
        if (drawnArea) {
          return;
        }

        if (servedCounties.length > 0 && !isCountyCovered) {
          return;
        }

        countyFeature.properties.selected = isCountyInArea;

        return countyFeature;
      })
      // deleting undefined objects
      .filter((countyFeature: CountyFeature) => !!countyFeature);
  }

  /**
   * Modify zip boundaries with 'selected' property to display served area
   * @param {ZipBoundaries} zipBoundaries all boundaries in map view
   * @param {Array<string>} servedZipCodes served zip codes array
   * @returns {Array<ZipFeature>} modified zip boundaries
   */
  markAreasZips(zipBoundaries: ZipBoundaries, servedZipCodes: string[] = []): ZipFeature[] {
    return zipBoundaries.features.filter((feature) => {
      feature.properties.selected = true;
      return servedZipCodes.length > 0 ? servedZipCodes.includes(feature.properties.zip) : true;
    });
  }

  /**
   * Draws only service area zip codes
   * @param {google.maps.Map} gMap
   * @param {ZipBoundaries} coverage company service area boundaries
   */
  drawAreasZips(gMap: google.maps.Map, coverage: ZipBoundaries | ZipFeature[]): void {
    const zipData: ZipBoundaries = coverage instanceof Array ? new ZipBoundaries('FeatureCollection', coverage) : coverage;
    zipData.features.map((feature) => feature.properties.selected = true);
    gMap.data.addGeoJson(zipData, {
      idPropertyName: 'zip',
    });
  }

  /**
   * Draws only service area counties
   * @param {google.maps.Map} gMap
   * @param {CountyBoundaries} coverage company service area boundaries
   */
  drawAreasCounties(gMap: google.maps.Map, coverage: CountyBoundaries | CountyFeature[]): void {
    const countyData: CountyBoundaries = coverage instanceof Array ? new CountyBoundaries('FeatureCollection', coverage) : coverage;
    countyData.features.map((feature) => feature.properties.selected = true);
  }

  drawLeadsMarkers(gMap: google.maps.Map, leads, infoWindow: EventEmitter<InfoWindowInt>): Map<string, ZipFeature[]> {
    const zipCodesWithLeads = new Map<string, ZipFeature[]>();
    const outsizeZips = new Map<string, ZipFeature[]>();
    this.markersStore.deleteMarkers();
    leads.forEach((lead) => {
      const zip = lead.location.zip.toString();
      if (!zipCodesWithLeads.has(zip)) {
        zipCodesWithLeads.set(zip, [lead]);
      } else {
        zipCodesWithLeads.set(zip, [...zipCodesWithLeads.get(zip), lead]);
      }
    });
    Array.from(zipCodesWithLeads.keys()).forEach((zip) => {
      if (this.zipBoundariesStore.has(zip)) {
        const zipFeature: ZipFeature = this.zipBoundariesStore.get(zip);
        const zipCenterLatLng = this.getPolygonBounds(zipFeature.geometry.coordinates).getCenter();
        this.createLeadMarker(gMap, zipFeature, zipCenterLatLng, zipCodesWithLeads, infoWindow);
      } else {
        outsizeZips.set(zip, zipCodesWithLeads.get(zip));
      }
    });

    return outsizeZips;
  }

  /**
   * @param {google.maps.Map} gMap
   * @param {ZipBoundaries | Array<ZipFeature>} zipBoundaries
   */
  drawZipBoundaries(gMap: google.maps.Map, zipBoundaries: ZipBoundaries | ZipFeature[]): void {
    const zipData: ZipBoundaries = zipBoundaries instanceof Array ? new ZipBoundaries('FeatureCollection', zipBoundaries) : zipBoundaries;
    gMap.data.addGeoJson(zipData, {
      idPropertyName: 'zip',
    });
  }

  /**
   * @param gMap
   * @param {CountyBoundaries | Array<CountyFeature>} countyBoundaries
   */
  drawCountyBoundaries(gMap: google.maps.Map, countyBoundaries: CountyBoundaries | CountyFeature[]): void {
    const countyData: CountyBoundaries = countyBoundaries instanceof Array ? new CountyBoundaries('FeatureCollection', countyBoundaries) : countyBoundaries;
    gMap.data.addGeoJson(countyData);
  }

  drawZipBoundary(gMap: google.maps.Map, zipFeature: ZipFeature): google.maps.LatLngBounds {
    zipFeature.properties.selected = true;
    const zipData = new ZipBoundaries('FeatureCollection', [zipFeature]);
    gMap.data.addGeoJson(zipData, {
      idPropertyName: 'zip',
    });
    return this.getPolygonBounds(zipFeature.geometry.coordinates);
  }

  drawZipCircle(gMap: google.maps.Map, zipFeature: ZipFeature): google.maps.Circle {
    const zipBounds = this.getPolygonBounds(zipFeature.geometry.coordinates);

    const radius = this.distanceBetweenPoints(
      zipBounds.getSouthWest().lat(),
      zipBounds.getSouthWest().lng(),
      zipBounds.getNorthEast().lat(),
      zipBounds.getNorthEast().lng())
      / 2;

    return this.drawCircle(gMap, radius, zipBounds.getCenter());
  }

  drawCircle(gMap: google.maps.Map, radius: number,
             center: LatLng,
             config: {draggable: boolean, editable: boolean} = {draggable: false, editable: false}): google.maps.Circle {
    return new google.maps.Circle({
      strokeColor: '#009EDE',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#14ABE3',
      fillOpacity: 0.3,
      map: gMap,
      center,
      radius,
      draggable: config.draggable,
      editable: config.editable,
    });
  }

  addressGeocode(address: string): Observable<google.maps.LatLng | google.maps.LatLngBounds> {
    const geocoder = new google.maps.Geocoder();

    return Observable.create((observer) => {
      geocoder.geocode({address}, (results, status) => {
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

  // todo add animation
  highlightZip(gMap: google.maps.Map, zip: string, time: number = 8000, callback: Function = undefined): void {
    gMap.data.forEach((feature) => {
      if (feature.getProperty('zip') === zip) {
        const selected = feature.getProperty('selected');
        const fillOpacity = selected ? 1 : 0;
        gMap.data.overrideStyle(feature, boundaryHighlightStyle);
        setTimeout(() => {
          gMap.data.overrideStyle(feature, {...boundaryDefaultStyle, fillOpacity});
          if (typeof callback == 'function') {
            callback.call(this);
          }
        }, time);
      }
    });
  }

  createLeadMarker(gMap: google.maps.Map, feature, zipCenterLatLng, zipCodesWithLeads, infoWindow: EventEmitter<InfoWindowInt>): void {
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
      map: gMap,
      icon: svgIcon,
      label: {
        text: zipCodesWithLeads.get(feature.properties.zip).length.toString(),
        color: '#ffffff',
        fontSize: '12px',
        fontFamily: 'Lato',
        fontWeight: '600',
      },
    });
    const handler = () => {
      infoWindow.emit({
        leadsAmount: zipCodesWithLeads.get(feature.properties.zip).length.toString(),
        zip: feature.properties.zip.toString(),
        leads: zipCodesWithLeads.get(feature.properties.zip.toString()),
        latLng: {lat: zipCenterLatLng.lat(), lng: zipCenterLatLng.lng()},
      });
    };
    this.markersStore.addMarker(marker);
    this.markersStore.setListener('mouseover', handler);
    marker.addListener('mouseover', handler);
    this.markersStore.setListener('click', handler);
    marker.addListener('click', handler);
  }

  distanceBetweenPoints(lat1, lon1, lat2, lon2) {
    const dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    const dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = this.EARTH_RADIUS_KM * c;
    return distance * 1000; // meters
  }

  fitMapToDataLayer(gMap: google.maps.Map): void {
    const bounds = new google.maps.LatLngBounds();
    gMap.data.forEach((feature) => {
      if (feature.getProperty('disabled')) { return; }
      feature.getGeometry().forEachLatLng((latlng) => bounds.extend(latlng));
    });
    gMap.fitBounds(bounds);
  }

  fitMapToCoverage(gMap: google.maps.Map): void {
    const bounds = new google.maps.LatLngBounds();
    gMap.data.forEach((feature) => {
      if (!feature.getProperty('selected')) { return; }
      feature.getGeometry().forEachLatLng((latlng) => bounds.extend(latlng));
    });
    gMap.fitBounds(bounds);
  }

}

export function applyStyleToMapLayers(gMap: google.maps.Map | GoogleMap, clickable: boolean = false) {
  const areasStyleOptions = {
    strokeColor: '#8b8b8b',
    fillColor: '#14abe3',
  };
  (gMap as google.maps.Map).data.setStyle((feature) => {
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
      fillOpacity: disabled ? 0.22 : fillOpacity,
    };
  });
}

/**
 *
 * @param {google.maps.Map} gMap

 */
export function applyDisabledStyleToMap(gMap: google.maps.Map) {
  const areasStyleOptions = {
    strokeColor: '#8b8b8b',
  };
  gMap.data.setStyle((feature) => {
    return {
      visible: true,
      clickable: false,
      strokeColor: areasStyleOptions.strokeColor,
      fillColor: '#5b5b5b',
      strokeWeight: 0,
      strokeOpacity: 0.22,
      fillOpacity: 0.22,
    };
  });
}
