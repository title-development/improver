import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Constants } from '../../util/constants';
import { SystemMessageType } from '../../model/data-model';
import { SecurityService } from '../../auth/security.service';
import { BillingService } from '../../api/services/billing.service';
import { NgForm } from '@angular/forms';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { Router } from "@angular/router";
import { SubscriptionActionsService } from "../../entity/contractor/subscription-actions/subscription-actions.service";
import { ProjectRequest } from '../../api/models/ProjectRequest';
import { Billing } from "../../api/models/Billing";
import BillingSubscription = Billing.LeadSubscription;
import {differenceInDays, parse, format} from "date-fns";

@Component({
  selector: 'subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})

export class SubscriptionComponent implements OnInit {

  MINIMAL_MONTHLY_BUDGET = 100;
  @Output() subscribe: EventEmitter<any> = new EventEmitter<any>();

  subscription: BillingSubscription;
  model = {
    nextMonthlyBudget: 0
  };
  submitForm = false;
  projectRequest: ProjectRequest;
  formErrors: boolean;
  @ViewChild('monthlyBudgetForm') form: NgForm;

  constructor(public constants: Constants,
              public router: Router,
              public subscriptionActionsService: SubscriptionActionsService,
              private billingService: BillingService,
              private securityService: SecurityService,
              private popupService: PopUpMessageService) {
    this.constants = constants;
  }

  ngOnInit(): void {
    this.getSubscription();
  }


  getSubscription(): void {
    this.billingService.getSubscription(this.securityService.getLoginModel().company).subscribe(
      subscription => {
        this.subscription = subscription;
        this.subscriptionActionsService.nextBillingDate = this.subscription.nextBillingDate ? this.subscription.nextBillingDate : new Date().toISOString();
      },
      err => {
        console.log(err);
      }
    );
  }

  formatSubsPeriod(start: string, end: string): string {
    let dateStart: Date = parse(start);
    let dateEnd: Date = parse(end);
    if (differenceInDays(dateEnd, dateStart) >= 1) {
      return format(dateStart, 'MM/DD/YYYY') + " - " + format(dateEnd, 'MM/DD/YYYY');
    } else {
      return format(dateStart, 'h:mm A') + " - " + format(dateEnd, 'h:mm A');
    }

  }


  setSubscriptionBudget(): void {
    if (this.model.nextMonthlyBudget == 0) {
      this.formErrors = true;
    }
    if (this.model.nextMonthlyBudget !== undefined && this.model.nextMonthlyBudget >= this.MINIMAL_MONTHLY_BUDGET) {
      this.subscriptionActionsService.subscriptionAmount = this.model.nextMonthlyBudget * 100; //convert to cents
      this.subscribe.emit();
      this.router.navigate(!this.subscription.active ? ['/pro/subscription-actions/new'] : ['/pro/subscription-actions/update'])
    } else {
      this.formErrors = true;
    }
  }


  unsubscribe(): void {
    this.router.navigate(['/pro/subscription-actions/cancel'])
  }

  validateBudget(): void {
    this.formErrors = this.model.nextMonthlyBudget && this.model.nextMonthlyBudget < 100;
  }

}
