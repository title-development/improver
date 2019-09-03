import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { MatDialog, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { PopUpMessageService } from '../util/pop-up-message.service';
import { SecurityService } from '../auth/security.service';
import { dialogsMap } from '../shared/dialogs/dialogs.state';
import { SwUpdate } from '@angular/service-worker';
import { NavigationEnd, Router } from '@angular/router';
import { GoogleAnalyticsService } from '../util/google-analytics.service';
import { HotJarService } from '../util/hotjar.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: [ 'app.component.scss' ]
})
export class AppComponent implements OnInit {

  constructor(@Inject('Window') private window: Window,
              private swUpdate: SwUpdate,
              private mdIconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer,
              private mdDialog: MatDialog,
              private popUpMessageService: PopUpMessageService,
              private securityService: SecurityService,
              private renderer: Renderer2,
              private router: Router,
              private googleAnalyticsService: GoogleAnalyticsService,
              private hotJarService: HotJarService) {

    //todo Fix entry Component for compiler
    dialogsMap;
    popUpMessageService.renderer = renderer;
    this.fixMaterialModals();

  }

  ngOnInit() {
    this.securityService.getCurrentUser(true);
    this.checkSwUpdate();
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
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

  checkSwUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
          console.log("Service is updated, please reload the page to prevent errors");
        alert('We improving your user experience. Page reload required for changes to take effect.');
        window.location.reload();
      });
    }
  }

}




