import { Component, Input } from '@angular/core';
import { animate, keyframes, style, transition, trigger } from "@angular/animations";
import { MediaQuery, MediaQueryService } from "../../util/media-query.service";
import { clone } from "../../util/functions";

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
  selector: 'testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
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
  ],
})
export class TestimonialsComponent {

  private readonly MOVING_LENGTH = 470;
  private readonly MOBILE_MOVING_LENGTH = 260;

  @Input()
  testimonials = [];

  animating = false;
  transformX = 0;
  media: MediaQuery;

  constructor(public mediaQueryService: MediaQueryService) {

    this.mediaQueryService.screen.subscribe(media => {
      this.media = media;
      this.transformX = media.xs || media.sm ? this.MOBILE_MOVING_LENGTH : this.MOVING_LENGTH;
    })

  }

  moveRight() {
    if (!this.animating) {
      this.animating = true;
      this.testimonials.unshift(clone(this.testimonials.pop()));
    }
  }

  moveLeft() {
    if (!this.animating) {
      this.animating = true;
      this.testimonials.push(clone(this.testimonials.shift()));
    }
  }

  animationDone(event) {
    this.animating = false;
  }

}
