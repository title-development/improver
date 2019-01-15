import { toHttpParams } from './functions';
import { HttpParams } from '@angular/common/http';

describe('Functions', () => {
  const test = {
    name: 'name',
    age: 10,
    sort: '',
    number: 0,
    boolean: false,
    number2: '0',
    description: 'description',
    array: [{}, {}],
    strings: ['ff', 'dd', 'aa'],
    bools: [true, false, false],
    object: {
      param: 'param'
    },
    numbers: [1, 1, 1],
    function: () => {
    },
    method() {
    }
  };
  const compare = {
    name: 'name',
    male : false,
    age : 12,
    likes : 0,
    events: [],
    description: 'description',
    empty: ''
  };

  it('has return HttpParams object', () => {
    const result = toHttpParams(test);
    const testCompare = toHttpParams(compare);
    const right = new HttpParams()
      .set('name', 'name')
      .set('male', 'false')
      .set('age', '12')
      .set('likes', '0')
      .set('description', 'description')
    expect(result.get('name')).toBe('name');
    expect(result.get('description')).toBe(right.get('description'));
    expect(result.get('numbers')).toBe('1,1,1');
    expect(result.get('strings')).toBe('ff,dd,aa');
    expect(result.get('sort')).toBeNull();
    expect(result.get('number')).toBe('0');
    expect(result.get('boolean')).toBe('false');
    expect(result.get('number2')).toBe('0');
    expect(result.get('array')).toBe('[object Object],[object Object]');
    expect(result.get('bools')).toBe('true,false,false');
    expect(result.get('object')).toBe('{"param":"param"}');
    expect(result.get('function')).toBeNull();
    expect(testCompare.toString()).toEqual(right.toString());
  });

});
