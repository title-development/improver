export class RestPage<T> {
  content: Array<T>;
  number: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
  size: number;
  first: boolean;
  last: boolean;

  constructor() {
    this.content = [];
    this.first = true;
  }

}
