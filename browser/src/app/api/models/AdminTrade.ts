import { ServiceType } from '../../model/data-model';

export class AdminTrade {
   id: number;
   name: string;
   description: string;
   imageUrl: string;
   rating: number;
   isAdvertised: boolean;
   services: Array<ServiceType>;

  constructor(name: string, description: string, imageUrl: string, rating: number, isAdvertised: boolean, services: Array<ServiceType>) {
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.rating = rating;
    this.isAdvertised = isAdvertised;
    this.services = services;
  }
}
