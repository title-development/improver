import {Inject, Injectable} from "@angular/core";
import {InjectableRxStompConfig, RxStompService} from '@stomp/ng2-stompjs';
import {SecurityService} from "../auth/security.service";
import {RxStompState} from '@stomp/rx-stomp';
import {IFrame} from '@stomp/stompjs';
import {environment} from '../../environments/environment';
import {PopUpMessageService} from "./pop-up-message.service";


@Injectable()
export class MyStompService extends RxStompService {

  private readonly wsEndpoint = (this.window.location.protocol == 'https:' ? 'wss' : 'ws' ) + '://' + this.window.location.host + '/ws';

  private initialized: boolean = false;
  private readonly initialConfig: InjectableRxStompConfig = {
    brokerURL: this.wsEndpoint,
    connectHeaders: {},
    heartbeatIncoming: 0,        // Typical value 0 - disabled
    heartbeatOutgoing: 20000,    // Typical value 20000 - every 20 seconds
    reconnectDelay: 0,           // Disabled, we do manual reconnect through this.reconnectAfter()
    debug: (str) => {
      if (!environment.production) {
        console.log(new Date(), str);
      }
    }
  };

  private static readonly INVALID_TOKEN_ERROR = '403: Valid token required';
  private static readonly TOKEN_EXPIRED_ERROR = '401: Token expired';
  private static readonly ACCESS_DENIED_EXCEPTION_PART = 'AccessDeniedException';



  public constructor(private securityService: SecurityService,
                     @Inject('Window') private window: Window,
                     private popUpService: PopUpMessageService,) {
    super();
    this.connectionState$.subscribe((state : RxStompState) => {
      if (state == RxStompState.CLOSED && this.initialized) {
        this.reconnectAfter(1000);
      }
    });
    this.stompErrors$.subscribe((iframe: IFrame) => {
      let msg: string;
      if (typeof iframe === 'object') {
        if(iframe.command === 'ERROR') {
          msg = iframe.headers['message'];
        } else {
          msg = iframe.body;
        }
      }
      if (msg.startsWith(MyStompService.TOKEN_EXPIRED_ERROR)){
        this.reconnectAfter(100)
      } else if (msg.startsWith(MyStompService.INVALID_TOKEN_ERROR) || msg.includes(MyStompService.ACCESS_DENIED_EXCEPTION_PART)) {
        console.error(msg);
        this.shutDown();
        this.popUpService.showError('Error connecting to message broker')
      } else {
        console.error(msg);
        this.shutDown();
        this.popUpService.showError('Unexpected error during connecting to message broker')
      }

    });
  }

  private reconnectAfter(ms: number): void {
    this.delay(ms)
      .then(any => {
        if(this.securityService.isAuthenticated()) {
          if (this.securityService.isTokenExpired()){
            this.securityService.refreshAccessToken().subscribe(() => this.restartBroker());
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
    this.initialized = false;
    this.deactivate();
  }

  restartBroker() {
    this.initialized = true;
    this.initialConfig.connectHeaders = {
      authorization: this.securityService.getTokenHeader()
    };
    this.configure(this.initialConfig);
    this.activate();
  }

}
