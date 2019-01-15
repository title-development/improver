import { Injectable } from '@angular/core';

import { Observer ,  BehaviorSubject ,  Observable } from "rxjs";
import { share } from "rxjs/internal/operators";



export interface ZipActions {
  action: string,
  zip: string
}

@Injectable()
export class ServiceAreaService {

  private zipCodes: { added: string[], removed: string[] } = { added: [], removed: [] };
  public zipUndoAction$: BehaviorSubject<ZipActions> = new BehaviorSubject<ZipActions>({ action: "", zip: "" });
  public zipSearch$ = new BehaviorSubject('');

  public zipCodes$: Observable<any>;
  private zipCodeObs: Observer<any>;

  constructor() {
    this.zipCodes$ = new Observable(obs => this.zipCodeObs = obs).pipe(share());
  }

  public updateAddedZips(zips: string[]) {
    this.zipCodes.added = zips;
    this.zipCodeObs.next(this.zipCodes);
  }

  public updateRemovedZips(zips: string[]) {
    this.zipCodes.removed = zips;
    this.zipCodeObs.next(this.zipCodes);
  }

  public doSearch(s: string) {
    this.zipSearch$.next(s);
  }

  public undoAdd(zip: string) {
    this.zipUndoAction$.next({ action: "ADD", zip: zip });
  }

  public undoRemove(zip: string) {
    this.zipUndoAction$.next({ action: "REMOVE", zip: zip });
  }

}
