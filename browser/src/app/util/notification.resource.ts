import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Notification } from '../api/models/Notification';
import { NotificationService } from '../api/services/notification.service';
import { SecurityService } from '../auth/security.service';
import { BillingService } from '../api/services/billing.service';
import { PopUpMessageService } from '../api/services/pop-up-message.service';
import { getErrorMessage } from './functions';
import { MyStompService } from '../api/services/my-stomp.service';


@Injectable()
export class NotificationResource {

  unreadMessages$: BehaviorSubject<Array<Notification>> = new BehaviorSubject<Array<Notification>>([]);
  unreadMessagesCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  notifiedProjectId$: EventEmitter<number> = new EventEmitter<number>()
  public newUnreadNotifications: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
  public unreadNotificationsCounter: number = 0;
  private notificationsObservable: Observable<any>;
  private topicSubscription$: Subscription;
  private unreadMessagesInterval;
  private unreadMessagesCount: number = 0;
  private unreadMessages: Array<Notification> = [];
  private INTERVAL_DELAY: number = 20000;
  private RAND_MIN_VALUE: number = 0;
  private RAND_MAX_VALUE: number = 20000;

  constructor(private securityService: SecurityService,
              private notificationService: NotificationService,
              private billingService: BillingService,
              public popUpService: PopUpMessageService,
              private myStompService: MyStompService) {

    this.securityService.onUserInit.subscribe(this.init);

    this.securityService.onLogout.subscribe(() => {
      this.notificationsObservable = null;
      if (this.topicSubscription$) {
        this.topicSubscription$.unsubscribe();
        this.topicSubscription$ = null;
      }
      this.myStompService.shutDown();
      this.newUnreadNotifications.next([]);
      this.unreadNotificationsCounter = 0;
      this.destroyUnreadMessagesFlow();
    });

  }

  public subscribeOnNotifications() {
    this.topicSubscription$ = this.getNotificationSubscription(this.securityService.getLoginModel().id).subscribe(
      notification => {
        notification = JSON.parse(notification.body);
        switch (notification.type) {
          case Notification.Type.PLAIN:
            this.newUnreadNotifications.next([notification.body]);
            this.unreadNotificationsCounter++;
            this.notifiedProjectId$.emit(notification.body.projectId)
            break;
          case Notification.Type.BILLING:
            this.billingService.billing = notification.body;
            this.billingService.onBillingUpdated.emit();
            break;
          case Notification.Type.UNREAD_MESSAGES:
            this.unreadMessagesCount = notification.body.length;
            this.unreadMessages = notification.body;
            this.unreadMessages$.next(this.unreadMessages);
            this.unreadMessagesCount$.next(this.unreadMessagesCount);
            break;
          default:
            console.warn('Unknown notification type');
        }
      }
    );
  }

  public getNotificationSubscription(userId: string): Observable<any> {
    if (!this.notificationsObservable) {
      this.notificationsObservable = this.myStompService.watch(`/queue/users/${userId}/notifications`);
    }
    return this.notificationsObservable;
  }


  init = () => {
    if (this.securityService.isAuthenticated()) {
      this.myStompService.restartBroker();
      this.notificationService.countUnread().subscribe(
        (count) => {
          this.unreadNotificationsCounter = count;
        },
        err => {
          this.popUpService.showError(getErrorMessage(err));
        });
      this.subscribeOnNotifications();
      this.unreadNotificationEmitter();
    }
  };

  public read(index: number): void {
    this.unreadMessages.splice(index, 1);
    this.unreadMessagesCount = this.unreadMessagesCount - 1;
    this.unreadMessages$.next(this.unreadMessages);
    this.unreadMessagesCount$.next(this.unreadMessagesCount);
  }

  private unreadNotificationEmitter(): void {
    const randDelay: number = Math.floor(Math.random() * (this.RAND_MAX_VALUE - this.RAND_MIN_VALUE) + this.RAND_MIN_VALUE);
    this.publishUnreadMessagesRequest();
    this.unreadMessagesInterval = setInterval(() => this.publishUnreadMessagesRequest(), this.INTERVAL_DELAY + randDelay);
  }

  private publishUnreadMessagesRequest(): void {
    if (!this.securityService.isAuthenticated()) {
      this.destroyUnreadMessagesFlow()
      return
    }
    this.myStompService.publish({destination: `/app/users/${this.securityService.getLoginModel().id}/unread`});
  }

  private destroyUnreadMessagesFlow() {
    clearInterval(this.unreadMessagesInterval);
    this.unreadMessagesCount = 0;
    this.unreadMessages = [];
    this.unreadMessages$.next([]);
    this.unreadMessagesCount$.next(0);
  }
}


