import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CvSpinnerDirective } from './cv-spinner';
import { Component, SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('Cv Spinner', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        CvSpinnerDirective]
    });
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterAll(() => {
    fixture.destroy();
  });
  it('Should enable and disable spinner', () => {
    component.trigger = true;
    fixture.detectChanges();
    let el: HTMLElement = fixture.debugElement.query(By.directive(CvSpinnerDirective)).nativeElement;
    expect(el.children[0].classList).toContain('cv-spinner-holder');
    component.trigger = false;
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('div')).nativeElement;
    expect(el.children.length).toBe(0);
  });

  it('spinner should change size', () => {
    component.trigger = true;
    component.size = 100;
    fixture.detectChanges();
    const el: HTMLElement = fixture.debugElement.query(By.directive(CvSpinnerDirective)).nativeElement;
    expect((el.children[0].children[0] as HTMLElement).style.width).toBe('100px');
  });

});

@Component({
  selector: 'test',
  template: '<div [cvSpinner]="trigger" [cvSpinnerSize]="size"></div>'
})
class TestComponent {
  trigger = false;
  size = 20;
}
