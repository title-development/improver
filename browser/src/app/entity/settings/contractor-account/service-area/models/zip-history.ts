export class ZipHistory {
  added: string[];
  removed: string[];

  constructor(added: string[], removed: string[]) {
    this.added = added;
    this.removed = removed;
  }

  isHasHistory(): boolean {
    return !!this.added.length || !!this.removed.length;
  }
}
