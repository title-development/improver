import { Component, OnInit } from '@angular/core';
import { LeadService } from '../../../api/services/lead.service'
import { SecurityService } from '../../../auth/security.service';
import { LeadsReport } from '../../../api/models/LeadsReport';
import { BillingService } from '../../../api/services/billing.service';
import { Lead, Pagination, ShortLead } from '../../../model/data-model';
import { RestPage } from '../../../api/models/RestPage';

@Component({
  selector: 'contractor-dashboard-page',
  templateUrl: './contractor-dashboard.component.html',
  styleUrls: [ './contractor-dashboard.component.scss' ],
})

export class ContractorDashboardComponent implements OnInit {
  leads: RestPage<ShortLead>;
  leadsReport: LeadsReport;
  contractor = {
    id: null,
    name: ""
  };

  constructor(private billingService: BillingService, private securityService: SecurityService, private leadService: LeadService) {

    this.billingService.getLeadsReport(this.securityService.getLoginModel().company).subscribe(leadsReport => {
      this.leadsReport = leadsReport;
    });
  }

  ngOnInit(): void {
    this.getContractorInfo();
    this.getLeads();
  }

  getLeads(): void {
    const pagination: Pagination = new Pagination(0,5);
    this.leadService.getAll(null, pagination).subscribe((leads: RestPage<ShortLead>) => {
      this.leads = leads;
    });
  }

  getContractorInfo(): void {
    let { id, name } = this.securityService.getLoginModel();

    this.contractor.id = id;
    this.contractor.name = name;
  }
}
