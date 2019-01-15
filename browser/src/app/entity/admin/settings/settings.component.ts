import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class AdminSettingsComponent implements OnInit {
  title = "Settings";

  constructor() { }

  ngOnInit() {
  }

}
