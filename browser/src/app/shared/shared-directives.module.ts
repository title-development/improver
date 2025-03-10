import { NgModule } from '@angular/core';
import { ImagePreviewDirective } from '../directives/image-preview.directive';
import { CreditCardNumberMask } from 'app/directives/credit-card-number.directive';

import { EqualValidator } from '../validators/equal-validator.directive';
import { PhoneMask } from '../directives/phone-mask.directive';
import { NumericMask } from '../directives/numeric-mask.directive';
import { ExpDateMask } from '../directives/exp-date-mask.directive';
import { EmailUniqueValidator } from '../validators/email-unique-validator.directive';
import { CurrencyMask } from '../directives/currency-mask.directive';
import { DateMask } from '../directives/date-mask.directive';
import { PositiveNumericDirective } from '../directives/positive-numeric.directive';
import { GlueBlockDirective } from '../directives/glue-block.directive';
import { MultipleEmailValidatorDirective } from '../validators/multiple-email-validator.directive';
import { CompanyNameUniqueValidator } from "../validators/company-name-unique-validator.directive";
import { TrimDirective } from '../directives/trim.directive';
import { ServiceNameUniqueValidatorDirective } from '../validators/service-name-unique-validator.directive';
import { TradeNameUniqueValidatorDirective } from '../validators/trade-name-unique-validator.directive';
import { FormHasChangesDirective } from '../directives/form-has-changes.directive';

@NgModule({
  imports: [
  ],
  declarations: [
    EqualValidator,
    PhoneMask,
    NumericMask,
    DateMask,
    CreditCardNumberMask,
    ExpDateMask,
    CurrencyMask,
    EmailUniqueValidator,
    CompanyNameUniqueValidator,
    ImagePreviewDirective,
    PositiveNumericDirective,
    GlueBlockDirective,
    MultipleEmailValidatorDirective,
    TrimDirective,
    ServiceNameUniqueValidatorDirective,
    TradeNameUniqueValidatorDirective,
    FormHasChangesDirective
  ],
  exports: [
    EqualValidator,
    PhoneMask,
    NumericMask,
    DateMask,
    CreditCardNumberMask,
    ExpDateMask,
    CurrencyMask,
    EmailUniqueValidator,
    CompanyNameUniqueValidator,
    ImagePreviewDirective,
    PositiveNumericDirective,
    GlueBlockDirective,
    MultipleEmailValidatorDirective,
    TrimDirective,
    ServiceNameUniqueValidatorDirective,
    TradeNameUniqueValidatorDirective,
    FormHasChangesDirective
  ],
  providers: [
  ]
})

export class SharedDirectivesModule {
}
