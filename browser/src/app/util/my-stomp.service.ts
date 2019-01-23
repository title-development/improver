import {Inject, Injectable} from "@angular/core";
import {StompConfig, StompRService} from "@stomp/ng2-stompjs";
import {SecurityService} from "../auth/security.service";
import * as Stomp from '@stomp/stompjs';


@Injectable()
export class MyStompService extends StompRService {

  private readonly wsEndpoint = (this.window.location.protocol == 'https:' ? 'wss' : 'ws' ) + '://' + this.window.location.host + '/ws';

  private readonly initialConfig: StompConfig = {
    url: this.wsEndpoint,
    headers: {},
    heartbeat_in: 0,        // Typical value 0 - disabled
    heartbeat_out: 20000,   // Typical value 20000 - every 20 seconds
    reconnect_delay: 0,     // every 10 seconds
    debug: true
  };



  public constructor(private securityService: SecurityService,
                     @Inject('Window') private window: Window) {
    super();
    this.errorSubject.subscribe(value => {
      if (typeof value === 'object') {
        value = (<Stomp.Message>value).body;
      }
      if (value.startsWith('Valid token required')) {
        this.disconnect();
      } else if (value.startsWith('Expired')) {
        this.reconnectAfter(1000);
      } else if (value.startsWith('Whoops! Lost connection to')) {
        this.reconnectAfter(1000)
      } else {
        console.error('Cannot connect to STOMP broker')
      }
    })
  }

  private reconnectAfter(ms: number): void {
    this.delay(ms)
      .then(any => {
        if(this.securityService.isAuthenticated()) {
          if (this.securityService.isTokenExpired()){
            this.securityService.refreshAccessToken().subscribe(value1 => this.restartBroker());
          } else {
            this.restartBroker();
          }
        }
      });
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(()=> resolve(), ms)).then(() => {});
  }

  public shutDown(): void {
    this.disconnect();
    this.config = null;
    this.client = null;
  }

  restartBroker() {
    this.initialConfig.headers = {
      authorization: this.securityService.getTokenHeader()
    };
    //this.initialConfig.url = this.wsEndpoint + '?access_token=' + this.securityService.getTokenHeader();
    this.config = this.initialConfig;
    this.initAndConnect();
  }

}
