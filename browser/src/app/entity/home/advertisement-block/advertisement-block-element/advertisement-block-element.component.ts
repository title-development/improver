import { Component, Input, OnInit } from '@angular/core';
import { Trade } from "../../../../model/data-model";
import { ProjectActionService } from "../../../../util/project-action.service";

@Component({
  selector: 'advertisement-block-element',
  templateUrl: './advertisement-block-element.component.html',
  styleUrls: ['./advertisement-block-element.component.scss'],

})
export class AdvertisementBlockElementComponent implements OnInit {
  SERVICES_TO_SHOW_COUNT = 4;

  @Input() item: Trade;

  constructor(public projectActionService: ProjectActionService) {
  }

  ngOnInit(): void {
  }


}
