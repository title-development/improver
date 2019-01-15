import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'level-progress-bar',
  templateUrl: './level-progress-bar.component.html',
  styleUrls: ['./level-progress-bar.component.scss'],
})

export class LevelProgressBarComponent implements OnInit {
  @Input() currentLevel: number;
  @Input() levelProgressAmount: number;
  @Input() currentLevelAmount: number;
  @Input() nextLevelAmount: number;
  @Input() currentLevelFee: number;
  @Input() nextLevelFee: number;
  progressPercentage: number;

  /**
   * Tooltip
   */
  public tooltipShow: boolean;
  public tooltipPositionLeft: string;
  constructor() {
  }

  ngOnInit() {
    this.progressPercentage = this.levelProgressAmount / this.nextLevelAmount * 100;
  }

  public showTooltip(e) {
    this.tooltipShow = true;
    let progressWidth = e.target.style.width;
    if(parseInt(progressWidth) > 95) {
      this.tooltipPositionLeft = "95%";
    } else if(parseInt(progressWidth) < 3) {
      this.tooltipPositionLeft = "2%";
    } else {
      this.tooltipPositionLeft = progressWidth;
    }

  }
  public hideTooltip(e) {
    this.tooltipShow = false;
  }
}
