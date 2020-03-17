import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  forwardRef, HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Provider,
  Renderer2,
  SkipSelf,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayRef } from '../../util/overlayRef';
import { ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { CvSelection } from '../../util/CvSelection';
import { CdkVirtualForOf, CdkVirtualForOfContext, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MediaQuery, MediaQueryService } from '../../../util/media-query.service';

export const SELECT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CvSelectComponent),
  multi: true
};

export const enum ItemMinHeight {
  xs = 38,
  sm = 43,
  other = 46
}

@Component({
  selector: 'cv-select',
  templateUrl: './cv-select.html',
  styleUrls: ['./cv-select.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'cv-select',
    '[class.-submitted]': 'isSubmitted()',
    '[class.-show-errors]': 'highlightErrors',
    '[class.-required]': 'isRequired()',
    '[class.-disabled]': 'disabled',
    '[class.-readonly]': 'readonly',
  },
  animations: [
    trigger('dropDownAnimationState', [
      state('void', style({height: 0, transform: 'scale(1,0) translateZ(0)'})),
      state('closed', style({height: 0, transform: 'scale(1,0) translateZ(0)'})),
      state('opened', style({height: '100%', transform: 'scale(1,1) translateZ(0)'})),
      transition('closed => opened', animate('150ms ease-in')),
      transition('opened => void', animate('150ms ease-out'))
    ])
  ],
  providers: [
    SELECT_VALUE_ACCESSOR
  ]
})
export class CvSelectComponent extends CvSelection implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() required;
  @Input() highlightErrors: boolean = true;
  @Input() items: Array<any>;
  @Input() grouped: boolean = false;
  @Input() groupLabelKey: string = 'label';
  @Input() groupContentKey: string = 'content';
  @Input() multiple: boolean = false;
  @Input() maxSelectedItems: number = 0;
  @Input() label: string = 'Choose item';
  @Input('dropdownBorder') border: boolean = true;
  @Input() labelKey: string;
  @Input() typeKey: string;
  @Input() valueKey: string;
  @Input() readonly: boolean;
  @Input() tags: boolean;
  @Input() autocomplete: boolean;
  @Input() allowAnyValue: boolean = false;
  @Input() hint: string = 'Type something to search';
  @Input() trackBy: (index: number, item: any) => {};
  @Input() disableItemsMatch: boolean = false;
  @Input() propagateEnterEvent: boolean = false;
  @Input() dropdownHeight: number;
  @Output() autocompleteSearch: EventEmitter<string | number> = new EventEmitter<string | number>();
  @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('targetElement') targetElement: ElementRef;
  @ViewChild('itemsHolder') itemsHolder: ElementRef;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;

  private readonly destroyed$ = new Subject<void>();

  disabled: boolean;
  selectedItemsCount: number = 0;
  search: string | number;
  originalSearchTerm: string;
  activateOriginalSearchTerm: boolean = false;
  filterArgs: any;
  multipleSearchModel: string | number;
  opened: boolean;
  selectedLabel: string;

  dropDownAnimationState: string | 'void' | 'closed' | 'opened' = 'closed';
  isItemsShowed: boolean = false;
  itemMinHeight: number = ItemMinHeight.other;

  itemFontSize: number;

  private onOverlayClick = (event: MouseEvent) => this.closeByOverlayHandler(event);
  // private onMouseLeave = (event: MouseEvent) => this.closeDropdown(event);
  private onKeyDown = (event: KeyboardEvent) => this.onKeyDownHandler(event);
  private highlightedItemIndex: number = -1;
  private lastLabel: string;
  private hostHeight: number;
  private itemHeight: number;
  private itemPerHost: number;

  mediaQuery: MediaQuery;

  constructor(@Inject(DOCUMENT) private document: any,
              private renderer: Renderer2,
              public overlayRef: OverlayRef,
              @Optional() @SkipSelf() private form: NgForm,
              @Optional() @SkipSelf() private controlContainer: ControlContainer,
              private changeDetectorRef: ChangeDetectorRef,
              private query: MediaQueryService) {
    super();
    this.query.screen.pipe(
      takeUntil(this.destroyed$),
      distinctUntilChanged()
    ).subscribe((res: MediaQuery) => {
      if(res.xs) {
        this.itemMinHeight = ItemMinHeight.xs;
      } else if (res.sm) {
        this.itemMinHeight = ItemMinHeight.sm;
      }
      this.mediaQuery = res;
    });

    if (this.controlContainer && (this.controlContainer as NgForm).ngSubmit) {
      (this.controlContainer as any).ngSubmit.subscribe(() => {
        this.overlayRef.closeDropDown(this.overlayRef.getBackdrop());
      })
    }

  }

  @HostListener('ngModelChange', ['$event']) onModelChange(value: any) {
    if (!value) {
      this.resetSelection()
    }
  }

  writeValue(model: any | Array<any>): void {
    if (!this.opened) {
      this.originalSearchTerm = model;
      this.autocompleteSearch.emit(model);
      this.init(model);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnInit(): void {
    this.lastLabel = this.selectedLabel;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  isSelected(model: any): boolean {
    return this.existsSelection(model, this.valueKey);
  }

  isRequired(): boolean {
    return this.required != undefined;
  }

  isSubmitted(): boolean {
    return this.form && this.form.submitted;
  }

  getSelectedTags(): Array<any> {
    return this.getSelectionItems();
  }

  autocompleteSearchHandler(value = undefined): void {
    if (this.disableItemsMatch) {
      this.onChange(value);
      this.originalSearchTerm = value;
      this.highlightedItemIndex = -1;
      this.search = value;
      this.overlayRef.$updateDropdownPosition.next();
      this.changeDetectorRef.markForCheck();
    }

    this.autocompleteSearch.next(this.search);
    if (!this.opened && this.allowAnyValue) {
      this.openDropdown();
    }
  }

  /**
   * Apply filter to items array
   * generating arguments to filterBy pipe
   * @param {string} search
   */
  tagsSearchHandler(search: string): void {
    if (this.labelKey) {
      let filterArgs = {};
      filterArgs[this.labelKey] = search;
      this.filterArgs = filterArgs;
    } else this.filterArgs = search;

  }

  init(model: any): void {
    if (this.disableItemsMatch) {
      this.search = this.updateSelectedLabel(model);
      return;
    }
    if (model) {
      if (this.multiple) {
        this.clearSelection();
        model.forEach(item => {
          if (item) {
            this.addSelection(item, this.valueKey);
          }
        });
        this.selectedItemsCount = model.length;
      } else {
        this.clearSelection();
        this.addSelection(model, this.valueKey);
        this.selectedItemsCount = 1;
        if (this.labelKey) {
          const item = this.items.find(item => this.getValueKey(item, this.valueKey) == this.getValueKey(model, this.valueKey));
          if (item) {
            this.selectedLabel = this.search = this.updateSelectedLabel(item);
          } else {
            this.selectedLabel = this.search = this.updateSelectedLabel(model);
          }
        } else {
          this.selectedLabel = this.search = this.updateSelectedLabel(model);
        }
      }
    } else {
      this.resetSelection();
    }
    this.changeDetectorRef.markForCheck();
  }

  openDropdown(): void {
    if (!this.opened) {
      this.opened = true;
      this.highlightedItemIndex = 0;
      setTimeout(() => {
        this.dropDownAnimationState = 'opened';
        this.changeDetectorRef.markForCheck();
      }, 0);
    }
  }

  deleteTag(model: any, event: Event): void {
    event.stopPropagation();
    this.removeSelection(model, this.valueKey);
    this.updateValueAccessor(model);
  }

  closeByOverlayHandler(event: MouseEvent): void {
    if (!this.opened) {
      return;
    }
    const target = event.target as HTMLElement;
    if (!target.closest('.cv-holder') && !target.classList.contains('cv-input')) {
      this.closeDropdown(event);
    }
  }

  add(model: any, event: Event = undefined): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.multiple) {
      this.clearSelection();
      this.addSelection(model, this.valueKey);
      this.updateValueAccessor(model);
      this.startClosingDropdown();
    } else {
      this.addOrRemoveSelection(model, this.valueKey);
      this.updateValueAccessor(model);
    }
    this.onSelect.emit(model);
    this.overlayRef.$updateDropdownPosition.next();
    this.changeDetectorRef.markForCheck();
  }

  animationEnd(event: AnimationEvent): void {
    if (event.toState == 'opened') {
      this.isItemsShowed = true;
      this.bindEvents();
      this.updateHolderDimensions(false);
      this.changeDetectorRef.markForCheck();
    } else if (event.toState == 'void') {
      this.opened = false;
      this.dropDownAnimationState = 'closed';
      this.unbindEvents();
      this.changeDetectorRef.markForCheck();
    }
  }

  onKeyDownHandler(event: KeyboardEvent): void {
    if (!this.opened) {
      return;
    }
    event.stopPropagation();
    switch (event.keyCode) {
      case 38: //up arrow
        event.preventDefault();
        this.highlightedItemIndex -= this.highlightedItemIndex <= 0 ? 0 : 1;
        this.onScrollUp(this.itemsHolder.nativeElement);
        break;
      case 40: //down arrow
        event.preventDefault();
        this.highlightedItemIndex = this.highlightedItemIndex >= this.items.length - 1 ? this.items.length - 1 : this.highlightedItemIndex + 1;
        this.onScrollDown(this.itemsHolder.nativeElement);
        break;
      case 27: //escape
        this.closeDropdown(event);
        break;
      case 13: //enter
        if (!this.propagateEnterEvent) {
          event.preventDefault();
          this.onEnter();
        }
        break;
      case 9: //tab
        if (this.allowAnyValue) {
          this.startClosingDropdown();
        } else {
          this.onEnter();
        }
        break;
      default:
        break;
    }
  }

  /**
   * Dynamic height for virtual scroll
   * @param items: Array
   * @maxItems: maxItems in view
   */
  virtualScrollHeight(items, maxItems: number = 4): number {
    if (this.dropdownHeight) {
      this.itemMinHeight = ItemMinHeight.sm;
    }
    if (items && items.length > 0) {
      if (items.length > maxItems && !this.dropdownHeight) {
        return maxItems * this.itemMinHeight;
      } else if (this.dropdownHeight && items.length > maxItems + 1) {
        this.itemFontSize = 15;
        return this.dropdownHeight * this.itemMinHeight;
      } else {
        return items.length * this.getItemHeight(items);
      }
    } else {
      return 0;
    }
  }

  getItemHeight(items): number {
    let itemHeight: number;
    let maxItemNameLength = 40;
    let longItemNameHeight = 64;
    items.forEach(item => {
      if ((this.mediaQuery.xs || this.mediaQuery.sm || this.mediaQuery.md) && item.name && item.name.length > maxItemNameLength) {
        itemHeight = longItemNameHeight;
      } else {
        itemHeight = this.itemMinHeight;
      }
    });
    return itemHeight;
  }

  private updateHolderDimensions(force: boolean): void {
    if ((this.isItemsShowed || force) && this.itemsHolder) {
      if (this.itemsHolder.nativeElement.children.length > 0) {
        this.itemHeight = this.itemsHolder.nativeElement.children[0].offsetHeight;
        this.hostHeight = this.itemsHolder.nativeElement.offsetHeight;
        this.itemPerHost = Math.floor(this.hostHeight / this.itemHeight) - 1;
      }
    }
  }

  public resetSelection(): void {
    this.selectedLabel = this.search = '';
    this.selectedItemsCount = 0;
    this.clearSelection();
    this.autocompleteSearch.emit('');
  }

  public startClosingDropdown(): void {
    this.isItemsShowed = false;
    this.dropDownAnimationState = 'void';
  }

  private updateValueAccessor(model: any | Array<any>): void {
    if (this.multiple) {
      this.selectedItemsCount = this.getSelectionSize();
      this.onChange(this.getSelectionItems().map(item => this.valueKey ? item[this.valueKey] : item));
    } else {
      this.selectedLabel = this.updateSelectedLabel(model);
      this.selectedItemsCount = 1;
      this.search = this.autocomplete ? this.updateSelectedLabel(model) : '';
      this.autocompleteSearch.emit(this.search);
      this.onChange(this.valueKey ? model[this.valueKey] : model);
    }
  }

  private closeDropdown(event?): void {
    this.onClose.emit(false);
    if (!this.disableItemsMatch) {
      if (this.items[this.highlightedItemIndex] && !this.tags) {
        if (this.grouped) {
          if (this.items.length > 0 && this.items[0][this.groupContentKey].length > 0) {
            this.add(this.items[0][this.groupContentKey][0]);
          }
        } else {
          this.add(this.items[this.highlightedItemIndex]);
        }
      }
    }
    this.startClosingDropdown();
  }

  private updateSelectedLabel(item): any {
    if (item) {
      return this.labelKey && item[this.labelKey] ? item[this.labelKey] : item;
    } else {
      return item;
    }

  }

  private groupRemap(items): Array<any> {
    return !this.grouped ? items : items.reduce((acc, item) => [...acc, ...item[this.groupContentKey]], []);
  }

  private onEnter(): void {
    if (this.highlightedItemIndex == -1 && this.search != null && String(this.search).trim()) {
      this.renderer.removeChild(this.overlayRef.getBackdrop(), this.overlayRef.getOverlay());
      this.onSelect.emit(this.search);
      this.overlayRef.$updateDropdownPosition.next();
    }

    if (!this.grouped) {
      if (this.items && this.items[this.highlightedItemIndex]) {
        this.add(this.items[this.highlightedItemIndex]);
      }
    } else {
      if (this.items && this.items.length > 0 && this.items[0][this.groupContentKey].length > 0) {
        this.add(this.items[0][this.groupContentKey][0]);
      }
    }
  }

  private onScrollUp(holder: HTMLElement): void {
    if (holder) {
      if (this.virtualScroll) {
        if (this.activateOriginalSearchTerm && this.highlightedItemIndex == 0){
          this.highlightedItemIndex = -1;
          this.activateOriginalSearchTerm = false;
          this.search = this.originalSearchTerm;
          this.changeDetectorRef.detectChanges();
        }
        if (this.highlightedItemIndex == 0){
          this.activateOriginalSearchTerm = true;
        }
        if (this.items && this.items[this.highlightedItemIndex]) {
          this.search = this.items[this.highlightedItemIndex].name;
          this.changeDetectorRef.detectChanges();
        }
        this.virtualScroll.scrollToIndex(this.highlightedItemIndex - 1, "smooth");
      } else {
        const item: HTMLElement = holder.children[this.highlightedItemIndex] as HTMLElement;
        if (item && item.offsetTop <= holder.scrollTop) {
          item.scrollTo(0, this.highlightedItemIndex * this.itemHeight);
        }
      }
    } else {
      console.warn('Could not find holder');
    }
  }

  private onScrollDown(holder: HTMLElement): void {
    if (holder) {
      if (this.virtualScroll) {
        this.activateOriginalSearchTerm = this.highlightedItemIndex == 0;
        if (this.items && this.items[this.highlightedItemIndex]) {
          this.search = this.items[this.highlightedItemIndex].name;
          this.changeDetectorRef.detectChanges();
        }
        this.virtualScroll.scrollToIndex(this.highlightedItemIndex - 2, "smooth");
      } else {
        const item: HTMLElement = holder.children[this.highlightedItemIndex] as HTMLElement;
        if (item && item.offsetTop + item.offsetHeight >= holder.offsetHeight + holder.scrollTop) {
          holder.scrollTo(0, item.offsetTop + item.offsetHeight - holder.offsetHeight);
        }
      }
    } else {
      console.warn('Could not find holder');
    }
  }

  private bindEvents(): void {
    this.document.addEventListener('click', this.onOverlayClick);
    // this.document.addEventListener('mouseleave', this.onMouseLeave);
    this.document.addEventListener('keydown', this.onKeyDown);
  }

  private unbindEvents(): void {
    this.document.removeEventListener('click', this.onOverlayClick);
    // this.document.removeEventListener('mouseleave', this.onMouseLeave);
    this.document.removeEventListener('keydown', this.onKeyDown);
  }

  private onTouched = () => {
  };
  private onChange = (_: any) => {
  };
}

/**
 * Monkey patching it's no a good
 * Fixing Virtual scroll items count
 * @private
 */
CdkVirtualForOf.prototype['_updateContext'] = function (this: any) {
  const count = this._data.length;
  let i = this._viewContainerRef.length;
  while (i--) {
    let view = this._viewContainerRef.get(i) as EmbeddedViewRef<CdkVirtualForOfContext<any>>;
    if (!view.destroyed) {
      view.context.index = this._renderedRange.start + i;
      view.context.count = count;
      this._updateComputedContextProperties(view.context);
      view.detectChanges();
    }
  }
};
