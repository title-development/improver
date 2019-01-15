import { ApplicationRef, Component, NgModule } from '@angular/core';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { CvSelectComponent } from '../select/cv-select/cv-select'
import { BackdropType, OverlayRef } from './overlayRef';

describe('overlay Ref', () => {
  let service: OverlayRef;
  let appRef: ApplicationRef;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        OverlayRef,
          ApplicationRef,
        {provide: 'Window', useValue: window}
      ]
    });
    const testbed = getTestBed();
    service = testbed.get(OverlayRef);
    appRef = testbed.get(ApplicationRef);
  }));

  it('should create overlay if not isSelected', () => {
    const overlay: HTMLElement = service.getOverlay();
    const el = document.getElementById('cv-popup-overlay');
    expect(overlay != null).toBeTruthy();
    expect(el != null).toBeTruthy();
  });

  it('should return direction', () => {
    const element = document.createElement('div');
    const direction = service.isUpDirection(element);
    expect(direction).toBe(false);
  });

  it('should create and remove backdrop', () => {
    const element = document.createElement('div');
    const holder = service.createBackdrop(BackdropType.menu, element);
    let backdrop = service.getBackdrop();
    expect(backdrop.children[0]).toEqual(holder);
    const overlay = service.getOverlay();
    backdrop.parentNode.removeChild(backdrop);
    backdrop = service.getBackdrop();
    expect(backdrop == null).toBeTruthy();
  });

  it('should append component to the holder and destroy them', () => {
    const element = document.createElement('div');
    const holder = service.createBackdrop(BackdropType.menu, element);
    const componentRef = service.appendComponentToElement<TestComponent>(TestComponent, holder);
    appRef.tick();
    let backdrop = service.getBackdrop();
    expect(backdrop.innerHTML).toContain('hello world!');
    service.removeBackdrop();
    backdrop = service.getBackdrop();
    expect(backdrop == null).toBeTruthy();
  });

});

@Component({
  selector: 'test-compennt',
  template: `<h1>{{title}}</h1>`,
  styles: []
})
export class TestComponent {
  title = 'hello world!';
}

@NgModule({
  declarations: [TestComponent],
  exports: [TestComponent],
  entryComponents: [TestComponent]
})
export class TestModule {

}
