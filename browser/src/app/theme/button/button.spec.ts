import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { CvButtonComponent } from './cv-button/cv-button.component'

describe('CvButtonComponent', () => {
  let fixture: ComponentFixture<CvButtonComponent>;
  let component: CvButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CvButtonComponent]
    });
    fixture = TestBed.createComponent(CvButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should has large class', () => {
    component.ngOnChanges({
      size: new SimpleChange(null, 'large', true)
    });
    let elem = fixture.nativeElement;
    expect(elem.classList).toContain('-large');
  });

  it('should change size', () => {
    component.ngOnChanges({
      size: new SimpleChange(null, 'large', true)
    });
    let elem = fixture.nativeElement;
    expect(elem.classList).toContain('-large');
    component.ngOnChanges({
      size: new SimpleChange(null, 'small', true)
    });
    elem = fixture.nativeElement;
    expect(elem.classList).toContain('-small');
  });
});
