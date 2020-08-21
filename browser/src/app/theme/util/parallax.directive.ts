import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
	selector: '[appParallax]'
})
export class ParallaxDirective {

	@Input() parallaxRatio: number = 1;
	@Input() onlyMobileScreen: boolean = false;
	initialTop: number = 0;

	constructor(private eleRef: ElementRef,
							private changeDetectorRef: ChangeDetectorRef) {
		this.initialTop = this.eleRef.nativeElement.getBoundingClientRect().top;
	}

	@HostListener("window:scroll", ["$event"])
	onWindowScroll(event) {
		console.log(this.onlyMobileScreen);
		if (this.onlyMobileScreen) {
			this.eleRef.nativeElement.style.top = (this.initialTop - (window.scrollY * this.parallaxRatio)) + 'px';
		} else {
			this.eleRef.nativeElement.style.top = 0;
		}
	}

}
