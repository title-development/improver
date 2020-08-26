import { Inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";


/**
 * Stripe service
 */
@Injectable()
export class StripeService {

  public stripe;

  constructor(@Inject('Window') public window: Window) {

    let wind = window as any;
    this.stripe = wind.Stripe(environment.stripePublicKey);

  }

}
