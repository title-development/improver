export class CoverageConfig {
  centerLng: number;
  centerLat: number;
  manualMode: boolean;
  radius: number;
  zips: Array<string>;

  constructor(centerLat: number, centerLng: number, manualMode: boolean, radius: number, zips: Array<string>) {
    this.centerLat = centerLat;
    this.centerLng = centerLng;
    this.manualMode = manualMode;
    this.radius = radius;
    this.zips = zips;
  }
}
