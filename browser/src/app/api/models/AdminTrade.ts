import { ServiceType } from '../../model/data-model';

export class AdminTrade {
   id: number;
   name: string;
   description: string;
   imageUrl: string;
   rating: number;
   serviceTypes: Array<ServiceType>;


  constructor(name: string, description: string, imageUrl: string, rating: number, serviceTypes: Array<ServiceType>) {
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.rating = rating;
    this.serviceTypes = serviceTypes;
  }
}
