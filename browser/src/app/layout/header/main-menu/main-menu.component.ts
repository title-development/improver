import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output, Renderer2
} from '@angular/core';
import { SecurityService } from '../../../auth/security.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Role } from '../../../model/security-model';
import { Subscription } from 'rxjs';
import { MediaQuery, MediaQueryService } from '../../../util/media-query.service';
import { distinctUntilChanged } from 'rxjs/internal/operators';
import { Constants } from '../../../util/constants';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { dialogsMap } from '../../../shared/dialogs/dialogs.state';
import { confirmDialogConfig } from '../../../shared/dialogs/dialogs.configs';
import { ReferralDialogComponent } from '../../../shared/dialogs/refreal-dialog/referral-dialog.component';


@Component({
  selector: 'main-menu',
  templateUrl: 'main-menu.component.html',
  styleUrls: ['main-menu.component.scss'],
  animations: [
    trigger('toggleMenu', [
      state('active', style({transform: 'translateX(0)', opacity: '1'})),
      state('inactive', style({transform: 'translateY(10px)', opacity: '0', right: "-9999px", left: 'initial'})),
      state('inactive-mobile', style({transform: 'translateX(-120%)', opacity: '0', right: "-9999px", left: 'initial'})),
      transition('* <=> *', animate('.25s linear'))
    ])
  ]
})

export class MainMenuComponent implements OnChanges, OnDestroy {

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
  private referralDialogRef: MatDialogRef<ReferralDialogComponent>;

  private _toggle: boolean = false;
  private mediaWatcher: Subscription;
  private menuWidth: number = 215;
  resizeHandler = () => this.onResize();

  constructor(public securityService: SecurityService,
              private elementRef: ElementRef,
              @Inject('Window') private window: Window,
              private query: MediaQueryService,
              private renderer: Renderer2,
              public constants: Constants,
              private dialog: MatDialog
  ) {
    this.mediaWatcher = this.query.screen.pipe(
      distinctUntilChanged()
    ).subscribe((media: MediaQuery) => {
      this.mediaQuery = media;
      this.animationState = (media.xs || media.sm) ? 'inactive-mobile' : 'inactive';
    });
    this.window.addEventListener('resize', this.resizeHandler);
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

  onResize(): void {
    if (this.toggle) {
      this.toggle = false;
    }
  }

  close(): void {
    this.animationState = (this.mediaQuery.xs || this.mediaQuery.sm) ? 'inactive-mobile' : 'inactive';
    this.toggle = false;
  }

  logout(): void {
    this.close();
    //we have to wait close animation
    setTimeout(() => {
      this.securityService.logout();
    }, 250);
  }

  toggleReferralDialog(): void {
    this.referralDialogRef = this.dialog.open(dialogsMap['referral-dialog'], confirmDialogConfig);
    this.referralDialogRef.afterClosed()
      .subscribe(() => {
        this.referralDialogRef = null;
      });
  }

  ngOnDestroy(): void {
    this.mediaWatcher.unsubscribe();
    this.window.removeEventListener('resize', this.resizeHandler);
  }

}
