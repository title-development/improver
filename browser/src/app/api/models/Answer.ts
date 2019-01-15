export class Answer {
  id: number;
  name: string;
  image: string;
  label: string;

  constructor(name: string, image: string, label: string) {
    this.name = name;
    this.image = image;
    this.label = label;
  }
}
