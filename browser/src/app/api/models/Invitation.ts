export class Invitation {
  id?: number;
  bonus: number = 100;
  emails = [];
  created?: string;
  activated?: string;
  description: string = "";

  constructor() {
    this.emails = [];
    this.bonus = 100;
    this.description = "";
  }

}
