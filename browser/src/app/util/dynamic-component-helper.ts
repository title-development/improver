import {
  ComponentFactoryResolver,
  Injectable,
  Inject,
  ReflectiveInjector, Component
} from '@angular/core'

@Injectable()
export class DynamicComponentHelper {

  factoryResolver;

  constructor(factoryResolver: ComponentFactoryResolver) {
    this.factoryResolver = factoryResolver
  }

  addDynamicComponent(rootViewContainer, DynamicComponent: Component) {
    let factory = this.factoryResolver
      .resolveComponentFactory(DynamicComponent);
    let component = factory
      .create(rootViewContainer.parentInjector);
    rootViewContainer.insert(component.hostView);
    return component;
  }

}
