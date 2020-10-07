import * as Fuse from "fuse.js";
import { FuseOptions } from "fuse.js";

export class SearchHolder<T> {

  readonly fuseOptions: FuseOptions<T> = {
    maxPatternLength: 100,
    minMatchCharLength: 2,
    threshold: 0.1,
    tokenize: true,
    matchAllTokens: true,
    keys: ['name']
  };

  serviceTypes: Array<T> = [];
  serviceTypeIndexes;

  constructor(serviceTypes: Array<T>, options?: FuseOptions<T>) {
    this.serviceTypes = serviceTypes;
    if (options) {
      this.fuseOptions = {
        ...this.fuseOptions,
        ...options
      }
    }
    this.init()
  }

  private init() {
    this.serviceTypeIndexes = new Fuse(this.serviceTypes, this.fuseOptions);
  }

  public search(searchTerm: string) {
    searchTerm = searchTerm.trim()
    let results: Array<T> = []
    if (searchTerm) {
      results = this.serviceTypeIndexes.search(searchTerm)
    }
    return results;
  }

}
