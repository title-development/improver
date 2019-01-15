import { ServiceType } from '../../model/data-model';
import { Question } from './Question';

export class Questionary {
  id: number;
  name: string;
  description: string;
  serviceTypes?: Array<ServiceType>;
  questions?: Array<Question>;

  constructor(name: string, description: string, serviceTypes: Array<ServiceType>, questions: Array<Question>) {
    this.name = name;
    this.description = description;
    this.serviceTypes = serviceTypes;
    this.questions = questions;
  }
}
