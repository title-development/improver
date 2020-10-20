import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2, ViewChild
} from '@angular/core';
import { SecurityService } from '../../../auth/security.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Role } from '../../../model/security-model';
import { Subscription } from 'rxjs';
import { MediaQuery, MediaQueryService } from '../../../api/services/media-query.service';
import { NotificationService } from "../../../api/services/notification.service";
import { NotificationResource } from "../../../util/notification.resource";
import { Notification } from "../../../api/models/Notification";
import { Router } from '@angular/router';
import { ScrollService } from '../../../api/services/scroll.service';
import { Pagination } from "../../../model/data-model";
import { getErrorMessage } from "../../../util/functions";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";
import { finalize, first } from "rxjs/operators";

@Component({
  selector: 'notifications-popup',
  templateUrl: 'notifications-popup.component.html',
  styleUrls: ['notifications-popup.component.scss'],
  animations: [
    trigger('toggleNotificationPopup', [
      state('active', style({transform: 'translateX(0)', opacity: '1'})),
      state('inactive', style({transform: 'translateY(10px)', opacity: '0', right: "-9999px", left: 'initial'})),
      state('inactive-mobile', style({transform: 'translateX(120%)', opacity: '0', right: "-9999px", left: 'initial'})),
      transition('* <=> *', animate('.25s linear'))
    ])
  ]
})
export class NotificationsPopupComponent implements OnChanges, OnDestroy {

  @Input() get toggle(): boolean {
    return this._toggle;
  }

  set toggle(value: boolean) {
    this.toggleChange.emit(value);
    this._toggle = value;
  }

  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter();


  Role = Role;
  animationState: string | 'inactive' | 'active';
  mediaQuery: MediaQuery;

  private _toggle: boolean = false;
  private mediaWatcher: Subscription;
  private menuWidth: number = 320;
  resizeHandler = () => this.onResize();

  showMore = false;
  notifications: Notification [] = [];
  unreadMessages: Notification [] = [];
  private pagination: Pagination = new Pagination(0, 5);
  notificationsProcessing = false;
  notificationsSubscription$;
  onReadSubscription$;
  unreadMessagesCount: number = 0;
  notificationAndMessageItemsHeight: {item: any, height: number, type: string}[] = [];

  psConfig = {
    wheelPropagation: false
  };
  @ViewChild('notificationsBlockElement') notificationsElementRef: ElementRef;

  constructor(private elementRef: ElementRef,
              @Inject('Window') private window: Window,
              private query: MediaQueryService,
              private renderer: Renderer2,
              public securityService: SecurityService,
              public notificationService: NotificationService,
              public notificationResource: NotificationResource,
              private scrollService: ScrollService,
              private router: Router,
              private popUpService: PopUpMessageService,
              private changeDetectorRef: ChangeDetectorRef,
              private ngZone: NgZone) {
    this.mediaWatcher = this.query.screen.subscribe((media: MediaQuery) => {
      this.mediaQuery = media;
      this.animationState = (media.xs || media.sm) ? 'inactive-mobile' : 'inactive';
    });
    this.window.addEventListener('resize', this.resizeHandler);

    this.getNotifications(this.pagination);
    this.subscribeOnUnreadNotifications();
    this.getUnreadMessages();

    this.onReadSubscription$ = this.notificationService.onRead.subscribe(ids => this.markAsRead(ids));

    this.securityService.onLogout.pipe(first()).subscribe(() => {
      if (this.notificationsSubscription$) {
        this.notificationsSubscription$.unsubscribe();
        this.notifications = []
      }
    })
    this.notificationResource.unreadMessagesCount$.subscribe( unreadMessagesCount => {
      this.unreadMessagesCount = unreadMessagesCount
    })

  }

  ngOnChanges(changes): void {
    if (changes.toggle && changes.toggle.currentValue) {
      const el = this.elementRef.nativeElement;
      const elRect = el.getBoundingClientRect();
      if (elRect.left + this.menuWidth > this.window.innerWidth) {
        this.renderer.addClass(el, '-glue');
      } else {
        this.renderer.removeClass(el, '-glue');
      }
      this.animationState = 'active';
    } else {
      this.animationState = (this.mediaQuery.xs || this.mediaQuery.sm) ? 'inactive-mobile' : 'inactive';
    }
  }

  resetItemsHeight() {
    this.notificationAndMessageItemsHeight = []
  }

  findItemsHeight(item: HTMLElement, notification: any, type: string) {
    let notificationsBlockHeight: number = 0;
    let findIndex = this.notificationAndMessageItemsHeight.findIndex(item => item.item.payload == notification.payload &&
      ((item.item.id !== null && item.item.id == notification.id) || (item.item.projectId != null && item.item.projectId == notification.projectId)) &&
      item.type == type
    )

    if (findIndex >= 0) {
      this.notificationAndMessageItemsHeight[findIndex] = {item: notification, height: item.offsetHeight, type: type};
    } else {
      this.notificationAndMessageItemsHeight.push({item: notification, height: item.offsetHeight, type: type})
    }

    // sort messages first
    this.notificationAndMessageItemsHeight = this.notificationAndMessageItemsHeight.sort(function (a, b) {
      if (a.type < b.type) { return -1; }
      if (a.type > b.type) { return 1; }
      return 0;
    }).slice(0, 6);

    // set notifications block height
    this.notificationAndMessageItemsHeight.forEach(item => {
      notificationsBlockHeight = notificationsBlockHeight + item.height;
    })
    if (this.notificationsElementRef) {
      this.renderer.setStyle(this.notificationsElementRef.nativeElement, 'height', notificationsBlockHeight + 'px')
    }
  }

  getUnreadMessages() {
    this.notificationsProcessing = true;
    this.notificationResource.unreadMessages$
      .pipe(finalize(() => this.notificationsProcessing = false))
      .subscribe(unreadMessages => this.unreadMessages = unreadMessages,
        err => this.popUpService.showError(getErrorMessage(err)))
  }

  getNotifications(pagination: Pagination) {
    this.notificationsProcessing = true;
    this.notificationService.getAll(pagination)
      .pipe(finalize(() => this.notificationsProcessing = false))
      .subscribe(
      notifications => {
        this.notifications.push(...notifications.content);
        this.showMore = !notifications.last;
        this.changeDetectorRef.detectChanges();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err));
      }
    );
  }

  subscribeOnUnreadNotifications() {
    this.notificationsSubscription$ = this.notificationResource.newUnreadNotifications.subscribe(notifications => {
        let contentSize = this.pagination.size * (this.pagination.page + 1);
        this.notifications.unshift(...notifications);
        if (this.notifications.length > contentSize) {
          // remove last item(s) to prevent duplication after pagination
          this.notifications = this.notifications.slice(0, -notifications.length);
          this.showMore = true;
        }
    });
  }

  onResize(): void {
    if (this.toggle) {
      this.toggle = false;
    }
  }

  close(): void {
    this.animationState = (this.mediaQuery.xs || this.mediaQuery.sm) ? 'inactive-mobile' : 'inactive';
    this.toggle = false;
  }

  ngOnDestroy(): void {
    this.mediaWatcher.unsubscribe();
    this.window.removeEventListener('resize', this.resizeHandler);
    if (this.notificationsSubscription$) {
      this.notificationsSubscription$.unsubscribe();
      this.notifications = []
    }
    if (this.onReadSubscription$) {
      this.onReadSubscription$.unsubscribe();
    }
  }

  read(id) {
    let index = this.notifications.findIndex((obj => obj.id == id));
    this.notifications[index].read = true;
    this.notificationService.read([id]).subscribe(() => {
      this.notificationResource.unreadNotificationsCounter--;
    })
  }

  readAll() {
    if (this.notifications.length > 0) {
      let ids = [];
      this.notifications.forEach(item => {
        ids.push(item.id);
        item.read = true;
      });
      this.notificationService.read(ids).subscribe(() => {
        this.notificationResource.unreadNotificationsCounter = 0;
      })
    }
  }

  markAsRead(ids: any []) {
    this.notifications.forEach(notification => {
      if (ids.includes(notification.id)) {
        notification.read = true;
      }
    })
  }

  navigate(url: string): void {
    let urlFragments : Array<string> = url.split("#");
    let hashFragment: string = urlFragments.pop();
    this.ngZone.run(() => {
      if(urlFragments.length > 0) {
        this.scrollService.navigateAndScrollToElementById(urlFragments[0], hashFragment)
      } else {
        this.router.navigate([url])
      }
    })
  }

  trackBy(index, item) {
    item.id
  }

  psYReachEnd(event: UIEvent) {
    if (this.showMore) {
      this.getNotifications(this.pagination.nextPage())
    }
  }
}



