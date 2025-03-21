import { Component } from '@angular/core';

import { animate, keyframes, style, transition, trigger } from "@angular/animations";
import { MediaQuery, MediaQueryService } from "../../../api/services/media-query.service";
import { clone } from "../../../util/functions";

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
  selector: 'general-info',
  templateUrl: 'general-info.component.html',
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
  styleUrls: ['general-info.component.scss']
})


export class GeneralInfoComponent {

  private readonly MOVING_LENGTH = 470;
  private readonly MOBILE_MOVING_LENGTH = 260;

  animating = false;
  transformX = 0;
  media: MediaQuery;
  testimonialsTitle: string = 'Why should you choose Home Improve?';

  testimonials = [
    {
      avatar: "assets/img/reviews/customers/1.jpg",
      fullName: "Inga Panast",
      description: "Residence owner",
      state: "NY",
      text: "I've had different services before, but this one beats them all. Home Improve made it so simple to find a reliable contractor for our bathroom renovation!"
    },
    {
      avatar: "assets/img/reviews/customers/2.jpg",
      fullName: "Stive Kitar",
      description: "Residence owner",
      state: "NY",
      text: "I highly recommend Home Improve Services. The service man was very polite, courteous, and professional."
    },
    {
      avatar: "assets/img/reviews/customers/3.jpg",
      fullName: "Victoria Deruvo",
      description: "Residence owner",
      state: "NY",
      text: "We decided to renovate our basement and had no clue where to start. Home Improve allowed us to find a contractor who offered all of the services we needed. We shared our job and found our contractor two days later!"
    },
    {
      avatar: "assets/img/reviews/customers/4.jpg",
      fullName: "Yelena Tyan",
      description: "Residence owner",
      state: "NY",
      text: "I was thrilled to find the Home Improve page when I was searching for a plumber. Great experience and very satisfied."
    },
    // {
    //   fullName: "Nico Funk 4",
    //   description: "Residence owner",
    //   state: "NY",
    //   text: "We searched high and low for someone to do some electrical work in our home. We had no luck until we tried Home Improve. We enjoyed the user interface and how simple it was to compare different electricians in our area. We will recommend the Home Improve platform to all of our friends and family members."
    // },
    // {
    //   fullName: "Nico Funk 5",
    //   description: "Residence owner",
    //   state: "NY",
    //   text: "My family needed a bedroom addition and could not find a local construction company we felt comfortable using. I am very pleased with Home Improve, the crew did an excellent job."
    // },
  ];

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




