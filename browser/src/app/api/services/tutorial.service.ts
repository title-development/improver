import { Injectable } from '@angular/core';

interface Tutorials {
  coverage: boolean
}

export const data: Tutorials = {
  coverage: false
};

@Injectable()
export class TutorialService {
  private readonly key: string = 'tutorials';

  constructor() {
    if (!localStorage.getItem(this.key)) {
      this.update(data);
    }
  }

  getTutorials(): Tutorials {
    return this.get();
  }

  getTutorial(key: string): boolean {
    if (this.get()[key]) {
      return this.get()[key];
    } else {
      return false;
    }
  }

  earn(key: string): void {
    const data = this.get();
    data[key] = true;
    this.update(data);
  }

  private update(data): void {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  private get(): Tutorials {
    if (localStorage.getItem(this.key)) {
      return JSON.parse(localStorage.getItem(this.key));
    }
    return null;
  }

}
