import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventEmitter, Injectable } from '@angular/core';
import { Notification } from "../models/Notification";
import { RestPage } from "../models/RestPage";
import { Project } from "../models/Project";

@Injectable()
export class NotificationService {

  private notificationUrl = 'api/notifications';
  private readUrl = '/read';
  private unreadCountUrl = '/unread/count';

  onRead: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor(private http: HttpClient) {
  }

  getAll(pagination): Observable<RestPage<Notification>> {
    return this.http.get<RestPage<Notification>>(`${this.notificationUrl}`, {params: pagination});
  }

  countUnread(): Observable<number> {
    return this.http.get<number>(`${this.notificationUrl}${this.unreadCountUrl}`);
  }

  read(ids: any[]): Observable<any> {
    this.onRead.emit(ids);
    return this.http.put(`${this.notificationUrl}${this.readUrl}`, {}, {params: {ids: ids}})
  }

}
