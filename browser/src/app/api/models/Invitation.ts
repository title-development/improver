export class Invitation {
  id?: number;
  bonus: number;
  email: string;
  created?: string;
  activated?: string;
  description: string;

  constructor() {
    this.email = "";
    this.bonus = 100;
    this.description = "";
  }

}
