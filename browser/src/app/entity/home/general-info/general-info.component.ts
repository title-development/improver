import { Component } from '@angular/core';

import { animate, state, style, transition, trigger } from "@angular/animations";

enum Position { Visible = "Visible", FromLeft = "FromLeft", FromRight = "FromRight", ToLeft = "ToLeft", ToRight = "ToRight", Invisible = "Invisible" }


@Component({
  selector: 'general-info',
  templateUrl: 'general-info.component.html',
  // animations: [
  //   trigger(
  //     'carouselAnimation', [
  //       transition(':enter', [
  //         style({transform: 'translateX(-100%)', opacity: 0}),
  //         animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
  //       ]),
  //       transition(':leave', [
  //         style({transform: 'translateX(0)', opacity: 1}),
  //         animate('500ms', style({transform: 'translateX(100%)', opacity: 0}))
  //       ])
  //     ]
  //   )
  // ],
  animations: [
    trigger(
      'carouselAnimation', [
        state('Visible', style({})),
        state('FromLeft', style({})),
        state('FromRight', style({})),
        state('ToLeft', style({display: "none"})),
        state('ToRight', style({display: "none"})),
        state('Invisible', style({display: "none"})),
        transition('* => ToRight', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('500ms', style({transform: 'translateX(100%)', opacity: 0}))
        ]),
        transition('* => FromLeft', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition('* => ToLeft', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('500ms', style({transform: 'translateX(-100%)', opacity: 0}))
        ]),
        transition('* => FromRight', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition('* => Visible', [
          style({ opacity: 0}),
          animate('300ms', style({ opacity: 1}))
        ]),
        transition('* => Invisible', [
          style({ opacity: 1}),
          animate('0ms', style({ opacity: 0}))
        ])
      ]
    )
  ],
  styleUrls: ['general-info.component.scss']
})


export class GeneralInfoComponent {

  testimonials = [
    {
      full_name: "Nico Funk 0",
      description: "Residence owner",
      state: "NY",
      text: "I have got problem with me pipe long time. But suddenly I heard about Home Improve and their. beautiful service. All I did is fil right fields and voila, in few days I got my Pipe fixed for vary reasonable price. I recommend Home Improve services to everybody and  definitely will. use it again."
    },
    {
      full_name: "Nico Funk 1",
      description: "Residence owner",
      state: "NY",
      text: "I have got problem with me pipe long time. But suddenly I heard about Home Improve and their. beautiful service. All I did is fil right fields and voila, in few days I got my Pipe fixed for vary reasonable price. I recommend Home Improve services to everybody and  definitely will. use it again."
    },
    {
      full_name: "Nico Funk 2",
      description: "Residence owner",
      state: "NY",
      text: "I have got problem with me pipe long time. But suddenly I heard about Home Improve and their. beautiful service. All I did is fil right fields and voila, in few days I got my Pipe fixed for vary reasonable price. I recommend Home Improve services to everybody and  definitely will. use it again."
    },
    {
      full_name: "Nico Funk 3",
      description: "Residence owner",
      state: "NY",
      text: "I have got problem with me pipe long time. But suddenly I heard about Home Improve and their. beautiful service. All I did is fil right fields and voila, in few days I got my Pipe fixed for vary reasonable price. I recommend Home Improve services to everybody and  definitely will. use it again."
    },
    {
      full_name: "Nico Funk 4",
      description: "Residence owner",
      state: "NY",
      text: "I have got problem with me pipe long time. But suddenly I heard about Home Improve and their. beautiful service. All I did is fil right fields and voila, in few days I got my Pipe fixed for vary reasonable price. I recommend Home Improve services to everybody and  definitely will. use it again."
    },
    {
      full_name: "Nico Funk 5",
      description: "Residence owner",
      state: "NY",
      text: "I have got problem with me pipe long time. But suddenly I heard about Home Improve and their. beautiful service. All I did is fil right fields and voila, in few days I got my Pipe fixed for vary reasonable price. I recommend Home Improve services to everybody and  definitely will. use it again."
    },
    {
      full_name: "Nico Funk 6",
      description: "Residence owner",
      state: "NY",
      text: "I have got problem with me pipe long time. But suddenly I heard about Home Improve and their. beautiful service. All I did is fil right fields and voila, in few days I got my Pipe fixed for vary reasonable price. I recommend Home Improve services to everybody and  definitely will. use it again."
    }
  ];

  public Position = Position;
  public right: boolean = true;
  positions: any;

  currentIndex = 0;

  constructor() {
    this.positions = Array(this.testimonials.length).fill(this.Position.Invisible);
    this.positions[0] = this.Position.Visible
  }

  moveForward() {
    this.currentIndex = this.incrementIndex(this.currentIndex, this.testimonials.length);
  }

  moveBackward() {
    this.currentIndex = this.decrementIndex(this.currentIndex, this.testimonials.length);
  }

  incrementIndex(index, length) {
    this.positions[index] = this.Position.ToRight;
    if (index < length - 1) {
      index++;
    } else {
      index = 0;
    }
    this.positions[index] = this.Position.FromLeft;
    return index;

  }

  decrementIndex(index, length) {
    this.positions[index] = this.Position.ToLeft;
    if (index != 0) {
      index--;
    } else {
      index = length - 1;
    }
    this.positions[index] = this.Position.FromRight;
    return index
  }

  setCurrentIndex(index) {
    this.positions[this.currentIndex] = this.Position.Invisible;
    this.currentIndex = index;
    this.positions[this.currentIndex] = this.Position.Visible;
  }




}




