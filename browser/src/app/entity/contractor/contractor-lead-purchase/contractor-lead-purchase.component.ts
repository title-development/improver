import { ApplicationRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Lead, PaymentCard, SystemMessageType } from '../../../model/data-model';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { SecurityService } from '../../../auth/security.service';
import { addPaymentCardDialogConfig } from '../../../shared/dialogs/dialogs.configs';
import { LeadService } from '../../../api/services/lead.service';
import { BillingService } from '../../../api/services/billing.service';
import { BoundariesService } from '../../../api/services/boundaries.service';
import { applyStyleToMapLayers, GoogleMapUtilsService } from '../../../util/google-map.utils';
import { TricksService } from '../../../util/tricks.service';
import { ZipFeature } from '../../../api/models/ZipBoundaries';
import { interval, Observable, of, Subject, Subscription } from 'rxjs';
import { AgmMap } from '@agm/core';

import { dialogsMap } from '../../../shared/dialogs/dialogs.state';
import { getErrorMessage } from '../../../util/functions';
import { first, map, switchMap, takeUntil, tap } from 'rxjs/internal/operators';

@Component({
  selector: 'contractor-lead-purchase-page',
  templateUrl: './contractor-lead-purchase.component.html',
  styleUrls: ['./contractor-lead-purchase.component.scss']
})

export class ContractorLeadPurchaseComponent implements OnInit, OnDestroy {
  step = 1;
  leadUID: string;
  lead: Lead;
  LEAD_NOT_FOUND_MESSAGE = 'The lead you searching is not available. You can search more leads suitable for you.';
  leadErrorHeader: string;
  leadErrorMessage: string;
  leadError = false;
  leadTryAgainAvailable = false;
  leadProcessing = true;
  cardProcessing = true;
  map: google.maps.Map;
  paymentCards: PaymentCard[];
  updateCreditCardDialogRef: MatDialogRef<any>;
  similarLeads: Array<Lead> = [];
  // subscription: BillingSubscription;
  @ViewChild(AgmMap) agmMap: AgmMap;
  private MINS_TO_REFRESH: number = 1;
  chargeFromCard: boolean;
  projectRequestId;
  private readonly destroyed$ = new Subject<void>();
  private mapCircle: google.maps.Circle | null = null;

  constructor(public route: ActivatedRoute,
              public dialog: MatDialog,
              public popUpMessageService: PopUpMessageService,
              public securityService: SecurityService,
              public tricksService: TricksService,
              private applicationRef: ApplicationRef,
              private leadService: LeadService,
              private billingService: BillingService,
              private boundariesService: BoundariesService,
              private gMapUtils: GoogleMapUtilsService) {
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      params['uid'] ? this.leadUID = params['uid'].toString() : this.leadUID = '';
      this.getLead();
      this.getPaymentCards();
      this.getSimilarLeads();
    });

    // TODO: Consider to add notification about billing updates instead of checking subscription by interval
    interval(this.MINS_TO_REFRESH * 1000 * 60)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
      if (this.step != 1)
        return;
      this.getLead();
    });

  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    if (this.lead && this.lead.location.zip) {
      this.gMapUtils.zipBoundariesStore.delete(this.lead.location.zip);
    }
  }

  onMapReady(map): void {
    this.map = map;
  }

  getLead(): void {
    this.step = 1;
    this.leadError = false;
    this.leadService.get(this.leadUID).pipe(
      switchMap((lead: Lead) => {
        this.lead = lead;
        //TODO: check this after fixed map
        this.leadError = false;
        this.leadProcessing = false;

        return this.map ? of(this.map) : this.agmMap.mapReady;
      }),
      switchMap((gmap: google.maps.Map) => {
        applyStyleToMapLayers(gmap);
        return this.getLeadZipFeature(this.lead);
      }),
      tap((zipFeature: ZipFeature | null) => {
          if (!zipFeature) {
            this.popUpMessageService.showError('Unexpected error during map rendering');
          } else {
            this.clearCircle();
            this.mapCircle = this.gMapUtils.drawZipCircle(this.map, zipFeature);
            if (this.mapCircle) {
              this.map.fitBounds(this.mapCircle.getBounds());
            }
          }
        }
      )
    ).subscribe(
      () => {
        this.leadError = false;
        this.leadProcessing = false;
      },
      err => {
        switch (err.status) {
          case 404: {
            this.leadError = true;
            this.leadErrorHeader = err.error ? err.error.message : 'Unknown error';
            this.leadErrorMessage = this.LEAD_NOT_FOUND_MESSAGE;
            this.lead = null;
            this.leadProcessing = false;
            break;
          }
        }

      });
  }


  purchaseLead() {
    this.chargeFromCard = !this.billingService.billing.subscriptionOn && this.lead.price > this.billingService.billing.balance ||
      this.billingService.billing.subscriptionOn && this.lead.price > (this.billingService.billing.balance - this.billingService.billing.reserve);
    this.leadProcessing = true;
    this.leadService.purchase(this.leadUID, this.chargeFromCard)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        projectRequestId => {
          this.projectRequestId = projectRequestId;
          this.leadProcessing = false;
          this.step = 2;
        },
        err => {
          this.leadTryAgainAvailable = false;
          this.leadProcessing = false;
          this.billingService.getBalance();

          switch (err.status) {
            case 402: {
              this.step = 2;
              this.leadError = true;
              this.leadErrorHeader = 'Payment error';
              this.leadErrorMessage = getErrorMessage(err);
              this.leadTryAgainAvailable = true;
              break;
            }
            case 404: {
            }
            case 409: {
              this.step = 2;
              this.leadError = true;
              this.leadErrorHeader = getErrorMessage(err);
              this.leadErrorMessage = this.LEAD_NOT_FOUND_MESSAGE;
              break;
            }

          }

        });
  }

  getPaymentCards() {
    this.billingService.getCards(this.securityService.getLoginModel().company)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        cards => {
          this.paymentCards = cards;
          this.cardProcessing = false;
        },
        err => {
          console.log(err);
          this.popUpMessageService.showMessage({
            text: JSON.parse(err.error).message,
            type: SystemMessageType.ERROR
          });
          this.cardProcessing = false;
        }
      );
  }

  redirectToLeadBuy(): void {
    this.step = 1;
    this.leadError = false;
  }

  openAddPaymentCard() {
    this.dialog.closeAll();
    this.updateCreditCardDialogRef = this.dialog.open(dialogsMap['add-payment-card-dialog'], addPaymentCardDialogConfig);
    this.updateCreditCardDialogRef
      .afterClosed()
      .subscribe(result => {
        this.updateCreditCardDialogRef = null;
      });
    this.updateCreditCardDialogRef.componentInstance.onPaymentCardAdd.subscribe((card: any) => {
      this.getPaymentCards();
    });
  }

  openChangeDefaultPaymentCard() {
    this.dialog.closeAll();
    this.updateCreditCardDialogRef = this.dialog.open(dialogsMap['change-default-payment-card-dialog'], addPaymentCardDialogConfig);
    this.updateCreditCardDialogRef
      .afterClosed()
      .subscribe(result => {
        this.updateCreditCardDialogRef = null;
      });
    this.updateCreditCardDialogRef.componentInstance.onPaymentCardSelect.subscribe((card: any) => {
      this.getPaymentCards();
    });
  }

  viewInvoice() {
    this.popUpMessageService.showMessage(this.popUpMessageService.METHOD_NOT_IMPLEMENTED);
    throw new Error('Method not implemented.');
  }

  private getLeadZipFeature(lead: Lead | null): Observable<ZipFeature | null> {
    if (!lead || !lead.location.zip) {
      return of(null);
    }
    if (this.gMapUtils.zipBoundariesStore.has(lead.location.zip)) {
      const zipFeature = this.gMapUtils.zipBoundariesStore.get(lead.location.zip)!;
      return of(zipFeature);
    }
    return this.boundariesService.getZipBoundaries([lead.location.zip])
      .pipe(
        map(zipBoundaries => {
          if (zipBoundaries && zipBoundaries.features.length) {
            return zipBoundaries.features[0];
          }
          return null;
        })
      );
  }

  private clearCircle(): void {
    if (!this.mapCircle) {
      return;
    }
    this.mapCircle.setMap(null);
    this.mapCircle = null;
  }

  private getSimilarLeads(): void {
    this.leadService.getSimilarLeads(parseInt(this.leadUID)).pipe(
      first()
    ).subscribe(
      (similarLeads: Array<Lead>) => {
        if (similarLeads) {
          this.similarLeads = similarLeads;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

}
