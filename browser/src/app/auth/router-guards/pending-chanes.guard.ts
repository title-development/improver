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
    return component.canDeactivate() ? true : confirm('WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.');
  }
}
