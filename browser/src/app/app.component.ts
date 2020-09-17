import { AfterViewInit, Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PopUpMessageService } from './api/services/pop-up-message.service';
import { SecurityService } from './auth/security.service';
import { NavigationEnd, Router } from '@angular/router';
import { MetricsEventService } from "./api/services/metrics-event.service";
import 'hammerjs';
import '../../extend';
import { GlobalSpinnerService } from "./util/global-spinner.serivce";


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: [ 'app.component.scss' ]
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(@Inject('Window') private window: Window,
              private mdIconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer,
              private mdDialog: MatDialog,
              private popUpMessageService: PopUpMessageService,
              private securityService: SecurityService,
              private renderer: Renderer2,
              private router: Router,
              private metricsEventService: MetricsEventService,
              public globalSpinnerService: GlobalSpinnerService) {

    popUpMessageService.renderer = renderer;
  }

  ngOnInit() {
    this.securityService.getCurrentUser(true);
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  ngAfterViewInit(): void {
    this.fixMaterialModals();
  }

  fixMaterialModals() {
    this.mdDialog.afterOpened.subscribe(
      (modal) => {
        document.documentElement.style.overflow = 'hidden';
        let container = document.getElementsByClassName("cdk-overlay-container")[ 0 ];
        if (container) {
          container.classList.add("pointer-event-fix-auto");
        }
        document.getElementsByTagName("body")[ 0 ].style.overflowY = "overlay";
      }
    );


    this.mdDialog.afterAllClosed.subscribe(
      () => {
        document.documentElement.style.overflow = 'auto';
        let container = document.getElementsByClassName("cdk-overlay-container")[ 0 ];
        if (container) {
          container.classList.remove("pointer-event-fix-auto")
        }
        document.getElementsByTagName("body")[0].style.overflowY = "visible";
      }
    );
  }

}




