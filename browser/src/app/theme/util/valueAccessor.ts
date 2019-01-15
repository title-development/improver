import {Injectable, EventEmitter} from "@angular/core";
import {ControlValueAccessor} from "@angular/forms";

@Injectable()
export class SelectValueAccessor implements ControlValueAccessor {

  modelWrites = new EventEmitter<any>();
  trackBy: string|((item: any) => string);
  valueBy: string|((item: any) => string);

  private _model: any;
  private onChange: (m: any) => void;
  private onTouched: (m: any) => void;


  writeValue(value: any): void {
    this._model = value;
    this.modelWrites.emit(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }


  get model() {
    return this._model;
  }


  set(value: any) {
    this._model = value;
    this.onChange(this._model);
  }

  add(value: any) {
    if (!this.has(value)) {
      if (this._model instanceof Array) {
        this._model.push(value);
      } else {
        this._model = [value];
      }
      this.onChange(this._model);
    }
  }

  remove(value: any) {
    // value = this.extractModelValue(value);
    if (this.trackBy) {
      const item = this._model.find((i: any) => {
        return this.extractValue(i, this.trackBy) === this.extractValue(value, this.trackBy);
      });
      this.removeAt(this._model.indexOf(item));
    } else {
      const item = this._model.find((i: any) => {
        return i === value;
      });
      this.removeAt(this._model.indexOf(item));
    }
  }

  removeAt(index: number): boolean {
    if (!this._model || index < 0 || (index > this._model.length - 1))
      return false;

    this._model.splice(index, 1);
    this.onChange(this._model);
  }

  clear() {
    if (this._model instanceof Array) {
      this._model.splice(0, this._model.length);
    } else {
      this._model = undefined;
    }
  }

  addAt(value: any, index: number): boolean {
    if (!this._model || index < 0)
      return false;

    this._model.splice(index, 0, value);
    this.onChange(this._model);
  }

  addOrRemove(value: any) {
    if (this.has(value)) {
      this.remove(value);
    } else {
      this.add(value);
    }
  }

  has(value: any): boolean {
    // value = this.extractModelValue(value);
    if (this._model instanceof Array) {
      if (this.trackBy) {
        return !!this._model.find((i: any) => {
          return this.extractValue(i, this.trackBy) === this.extractValue(value, this.trackBy);
        });
      } else {
        return !!this._model.find((i: any) => {
          return i === value;
        });
      }

    } else if (this._model !== null && this._model !== undefined) {
      if (this.trackBy) {
        return this.extractValue(this._model, this.trackBy) === this.extractValue(value, this.trackBy);
      } else {
        return this._model === value;
      }
    }

    return false;
  }

  addMany(values: any[]): void {
    if (!values || !values.length) return;
    values.forEach(value => this.add(value));
  }

  removeMany(values: any[]): void {
    if (!values || !values.length) return;
    values.forEach(value => this.remove(value));
  }

  hasMany(values: any[]): boolean {
    if (!values || !values.length) return false;

    let has = true;
    values.forEach(item => {
      if (has)
        has = this.has(item.value);
    });
    return has;
  }

  private extractModelValue(model: any) {
    if (this.valueBy) {
      return this.extractValue(model, this.valueBy);
    } else {
      return model;
    }
  }

  private extractValue(model: any, value: string|((item: any) => string)) {
    if (value instanceof Function) {
      return (value as (item: any) => any)(model);
    } else {
      return model[value as string];
    }
  }

}
