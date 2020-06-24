import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CaptchaTrackingService {

  constructor() { }

  captchaDialogChange(): EventEmitter<any> {
    let captchaModalClosed: EventEmitter<any> = new EventEmitter();
    let recaptchaWindow;
    let observerConfig = {
      attributes: true,
      attributeFilter: ["style"]
    };
    let frames = Array.from(document.getElementsByTagName('iframe'));

    frames.forEach(captchaFrame => {
      if (captchaFrame && captchaFrame.src.includes('google.com/recaptcha/api2/bframe')) {
        recaptchaWindow = captchaFrame.parentNode.parentNode;
      }
    });

    new MutationObserver(() => {
      if (recaptchaWindow.style.opacity == 0 && !grecaptcha.getResponse()) {
        setTimeout(() => {
          captchaModalClosed.emit();
        }, 500);
      }
    }).observe(recaptchaWindow, observerConfig);

    return captchaModalClosed;
  }
}
