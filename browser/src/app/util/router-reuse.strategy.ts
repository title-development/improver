import {
  RouteReuseStrategy,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouterModule,
  Routes,
  UrlSegment
} from '@angular/router';
import { Injectable } from "@angular/core";


@Injectable()
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  public shouldDetach(route: ActivatedRouteSnapshot): boolean { return false; }
  public store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {}
  public shouldAttach(route: ActivatedRouteSnapshot): boolean { return false; }
  public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle { return null; }
  public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.data.reuse !== undefined ? future.data.reuse : future.routeConfig === curr.routeConfig;
  }
}
