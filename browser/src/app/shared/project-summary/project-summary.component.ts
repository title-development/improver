import { Component, Input, OnInit } from '@angular/core';
import { SecurityService } from "../../auth/security.service";
import { Location } from '../../model/data-model';

@Component({
  selector: 'project-summary',
  templateUrl: './project-summary.component.html',
  styleUrls: ['./project-summary.component.scss']
})
export class ProjectSummaryComponent implements OnInit {

  @Input() phone: string
  @Input() projectLocation: Location
  @Input() startExpectation: string
  @Input() notes: string
  @Input() questionaryAnswers: any[]

  constructor(public securityService: SecurityService) { }

  ngOnInit(): void {
  }

}
