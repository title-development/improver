import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Notification } from '../api/models/Notification';
import { NotificationService } from '../api/services/notification.service';
import { SecurityService } from '../auth/security.service';
import { BillingService } from '../api/services/billing.service';
import { PopUpMessageService } from './pop-up-message.service';
import { getErrorMessage } from './functions';
import {MyStompService} from "./my-stomp.service";

@Injectable()
export class NotificationResource {



  public newUnreadNotifications: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>([]);
  public unreadNotificationsCounter: number = 0;
  private notificationsObservable: Observable<any>;

  constructor(private securityService: SecurityService,
              private notificationService: NotificationService,
              private billingService: BillingService,
              public popUpService: PopUpMessageService,
              private myStompService: MyStompService) {

    this.securityService.onUserInit.subscribe(this.init);

    this.securityService.onLogout.subscribe(() => {
      // this.newUnreadNotifications.next([]);
      this.unreadNotificationsCounter = 0;
      this.myStompService.shutDown();
      this.notificationsObservable = undefined;
    });

  }

  public subscribeOnNotifications() {
    this.getNotificationSubscription(this.securityService.getLoginModel().id).subscribe(
      notification => {
        notification = JSON.parse(notification.body);
        switch (notification.type) {
          case Notification.Type.PLAIN:
            this.newUnreadNotifications.next([notification.body]);
            this.unreadNotificationsCounter++;
            break;
          case Notification.Type.BILLING:
            this.billingService.billing = notification.body;
            this.billingService.onBillingUpdated.emit();
            break;
          default:
            console.warn('Unknown notification type');
        }
      }
    );
  }

  public getNotificationSubscription(userId: string): Observable<any> {
    if (this.notificationsObservable == undefined) {
      this.notificationsObservable = this.myStompService.subscribe(`/topic/users/${userId}/notifications`);
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
        error => {
          this.popUpService.showError(getErrorMessage(error));
        });

      this.subscribeOnNotifications();

    }
  };




}


