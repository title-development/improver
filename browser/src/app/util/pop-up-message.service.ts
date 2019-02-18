import {
  ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Inject, Injectable, Injector, NgModuleRef,
  Renderer2,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { PopUpMessage, SystemMessageType } from "../model/data-model";
import { PopUpMessageContainerComponent } from '../shared/pop-up-message/pop-up-message-container/pop-up-message-container.component';

@Injectable()
export class PopUpMessageService {

  public readonly DEFAULT_TIMEOUT = 7000;
  public readonly DEFAULT_ERROR_TIMEOUT = 10000;

  public readonly METHOD_NOT_IMPLEMENTED: PopUpMessage = {
    text: "Method not implemented.",
    type: SystemMessageType.ERROR,
    timeout: this.DEFAULT_ERROR_TIMEOUT
  };

  public readonly UNKNOWN_ERROR: PopUpMessage = {
    text: "Unknown error",
    type: SystemMessageType.ERROR,
    timeout: this.DEFAULT_ERROR_TIMEOUT
  };

  private defaultConfig: PopUpMessage = {
    text: 'Message',
    type: SystemMessageType.INFO,
    timeout: this.DEFAULT_TIMEOUT
  };

  public readonly SERVICE_UNAVAILABLE: PopUpMessage = {
    text: "Server is unavailable. Please try again in a while.",
    type: SystemMessageType.ERROR,
    timeout: this.DEFAULT_ERROR_TIMEOUT
  };

  public readonly INTERNAL_SERVER_ERROR: PopUpMessage = {
    text: "Oops! Unexpected error. Please try again in a while. If you seeing this not the first time please, contact Service Support",
    type: SystemMessageType.ERROR,
    timeout: this.DEFAULT_ERROR_TIMEOUT
  };

  private initialized = false;
  private containerRef: ComponentRef<any>;
  public renderer: Renderer2;
  public serviceUnavailableMessageId = null;
  public internalServerErrorId = null;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private appRef: ApplicationRef,
              private injector: Injector,
              @Inject(DOCUMENT) private document: any) {
  }

  private appendComponentToElement(component: any, parentElement: any) {

    // Create a component reference from the component
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);

    // Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(componentRef.hostView);

    // Get DOM element from component
    const newElement = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;
    this.renderer.appendChild(parentElement, newElement);
    return componentRef;
  }

  init() {
    this.containerRef = this.appendComponentToElement(PopUpMessageContainerComponent, this.document.body);
    this.containerRef.instance.onMessageDestroy.subscribe(
      this.messageDestroy
    );
    return true;
  }

  messageDestroy = (id) => {
    if (this.serviceUnavailableMessageId == id) {
      this.serviceUnavailableMessageId = null;
    }
  };

  mergeConfig(config: PopUpMessage) {
    return {
      text: config.text || this.defaultConfig.text,
      type: config.type || this.defaultConfig.type,
      timeout: config.timeout || this.defaultConfig.timeout
    }
  }

  public showMessage(config: PopUpMessage) {
    this.initialized = !this.initialized ? this.init() : true;
    config = this.mergeConfig(config);
    this.containerRef.instance.addMessage(config);
  }

  public showError(text: string, timeout: number = this.DEFAULT_ERROR_TIMEOUT) {
    this.initialized = !this.initialized ? this.init() : true;
    let config: PopUpMessage = {
      type: SystemMessageType.ERROR,
      text: text,
      timeout: timeout
    };
    config = this.mergeConfig(config);
    this.containerRef.instance.addMessage(config);
  }

  public showSuccess(text: string, timeout: number = this.DEFAULT_TIMEOUT) {
    this.initialized = !this.initialized ? this.init() : true;
    let config: PopUpMessage = {
      type: SystemMessageType.SUCCESS,
      text: text,
      timeout: timeout
    };
    config = this.mergeConfig(config);
    this.containerRef.instance.addMessage(config);
  }

  public showInfo(text: string, timeout: number = this.DEFAULT_TIMEOUT) {
    this.initialized = !this.initialized ? this.init() : true;
    let config: PopUpMessage = {
      type: SystemMessageType.INFO,
      text: text,
      timeout: timeout
    };
    config = this.mergeConfig(config);
    this.containerRef.instance.addMessage(config);
  }

  public showWarning(text: string, timeout: number = this.DEFAULT_TIMEOUT) {
    this.initialized = !this.initialized ? this.init() : true;
    let config: PopUpMessage = {
      type: SystemMessageType.WARN,
      text: text,
      timeout: timeout
    };
    config = this.mergeConfig(config);
    this.containerRef.instance.addMessage(config);
  }

  public showMethodNotImplemented() {
    this.initialized = !this.initialized ? this.init() : true;
    let config = this.METHOD_NOT_IMPLEMENTED;
    this.containerRef.instance.addMessage(config);
  }

  public showServiceUnavailable(config: PopUpMessage = this.SERVICE_UNAVAILABLE) {
    if ( this.serviceUnavailableMessageId != null) {
      this.containerRef.instance.getMessage(this.serviceUnavailableMessageId) .clearTimeout();
      return
    }
    this.initialized = !this.initialized ? this.init() : true;
    this.serviceUnavailableMessageId = this.containerRef.instance.addMessage(config);
  }

  public showInternalServerError(config: PopUpMessage = this.INTERNAL_SERVER_ERROR) {
    if ( this.internalServerErrorId != null) {
      this.containerRef.instance.getMessage(this.internalServerErrorId) .clearTimeout();
      return
    }
    this.initialized = !this.initialized ? this.init() : true;
    this.internalServerErrorId = this.containerRef.instance.addMessage(config);
  }

}
