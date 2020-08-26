import { getErrorMessage, toHttpParams } from './functions';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { httpStatusCodeResponses } from './text-messages';

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
    male: false,
    age: 12,
    likes: 0,
    events: [],
    description: 'description',
    empty: ''
  };
  const httpErrors = {
    regexErrors: {
      mock: {
        error: `{"status":422,"message":"Invalid Data. [May contain only letters, numbers and characters: ' -]"}`,
        headers: {
          normalizedNames: new Map([]), lazyUpdate: null, lazyInit: function () {
          }
        },
        message: 'Http failure response for https://localhost:4200/api/users/7/update: 422 Unprocessable Entity',
        name: 'HttpErrorResponse',
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        url: 'https://localhost:4200/api/users/7/update'
      },
      expect: 'Invalid Data. [May contain only letters, numbers and characters: \' -]'
    },
    serverShutDown: {
      mock: {
        error: {
          bubbles: false,
          cancelBubble: false,
          cancelable: false,
          composed: false,
          currentTarget: {
            readyState: 4,
            timeout: 0,
            withCredentials: false,
            upload: XMLHttpRequestUpload,
            responseURL: ''
          },
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: true,
          lengthComputable: false,
          loaded: 0,
          path: [],
          returnValue: true,
          srcElement: {
            readyState: 4,
            timeout: 0,
            withCredentials: false,
            upload: XMLHttpRequestUpload,
            responseURL: ''
          },
          target: {readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload, responseURL: ''},
          timeStamp: 35601.9999999553,
          total: 0,
          type: 'error'
        },
        headers: {normalizedNames: new Map([]), lazyUpdate: null, headers: new Map([])},
        message: 'Http failure response for (unknown url): 0 Unknown Error',
        name: 'HttpErrorResponse',
        ok: false,
        status: 0,
        statusText: 'Unknown Error',
        url: null
      },
      expect: 'Unknown Error'
    },
    runtimeException: {
      mock: {
        error: {status: 404, message: 'Lead is not available'},
        headers: {
          normalizedNames: new Map([]), lazyUpdate: null, lazyInit: function () {
          }
        },
        message: 'Http failure response for https://localhost:4200/api/pro/leads/9: 404 Not Found',
        name: 'HttpErrorResponse',
        ok: false,
        status: 404,
        statusText: 'Not Found',
        url: 'https://localhost:4200/api/pro/leads/9',
      },
      expect: 'Lead is not available'
    },

  };

  let serverShutDown = {};

  it('has return HttpParams object', () => {
    const result = toHttpParams(test);
    const testCompare = toHttpParams(compare);
    const right = new HttpParams()
      .set('name', 'name')
      .set('male', 'false')
      .set('age', '12')
      .set('likes', '0')
      .set('description', 'description');
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

  it('Get error message from Http error response', () => {
    for (let key in httpErrors) {
      let error = getErrorMessage(httpErrors[key].mock);
      expect(error).toBe(httpStatusCodeResponses[httpErrors[key].status] ? httpStatusCodeResponses[httpErrors[key].status] : httpErrors[key].expect);
    }
  });
});
