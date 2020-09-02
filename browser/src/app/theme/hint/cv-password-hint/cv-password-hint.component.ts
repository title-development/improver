import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
	Optional,
	Renderer2,
	SkipSelf
} from '@angular/core';
import { ControlContainer, NgForm, NgModel } from "@angular/forms";
import { Constants } from "../../../util/constants";
import { TextMessages } from "../../../util/text-messages";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
	selector: 'cv-password-hint',
	templateUrl: './cv-password-hint.component.html',
	styleUrls: ['./cv-password-hint.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('openHints', [
			state('active', style({transform: 'translateX(0)', opacity: '1'})),
			state('inactive', style({transform: 'translateY(-70px)', opacity: '0', height: '0'})),
			transition('* <=> *', animate('.25s linear'))
		])
	]
})
export class CvPasswordHintComponent implements OnInit, AfterViewInit, OnDestroy {

	@Input() isComplexPassword: boolean = false;
	@Input() alwaysVisible: boolean = false;
	@Input() checkedInputRef: any;
	minLength: boolean = false;
	letter: boolean = false;
	lowercase: boolean = false;
	uppercase: boolean = false;
	number: boolean = false;
	specialChar: boolean = false;
	isFormSubmitted: boolean = false;
	hasError: boolean = false;
	focusListener: () => void;
	inputHasFocus: boolean = false;
	animationState: string = 'inactive';

	validationStatus: PasswordStatus;

	constructor(public constants: Constants,
							public messages: TextMessages,
							private changeDetectorRef: ChangeDetectorRef,
							private renderer: Renderer2,
							@Optional() @SkipSelf() private controlContainer: ControlContainer) {

	}

	ngOnInit(): void {
	}

	ngAfterViewInit(): void {
		this.addFocusEventListener();
		this.subscribeOnFormSubmit();
		this.subscribeOnPasswordChanges();
		this.checkPasswordValidationStatus();
	}

	private addFocusEventListener() {
		this.focusListener = this.renderer.listen(this.checkedInputRef.elementRef.nativeElement, 'focus', (event) => {
			this.inputHasFocus = true;
			this.animationState = 'active';
			this.renderer.setStyle(this.checkedInputRef.elementRef.nativeElement.offsetParent, 'z-index', '10');
			this.changeDetectorRef.detectChanges();
		});

		this.focusListener = this.renderer.listen(this.checkedInputRef.elementRef.nativeElement, 'focusout', (event) => {
			this.inputHasFocus = false;
			if (!this.checkedInputRef.ngControl.control.errors) {
				this.animationState = 'inactive';
			}
			this.renderer.setStyle(this.checkedInputRef.elementRef.nativeElement.offsetParent, 'z-index', '10');
			this.changeDetectorRef.detectChanges();
		});

		this.focusListener = this.renderer.listen(this.checkedInputRef.elementRef.nativeElement, '', (event) => {
		})

	}

	private subscribeOnPasswordChanges() {
		(this.checkedInputRef.ngControl as NgModel).valueChanges.subscribe(password => {
			this.validate(password);
			this.changeDetectorRef.detectChanges();
		});
	}

	private checkPasswordValidationStatus() {
		(this.checkedInputRef.ngControl as NgModel).statusChanges.subscribe(status => {
			this.validationStatus = status;
			this.changeDetectorRef.detectChanges();
		});
	}

	private subscribeOnFormSubmit() {
		if (this.controlContainer && (this.controlContainer as NgForm).ngSubmit) {
			(this.controlContainer as any).ngSubmit.subscribe(() => {
				this.isFormSubmitted = true;
				this.changeDetectorRef.detectChanges();
			})
		}
	}

	private validate(password: string) {
		if (!password || password == '') {
			this.resetValidator();
			return;
		}

		let errors = [];

		let minLengthRegex = new RegExp(this.constants.patterns.minLength);
		this.minLength = minLengthRegex.test(password);
		errors.push(this.minLength);

		const letterRegex = new RegExp(this.constants.patterns.letter);
		this.letter = letterRegex.test(password);
		errors.push(this.letter);

		let lowercaseRegex = new RegExp(this.constants.patterns.lowercase);
		this.lowercase = lowercaseRegex.test(password);
		errors.push(this.lowercase);

		const uppercaseRegex = new RegExp(this.constants.patterns.uppercase);
		this.uppercase = uppercaseRegex.test(password);
		errors.push(this.uppercase);

		const numberRegex = new RegExp(this.constants.patterns.number);
		this.number = numberRegex.test(password);
		errors.push(this.number);

		const specialCharRegex = new RegExp(this.constants.patterns.specialCharacter);
		this.specialChar = specialCharRegex.test(password);
		errors.push(this.specialChar);

		this.hasError = !errors.every(e => e == true);
		this.changeDetectorRef.detectChanges();
	}

	private resetValidator() {
		this.minLength = false;
		this.letter = false;
		this.lowercase = false;
		this.uppercase = false;
		this.specialChar = false;
		this.number = false;
		this.hasError = false;
	}

	ngOnDestroy(): void {
		this.focusListener;
	}

}

export enum PasswordStatus {
	VALID = 'VALID',
	INVALID = 'INVALID'
}
