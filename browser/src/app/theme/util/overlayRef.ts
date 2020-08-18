import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Inject,
  Injectable,
  Injector,
  NgZone,
  Optional,
  Renderer2
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { ScrollHolderService } from '../../util/scroll-holder.service';
import { MatDialog } from "@angular/material/dialog";
import { DeviceControlService } from "../../util/device-control.service";

export enum BackdropType {
  popup = 'cv-type-popup',
  menu = 'cv-type-transparent',
  noEvent = 'cv-type-event-none'
}

@Injectable()
export class OverlayRef {

  renderer: Renderer2;
  $updateDropdownPosition: Subject<void> = new Subject<void>();
  $isDropdownOpenedTop: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private OVERLAY_ID: string = 'cv-popup-overlay';
  private OVERLAY_SDK: string = 'cdk-overlay-container';
  private OVERLAY_SCROLL_BLOCK: string = 'cdk-global-scrollblock';
  private BACKDROP_ID_PREFIX: string = 'cv-backdrop-';
  private MIN_ITEM_HEIGHT: number = 38;
  private uniqueId: number = 0;
  private componentRef;
  private targetElement: HTMLElement;
  private dropDownHolder: HTMLElement;
  private onWindowResize: (event: Event) => void;
  private onScrollHolder: (event: Event) => void;
  private $updateDropDownSubscription: Subscription;
  private timeOut;
  private upDirection: boolean = false;
  private backdropType: BackdropType;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private deviceControlService: DeviceControlService,
              private appRef: ApplicationRef,
              private injector: Injector,
              private scrollHolderService: ScrollHolderService,
              @Inject(DOCUMENT) private document: any,
              @Inject('Window') public window: Window,
              private ngZone: NgZone,
              @Optional() private matDialogs: MatDialog) {
    let self = this;

    this.$updateDropDownSubscription = this.$updateDropdownPosition.subscribe(res => {
      setTimeout(() => {
        this.updateDropdownPosition();
      }, 100);
    });

    this.onWindowResize = function onWindowResize(event: Event): void {
      self.ngZone.run(() => {
        self.updateDropdownPosition();
      });
    };

    this.onScrollHolder = function onScrollHolder(event: Event): void {
      self.ngZone.run(() => {
        self.updateDropdownPosition();
      });
    };
  }

  appendComponentToElement<T>(component, parentElement: any): ComponentRef<T> {
    const componentRef: ComponentRef<T> = this.componentFactoryResolver
      .resolveComponentFactory<T>(component)
      .create(this.injector, [], parentElement);
    this.appRef.attachView(componentRef.hostView);
    this.componentRef = componentRef;

    return componentRef;
  }

  isUpDirection(element: HTMLElement = undefined): boolean {
    if (!element) {
      element = this.targetElement;
    }
    const elementBoundaries = element.getBoundingClientRect();
    const dropDownHeight = this.window.innerWidth >= 576 ? 200 : 120;

    return this.window.innerHeight - (elementBoundaries.top + elementBoundaries.height) <= dropDownHeight;
  }

  createBackdrop(type: BackdropType, targetElement: HTMLElement, direction: 'up' | 'down' = 'down'): HTMLElement {
    this.upDirection = direction == 'up';
    this.targetElement = targetElement;
    this.backdropType = type;
    this.uniqueId++;
    const backdrop: HTMLElement = this.document.createElement('div');
    backdrop.className = `cv-overlay ${type}`;
    backdrop.setAttribute('id', this.BACKDROP_ID_PREFIX + this.uniqueId);
    const holder = this.createHolder();
    this.setDropDownHolderPosition(holder);
    backdrop.appendChild(holder);
    this.appendBackdropToOverlay(backdrop);
    this.window.addEventListener('resize', this.onWindowResize, true);
    this.window.addEventListener('scroll', this.onScrollHolder, true);

    return holder;
  }

  getBackdrop(): HTMLElement {
    return this.document.getElementById(this.BACKDROP_ID_PREFIX + this.uniqueId);
  }

  /**
   * @deprecated
   */
  removeBackdrop(): void {
    const elem: HTMLElement = this.getBackdrop();
    if (elem) {
      if (this.componentRef.instance.closeAnimation instanceof Function) {
        this.componentRef.instance.closeAnimation(() => {
          this.closeDropDown(elem);
        });
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(() => {
          if (this.targetElement != null) {
            this.closeDropDown(elem);
          }
        }, 300);
      } else {
        this.closeDropDown(elem);
      }
    }
    //this.$updateDropDownSubscription.unsubscribe();
    this.window.removeEventListener('resize', this.onWindowResize, true);
    this.window.removeEventListener('scroll', this.onWindowResize, true);
  }

  closeDropDown(elem: HTMLElement): void {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
    this.targetElement = null;
    if (elem && elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
    if (this.document.getElementById(this.BACKDROP_ID_PREFIX + this.uniqueId) != null) {
      this.document.getElementById(this.BACKDROP_ID_PREFIX + this.uniqueId).remove();
    }

  }

  //todo remove hardcode class name
  getOverlay(): HTMLElement {
    let overlay: HTMLElement = null;
    if (this.mdModalOpened()) {
      overlay = this.document.querySelector(`.${this.OVERLAY_SDK} .cdk-global-overlay-wrapper .cdk-overlay-pane`);
    } else {
      overlay = this.document.getElementById(this.OVERLAY_ID);
      if (!overlay) {
        overlay = this.createOverlay();
      }
    }

    return overlay;
  }

  /**
   * Backdrop
   */

  private appendBackdropToOverlay(backdrop: HTMLElement): void {
    const overlay: HTMLElement = this.getOverlay();
    overlay.appendChild(backdrop);
  }

  private createHolder(): HTMLElement {
    this.dropDownHolder = this.document.createElement('div');
    this.dropDownHolder.className = 'cv-holder';

    return this.dropDownHolder;
  }

  private updateDropdownPosition(): void {
    if (this.targetElement) {
      this.setDropDownHolderPosition(this.dropDownHolder);
    }

  }

  private setDropDownHolderPosition(element: HTMLElement): void {
    const elementBoundaries = this.targetElement.getBoundingClientRect();
    let pageScr;
    if (this.deviceControlService.isIOS() && this.mdModalOpened()){
      pageScr = this.getPageScroll();
    } else {
      pageScr = this.mdModalOpened() ? this.getSDKScroll() : this.getPageScroll();
    }
    if (this.upDirection || this.isUpDirection(this.targetElement)) {
      element.style.bottom = `${ this.window.innerHeight - elementBoundaries.top - pageScr.y}px`;
      element.style.top = 'auto';
      this.$isDropdownOpenedTop.next(true);
    } else {
      element.style.top = `${elementBoundaries.top + pageScr.y + elementBoundaries.height}px`;
      element.style.bottom = 'auto';
      this.$isDropdownOpenedTop.next(false);
    }
    if(this.backdropType == BackdropType.popup || this.backdropType == BackdropType.noEvent) {
      if(element.offsetWidth + elementBoundaries.left > this.window.innerWidth) {
        element.style.right = `${this.window.innerWidth - elementBoundaries.right + pageScr.x}px`;
        element.style.left = 'auto';
      } else {
        element.style.left = `${elementBoundaries.left + pageScr.x}px`;
        element.style.right = 'auto';
      }
    } else {
      element.style.left = `${elementBoundaries.left + pageScr.x}px`;
      element.style.right = 'auto';
    }
    element.style.minHeight = `${this.MIN_ITEM_HEIGHT}px`;
    if (this.backdropType != BackdropType.popup && this.backdropType != BackdropType.noEvent) {
      element.style.width = `${elementBoundaries.width}px`;
    }
  }

  private mdModalOpened(): boolean {
    return this.matDialogs ? this.matDialogs.openDialogs.length > 0 : false;
  }

  /**
   * Overlay
   */

  private createOverlay(): HTMLElement {
    const overlay: HTMLElement = this.document.createElement('div');
    overlay.setAttribute('id', this.OVERLAY_ID);
    overlay.className = this.OVERLAY_ID;
    this.document.body.appendChild(overlay);

    return overlay;
  }

  /**
   * Page Scroll Offset
   * @returns {{x: number; y: number}}
   */
  private getPageScroll(): { x: number, y: number } {
    const x = (window.pageXOffset !== undefined) ? window.pageXOffset : (this.document.documentElement || this.document.body.parentNode || this.document.body).scrollLeft;
    const y = (window.pageYOffset !== undefined) ? window.pageYOffset : (this.document.documentElement || this.document.body.parentNode || this.document.body).scrollTop;

    return {x, y};
  }

  /**
   * Cdk overlay Scroll Offset
   * @returns {{x: number; y: number}}
   */
  private getSDKScroll(): { x: number, y: number } {
    const x = this.document.querySelector(`.${this.OVERLAY_SDK}`).scrollLeft;
    const y = this.document.querySelector(`.${this.OVERLAY_SDK}`).scrollTop;

    return {x, y};
  }

}
