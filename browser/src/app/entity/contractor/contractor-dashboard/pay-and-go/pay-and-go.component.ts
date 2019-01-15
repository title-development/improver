import { Component, Input, OnInit } from '@angular/core';
import { format } from "date-fns";
import { LeadsReport } from '../../../../api/models/LeadsReport';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'dashboard-pay-and-go',
  templateUrl: './pay-and-go.component.html',
  styleUrls: ['./pay-and-go.component.scss']
})
export class PayAndGoComponent implements OnInit {
  @Input() leadsReport: LeadsReport;

  constructor(private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    // this.leadsReport = this.route.snapshot.data['dashboard'];
  }

}
