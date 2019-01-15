export class CvSelection {
  private selectedItems: Map<any, any> = new Map<any, any>();

  protected clearSelection(): void {
    this.selectedItems.clear();
  }

  protected addSelection(value: any, valueKey: any): void {
    this.selectedItems.set(this.getValueKey(value, valueKey), value);
  }

  protected addOrRemoveSelection(value: any, valueKey: any): void {
    if (this.existsSelection(value, valueKey)) {
      this.removeSelection(value, valueKey);
    } else {
      if (value) {
        this.addSelection(value, valueKey);
      }
    }
  }

  protected getSelection(value: any, valueKey: any): any {
    return this.selectedItems.get(this.getValueKey(value, valueKey));
  }

  protected getSelectionRemapedItems(valueKey: any): Array<any> {
    return Array.from(this.selectedItems.values()).map(item => this.getValueKey(item, valueKey));
  }

  protected getSelectionItems(): Array<any> {
    return Array.from(this.selectedItems.values())
  }

  protected getSelectionSize(): number {
    return this.selectedItems.size;
  }

  protected existsSelection(value: any, valueKey: any): boolean {
    return this.selectedItems.has(this.getValueKey(value, valueKey));
  }

  protected removeSelection(value: any, valueKey: any): void {
    this.selectedItems.delete(this.getValueKey(value, valueKey));
  }

  protected getValueKey(value: any, valueKey: any) {
    switch (value.constructor) {
      case String:
      case Number:
        return value;
      case Array:
      case Object:
        return valueKey && value[valueKey] ? value[valueKey] : JSON.stringify(value);
      default:
        return JSON.stringify(value);
    }
  }
}
