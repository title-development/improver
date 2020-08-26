import { Component, OnInit } from '@angular/core';
import {SecurityService} from "../../../../../auth/security.service";

@Component({
  selector: 'admin-info',
  templateUrl: './admin-info.component.html',
  styleUrls: ['./admin-info.component.scss']
})
export class AdminInfoComponent implements OnInit {

  constructor(public securityService: SecurityService) { }

  ngOnInit() {
  }

}
