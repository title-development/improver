import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Pagination, Review, ServiceType } from '../../../../model/data-model';
import { ReviewService } from '../../../../api/services/review.service';
import { ReviewRating } from '../../../../api/models/ReviewRating';
import { Company } from '../../../../api/models/Company';
import { CompanyService } from '../../../../api/services/company.service';
import { RestPage } from '../../../../api/models/RestPage';
import { CompanyAction } from '../../../../api/models/CompanyAction';
import { BillingService } from '../../../../api/services/billing.service';
import { Project } from '../../../../api/models/Project';
import { Billing } from "../../../../api/models/Billing";
import Transaction = Billing.Transaction;

@Component({
  selector: 'refund-log',
  templateUrl: './refund-log.component.html',
  styleUrls: ['./refund-log.component.scss']
})
export class RefundLogComponent {
  @Input() refundActions;

  constructor() {
  }

}
