/**
 * @class CustomBehaviorSubject<T>
 */
import { Subject } from "rxjs/internal/Subject";
import { ObjectUnsubscribedError, Subscriber } from "rxjs/internal-compatibility";
import { Subscription } from "rxjs/internal/Subscription";
import { SubscriptionLike } from "rxjs/internal/types";


export class CustomBehaviorSubject<T> extends Subject<T> {

    private _value: T;

    constructor(value?: T) {
        super();
        this._value = value;
    }

    get value(): T {
        return this.getValue();
    }

    /** @deprecated This is an internal implementation detail, do not use. */
    _subscribe(subscriber: Subscriber<T>): Subscription {
        const subscription = super._subscribe(subscriber);
        if (subscription && !(<SubscriptionLike>subscription).closed && this._value !== undefined) {
            subscriber.next(this._value);
        }
        return subscription;
    }

    getValue(): T {
        if (this.hasError) {
            throw this.thrownError;
        } else if (this.closed) {
            throw new ObjectUnsubscribedError();
        } else {
            return this._value;
        }
    }

    next(value: T): void {
        super.next(this._value = value);
    }
}
