import { HammerGestureConfig } from "@angular/platform-browser";
import { Injectable } from "@angular/core";

declare var Hammer: any;

@Injectable()
export class HammerConfig extends HammerGestureConfig {
	overrides = <any>{
		swipe: {
			direction: Hammer.DIRECTION_ALL,
		}
	}

  buildHammer(element: HTMLElement) {
    let mc = new Hammer(element, {
      touchAction: "pan-y",
    });
    return mc;
  }
}
