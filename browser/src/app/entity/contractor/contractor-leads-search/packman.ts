import DirectionsRequest = google.maps.DirectionsRequest;
import { BehaviorSubject } from 'rxjs';

export class PackMan {
  private speedFactor = 10;
  private autoDriveSteps = [];
  private steps = [];
  private startLocation = {};
  private endLocation = {};

  private directionsService;
  private directionsDisplay;

  private map = null;
  private polyline = null;
  private poly2 = null;
  private poly3 = null;
  private marker = null;
  private interval: any;

  public packManCome$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(map) {
    this.map = map;
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.directionsDisplay.setMap(null);
    this.createPolyline();
  }

  public startAnimation(from, destination) {
    this.clearPackMan();
    let request: DirectionsRequest = {
      origin: new google.maps.LatLng(40.730610, -73.935242),
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    };
    this.createMarker(new google.maps.LatLng(40.730610, -73.935242));


    this.directionsService.route(request, (response, status) => {
      this.directionsDisplay.setDirections(response);
      console.log(response);
      let bounds = new google.maps.LatLngBounds();
      let route = response.routes[ 0 ];
      let path = response.routes[ 0 ].overview_path;
      let legs = response.routes[ 0 ].legs;
      let pathCC = google.maps.geometry.encoding.decodePath(response.routes[ 0 ].overview_polyline);
      // console.log(pathCC);
      // this.poly3.setPath(pathCC);
      // this.polyline.setPath(pathCC);
      // this.poly2.setPath(pathCC);
      // for(let latLng of pathCC) {
      //   bounds.extend(latLng);
      // }
      for (let i = 0; i < legs.length; i++) {
        if (i == 0) {
          this.startLocation[ 'latlng' ] = legs[ i ].start_location;
          this.startLocation[ 'address' ] = legs[ i ].start_address;
        }
        this.endLocation[ 'latlng' ] = legs[ i ].end_location;
        this.endLocation[ 'address' ] = legs[ i ].end_address;
        this.steps = legs[ i ].steps;
        for (let j = 0; j < this.steps.length; j++) {
          let nextSegment = this.steps[ j ].path;
          for (let k = 0; k < nextSegment.length; k++) {
            this.polyline.getPath().push(nextSegment[ k ]);
            this.poly2.getPath().push(nextSegment[ k ]);
            // },k * 100);
            this.poly3.getPath().push(nextSegment[ k ]);
            // setTimeout(()=> {
            // console.log(nextSegment[ k ]);
            // this.poly3.getPath().push(nextSegment[ k ]);
            bounds.extend(nextSegment[ k ]);
          }
        }
      }
      this.polyline.setMap(this.map);
      this.poly2.setMap(this.map);
      this.poly3.setMap(this.map);

      bounds = this.offsetMap(330, 0, bounds);
      this.map.fitBounds(bounds);
      this.animateCircle(this.polyline, this.poly2);
      let paths = this.poly3.getPath();
      console.log(paths);
      this.poly3.setPath([]);
      let newPath = this.poly3.getPath()
      let ii =0;
      this.interval = setInterval(()=> {
        newPath.push(paths.b[ii]);
        this.marker.setPosition(paths.b[ii]);
        this.poly3.setPath(newPath);
        // console.log(paths.b[ii]);
        ii++;
        if(ii > paths.b.length - 1) {
          clearInterval(this.interval);
        }

      }, 20);
      // console.log(this.poly3.getPath());
      // console.log(this.steps.length);

    });
  }

  private startRouteAnimation() {
    let autoDriveTimer = setInterval(() => {
      // stop the timer if the route is finished
      if (this.autoDriveSteps.length === 0) {
        clearInterval(autoDriveTimer);
      } else {
        // move marker to the next position (always the first in the array)
        this.marker.setPosition(this.autoDriveSteps[ 0 ]);
        // remove the processed position
        this.autoDriveSteps.shift();
      }
    }, 10);
  }

  private getPointBetween(a, b, ratio) {
    return new google.maps.LatLng(a.lat() + (b.lat() - a.lat()) * ratio, a.lng() + (b.lng() - a.lng()) * ratio);
  }

  /**
   * Offset Map
   * @type {number}
   */
  private offsetMap(offsetX: number, offsetY: number, bounds) {
    let point1 = this.map.getProjection().fromLatLngToPoint(bounds.getSouthWest());
    this.map.fitBounds(bounds);
    let point2 = new google.maps.Point(
      offsetX / Math.pow(2, this.map.getZoom()) || 0,
      offsetY / Math.pow(2, this.map.getZoom()) || 0
    );
    let newPoint = this.map.getProjection().fromPointToLatLng(new google.maps.Point(
      point1.x - point2.x,
      point1.y + point2.y
    ));
    bounds.extend(newPoint);
    return bounds;
  }

  public clearPackMan() {
    this.directionsDisplay.setMap(null);
    this.polyline.setMap(null);
    this.polyline.setPath([]);
    this.poly2.setMap(null);
    this.poly2.setPath([]);
    this.poly3.setMap(null);
    this.poly3.setPath([]);
    clearInterval(this.interval);
    if (this.marker) {
      this.marker.setMap(null);
    }
    this.steps = [];
  }


  public animateCircle(line, line2) {
    let count = 0;
    let interval = setInterval(() => {
      count = count + 0.7;
      let line2Icons = line2.get('icons');
      // let icons = line.get('icons');
      // line2Icons[0].repeat = count + '%';
      // line2Icons[0].offset = count + '%';
      // icons[ 0 ].offset = count + '%';
      // line.set('icons', icons);
      line2.set('icons', line2Icons);
      if (count >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.packManCome$.next(true);
        });
      }
    }, 20);
  }


  private createMarker(latlng) {
    let svgIcon = {
      url: "../../../../../assets/img/truck.png",
      size: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 16),
    };
    this.marker = new google.maps.Marker({
      icon: svgIcon,
      position: latlng,
      map: this.map,
      title: '',
    });
    // return marker;
  }

  private createPolyline() {
    let lineSymbol = {
      path: "m550.83 249.68c4.5518 141-104.73 259.35-243.59 263.84-138.87 4.483-255.56-106.59-260.14-247.58-2.906-90.017 41.65-175.42 116.52-223.88l135.55 221.36 120.95-229.64c77.845 43.535 127.81 125.88 130.71 215.89z",
      fillColor: '#FF0000',
      fillOpacity: 1,
      anchor: new google.maps.Point(270, 0),
      scale: .04
    };
    let circle = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 2,
      fillOpacity: 1,
      strokeColor: '#000'
    };
    let circle2 = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 3,
      strokeColor: '#000'
    };
    this.polyline = new google.maps.Polyline({
      path: [],
      strokeOpacity: 0,
      // icons: [ {
      //   icon: lineSymbol,
      //   offset: '0',
      // } ],
    });
    this.poly2 = new google.maps.Polyline({
      path: [],
      strokeColor: '#FF0000',
      strokeOpacity: 0,
      icons: [ {
        icon: circle,
        offset: '0%',
        repeat: '10px'
      } ],
    });
    this.poly3 = new google.maps.Polyline({
      path: [],
      strokeColor: '#FF0000',
      strokeWeight: 4,
      strokeOpacity: 1,
    });
    this.poly3.setMap(null);
    this.poly2.setMap(null);
    this.polyline.setMap(null);
  }

}
