import { Component, OnInit } from '@angular/core';
import { Trade } from '../../../model/data-model';
import { CustomerSuggestionService } from "../../../api/services/customer-suggestion.service";
import { ProjectActionService } from "../../../api/services/project-action.service";
import { animate, keyframes, style, transition, trigger } from "@angular/animations";
import { clone } from "../../../util/functions";
import { MediaQuery, MediaQueryService } from "../../../api/services/media-query.service";

const animationDuration = 200;

let checkMovingRight = (fromState, toState) => {
  return (fromState != 0 && toState === 'void') || toState > fromState
};

let checkMovingLeft = (fromState, toState) => {
  return (fromState === 'void' && toState != 0) || toState < fromState
};

const moveRight = animate(animationDuration, keyframes([
  style({transform: 'translateX(-{{transformX}}px)', offset: 0}),
  style({transform: 'translateX(0px)', offset: 1}),
]));

const moveLeft = animate(animationDuration, keyframes([
  style({transform: 'translateX(0px)', offset: 0}),
  style({transform: 'translateX(-{{transformX}}px)', offset: 1})
]));

@Component({
  selector: 'advertisement-block',
  templateUrl: 'advertisement-block.component.html',
  styleUrls: ['advertisement-block.component.scss'],
  animations: [
    trigger('blockInitialRenderAnimation', [
      transition(':enter', [])
    ]),
    trigger('animator', [
      transition('void => 0', animate(animationDuration, keyframes([
        style({opacity: '0', transform: 'scale3d(0.3, 0.3, 0.3)', offset: 0}),
        style({opacity: '1', transform: 'scale3d(0.6, 0.6, 0.6)', offset: 0.5}),
        style({opacity: '1', transform: 'scale3d(1, 1, 1)', offset: 1})
      ]))),
      transition('0 => void', animate(animationDuration, keyframes([
        style({opacity: '1', transform: 'scale3d(1, 1, 1)', offset: 0}),
        style({opacity: '1', transform: 'scale3d(0.6, 0.6, 0.6)', offset: 0.5}),
        style({opacity: '0', transform: 'scale3d(0.3, 0.3, 0.3)', offset: 1})
      ])),),

      transition(checkMovingRight, moveRight),
      transition(checkMovingLeft, moveLeft),

    ])
  ]
})
export class AdvertisementBlockComponent implements OnInit {

  private readonly MOVING_LENGTH = 420;
  private readonly MOBILE_MOVING_LENGTH = 310;

  items: Array<Trade> = [];
  animating = false;
  transformX = 0;
  media: MediaQuery;
  mobileHoverActive = false;

  constructor(private customerSuggestionService: CustomerSuggestionService,
              public projectActionService: ProjectActionService,
              public mediaQueryService: MediaQueryService) {

    this.customerSuggestionService.suggestedTradesSize = 10;
    this.customerSuggestionService.suggestedTrades$
      .subscribe((items: Array<Trade>) => {
          this.items = items;
        });

    this.subscribeForMediaScreen();
  }

  ngOnInit(): void {
  }

  subscribeForMediaScreen(){
    this.mediaQueryService.screen.subscribe(media => {
      this.media = media;
      this.transformX = media.xs || media.sm ? this.MOBILE_MOVING_LENGTH : this.MOVING_LENGTH;
    })
  }

  moveRight() {
    if (!this.animating) {
      this.animating = true;
      this.items.unshift(clone(this.items.pop()));
    }
  }

  moveLeft() {
    if (!this.animating) {
      this.animating = true;
      this.items.push(clone(this.items.shift()));
    }
  }

  animationDone(event) {
    this.animating = false;
    this.mobileHoverActive = false;
  }

  showServicesList() {
    this.mobileHoverActive = !this.mobileHoverActive;
    if (!this.mobileHoverActive){
      this.animating = false;
    }
  }
}
