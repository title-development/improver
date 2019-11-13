import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class ComponentCanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor() {
  }

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    return component.canDeactivate() ? true : confirm('Do you want to leave this page? You have unsaved changes! Press Cancel to stay, or OK to discard changes.');
  }
}
