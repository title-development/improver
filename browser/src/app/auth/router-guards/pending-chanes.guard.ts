import { CanDeactivate } from '@angular/router';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceAreaComponent } from '../../entity/settings/contractor-account/service-area/service-area.component';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor() {

  }

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    return component.canDeactivate() ? true : confirm('Do you want to leave this page? You have unsaved changes! Press Cancel to stay, or OK to discard changes.');
  }
}
