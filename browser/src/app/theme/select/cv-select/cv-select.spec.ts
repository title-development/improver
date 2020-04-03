import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CvSelectComponent } from './cv-select';
import { FormsModule } from '@angular/forms';
import { OverlayRef } from '../../util/overlayRef';
import { By } from '@angular/platform-browser';

const strings = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8'];
const objects = [
  {id: 1, value: 'value 1', name: 'name 1'},
  {id: 2, value: 'value 2', name: 'name 2'},
  {id: 3, value: 'value 3', name: 'name 3'},
  {id: 4, value: 'value 4', name: 'name 4'},
  {id: 5, value: 'value 5', name: 'name 5'},
  {id: 6, value: 'value 6', name: 'name 6'},
  {id: 7, value: 'value 7', name: 'name 7'}
];
const groupObjects = [
  {
    label: 'group1',
    content: [
      {id: 1, value: 'value 1', name: 'name 1'},
      {id: 2, value: 'value 2', name: 'name 2'},
      {id: 3, value: 'value 3', name: 'name 3'},
      {id: 4, value: 'value 4', name: 'name 4'},
      {id: 5, value: 'value 5', name: 'name 5'},
      {id: 6, value: 'value 6', name: 'name 6'},
      {id: 7, value: 'value 7', name: 'name 7'}
    ]
  },
  {
    label: 'group2',
    content: [
      {id: 8, value: 'value 8', name: 'name 8'},
      {id: 9, value: 'value 9', name: 'name 9'},
      {id: 10, value: 'value 10', name: 'name 10'},
      {id: 11, value: 'value 11', name: 'name 11'},
      {id: 12, value: 'value 12', name: 'name 12'},
      {id: 13, value: 'value 13', name: 'name 13'},
      {id: 14, value: 'value 14', name: 'name 14'}
    ]
  }
];
const groupStrings = [
  {
    label: 'group1',
    content: ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8']
  },
  {
    label: 'group2',
    content: ['item9', 'item10', 'item11', 'item12', 'item13', 'item14', 'item15', 'item16']
  }
];

describe('Cv select component', () => {
  let fixture: ComponentFixture<CvSelectComponent>;
  let component: CvSelectComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CvSelectComponent],
      providers: [
        OverlayRef,
        {provide: 'Window', useValue: window}
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CvSelectComponent);
    component = fixture.componentInstance;
  });
});

describe('Init', () => {
  let fixture: ComponentFixture<CvSelectComponent>;
  let component: CvSelectComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CvSelectComponent],
      providers: [
        OverlayRef,
        {provide: 'Window', useValue: window}
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(CvSelectComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    component = null;
  });

  it('Item match has to be disabled', () => {
    component.items = strings;
    component.disableItemsMatch = true;
    component.init('item1');
    expect(component.selectedLabel).toEqual(undefined);
  });

  it('Should fill search if model object', () => {
    component.items = objects;
    component.disableItemsMatch = true;
    component.labelKey = 'name';
    component.init({id: 4, value: 'value 4', name: 'name 4'});
    expect(component.search).toEqual('name 4');
  });

  /**
   * Model: Object, Items: Array<{label: string, content: Array<Object>}>
   */
  describe('Groped', () => {
    it('model: Object, items: Array<{label: string, content: Array<Object>}', () => {
      component.items = groupObjects;
      component.grouped = true;
      component.init({id: 12, value: 'value 12', name: 'name 12'});
      expect(component.selectedLabel as any).toEqual({id: 12, value: 'value 12', name: 'name 12'} as any);
    });

    it('model: Object, items: Array<{label: string, content: Array<Object>}', () => {
      component.items = groupObjects;
      component.grouped = true;
      component.labelKey = 'name';
      component.init({id: 12, value: 'value 12', name: 'name 12'});
      expect(component.selectedLabel).toBe('name 12');
    });
  });

  /**
   * Model: Object, Items: Array<Object>
   */
  describe('Model Object', () => {
    it('model: Object, items: Array<Object>', () => {
      component.items = objects;
      component.init({id: 2, value: 'value 2', name: 'name 2'});
      expect(component.selectedLabel as any).toEqual({id: 2, value: 'value 2', name: 'name 2'} as any);
    });

    it('model: Object, items: Array<Object>', () => {
      component.items = objects;
      component.labelKey = 'name';
      component.init({id: 2, value: 'value 2', name: 'name 2'});
      expect(component.selectedLabel).toBe('name 2');
    });

    it('model: Object, items: Array<Object>', () => {
      component.items = objects;
      component.valueKey = 'id';
      component.init({id: 2, value: 'value 2', name: 'name 2'});
      expect(component.selectedLabel as any).toEqual({id: 2, value: 'value 2', name: 'name 2'} as any);
    });

    it('model: Object, items: Array<Object>', () => {
      component.items = objects;
      component.labelKey = 'name';
      component.valueKey = 'id';
      component.init({id: 2, value: 'value 2', name: 'name 2'});
      expect(component.selectedLabel).toBe('name 2');
    });

    it('model: Object, items: Array<Sring>', () => {
      component.items = strings;
      component.init({id: 2, value: 'value 2', name: 'name 2'});
      expect(component.selectedLabel).toEqual(undefined);
    });

    it('model: Object, items: Array<Sring>', () => {
      component.items = strings;
      component.labelKey = 'name';
      component.init({id: 2, value: 'value 2', name: 'name 2'});
      expect(component.selectedLabel).toEqual(undefined);
    });

    it('model: Object, items: Array<Sring>', () => {
      component.items = strings;
      component.valueKey = 'id';
      component.init({id: 2, value: 'value 2', name: 'name 2'});
      expect(component.selectedLabel).toEqual(undefined);
    });

    it('model: Object, items: Array<Sring>', () => {
      component.items = strings;
      component.labelKey = 'name';
      component.valueKey = 'id';
      component.init({id: 2, value: 'value 2', name: 'name 2'});
      expect(component.selectedLabel).toEqual(undefined);
    });

  });

  /**
   * Model string or number
   */
  describe('Model String or number', () => {
    it('model: string, items: Array<String>', () => {
      component.items = strings;
      component.init('item1');
      expect(component.selectedLabel).toBe('item1');
    });

    it('model: number, items: Array<Object>', () => {
      component.items = objects;
      component.init(1);
      expect(component.selectedLabel).toEqual(undefined);
    });

    it('model: number, items: Array<Object>', () => {
      component.items = objects;
      component.valueKey = 'id';
      component.init(1);
      expect(component.selectedLabel as any).toEqual({id: 1, value: 'value 1', name: 'name 1'} as any);
    });

    it('model: number, items: Array<Object>', () => {
      component.items = objects;
      component.valueKey = 'id';
      component.labelKey = 'name';
      component.init(1);
      expect(component.selectedLabel).toBe('name 1');
    });
  });

  /**
   * Model array of strings or numbers
   */
  describe('Model array of strings or numbers', () => {
    it('model: Array<String>, items: Array<String>', () => {
      component.items = strings;
      component.init(['item1']);
      expect(component.getSelectedTags()).toEqual(['item1']);
    });

    it('model: Array<String>, items: Array<String>', () => {
      component.items = strings;
      component.init(['item1', 'item3']);
      expect(component.getSelectedTags()).toEqual(['item1', 'item3']);
    });

    it('model: Array<String>, items: Array<String>', () => {
      component.items = strings;
      component.init(['item1', 'item3']);
      expect(component.selectedItemsCount).toBe(2);
    });

    it('model: Array<String>, items: Array<Object>', () => {
      component.items = objects;
      component.valueKey = 'id';
      component.init([7]);
      expect(component.getSelectedTags()).toEqual([{id: 7, value: 'value 7', name: 'name 7'}]);
    });

    it('model: Array<String>, items: Array<Object>', () => {
      component.items = objects;
      component.init([7]);
      expect(component.getSelectedTags()).toEqual([]);
    });

    it('model: Array<Object>, items: Array<Object>', () => {
      component.items = objects;
      component.valueKey = 'id';
      component.init([{id: 7, value: 'value 7', name: 'name 7'}]);
      expect(component.getSelectedTags()).toEqual([{id: 7, value: 'value 7', name: 'name 7'}]);
    });
  });
});

describe('panel toggling', () => {
  let fixture: ComponentFixture<CvSelectComponent>;
  let component: CvSelectComponent;
  let overlayRef: OverlayRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CvSelectComponent],
      providers: [
        OverlayRef,
        {provide: 'Window', useValue: window}
      ]
    });
    fixture = TestBed.createComponent(CvSelectComponent);
    overlayRef = TestBed.get(OverlayRef);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should open the dropDown', () => {
    let elem = fixture.debugElement.query(By.css('.select-open')).nativeElement;
    // elem.dispatchEvent(new Event('click'));
    // fixture.detectChanges();
    // fixture.detectChanges();
  });
});

