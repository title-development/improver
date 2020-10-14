import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { AccountEditPhotoDialogComponent } from './account-edit-photo-dialog/account-edit-photo-dialog.component';
import { CompleteProjectDialogComponent } from './complete-project-dialog/complete-project-dialog.component';
import { CustomerAddReviewFormComponent } from '../../components/customer/customer-project-request-dialog/customer-add-review-form/customer-add-review-form.component';
import { AddLicenseDialogComponent } from './add-license-dialog/add-license-dialog.component';
import { ChangeDefaultPaymentCardDialogComponent } from './change-default-payment-card-dialog/change-default-payment-card-dialog.component';
import { LocationSuggestDialogDialog } from './location-suggest-dialog/location-suggest-dialog.component';
import { AddMoneyDialogComponent } from './add-money-dialog/add-money-dialog.component';
import { AddCompanyReviewComponent } from '../../components/company/company-profile/company-reviews/add-company-review/add-company-review.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DeclineContractorDialogComponent } from './decline-contractor-dialog/decline-contractor-dialog.component';
import { CustomerProjectRequestDialogComponent } from '../../components/customer/customer-project-request-dialog/customer-project-request-dialog.component';
import { AddPaymentCardDialogComponent } from './add-payment-card-dialog/add-payment-card-dialog.component';
import { CancelProjectDialogComponent } from './cancel-project-dialog/cancel-project-dialog.component';
import { QuestionaryDialogComponent } from './questionary-dialog/questionary-dialog.component';
import { RequestRefundDialogComponent } from './request-refund-dialog/request-refund-dialog.component';
import { UnavailabilityPeriodDialogComponent } from './unavailability-period-dialog/unavailability-period-dialog.component';
import { RefundStatusDialogComponent } from './refund-status-dialog/refund-status-dialog.component';
import { SubscriptionDialogComponent } from './subscription-dialog/subscription-dialog.component';
import { RequestReviewDialogComponent } from './request-review-dialog/request-review-dialog.component';
import { DeleteAccountDialogComponent } from './delete-account-dialog/delete-account-dialog.component';
import { DeleteCompanyDialogComponent } from './delete-company-dialog/delete-company-dialog.component';
import { CustomerProjectRequestDialogAboutComponent } from '../../components/customer/customer-project-request-dialog/customer-project-request-dialog-about/customer-project-request-dialog-about.component';
import { CustomerProjectRequestDialogReviewsComponent } from '../../components/customer/customer-project-request-dialog/customer-project-request-dialog-reviews/customer-project-request-dialog-reviews.component';
import { EmailConfirmDialogComponent } from './email-confirm-dialog/email-confirm-dialog.component';
import { RequestReviewRevisionDialogComponent } from './request-review-revision-dialog/request-review-revision-dialog.component';
import { ReferralDialogComponent } from './refreal-dialog/referral-dialog.component';
import { InfoWindowDialogComponent } from './info-window-dialog';
import { MobileMainSearchBarComponent } from "../mobile-main-search-bar/mobile-main-search-bar.component";
import { PhoneValidationDialogComponent } from "./phone-validation-dialog/phone-validation-dialog.component";
import { SocialRegistrationAdditionalInfoDialog } from "./social-registration-additional-info-dialog/social-registration-additional-info-dialog";
import { CompanyLocationDialogComponent } from "./company-location-dialog/company-location-dialog.component";
import { CompanyLicensesDialogComponent } from "./company-licenses-dialog/company-licenses-dialog.component";
import { AboutCompanyDialogComponent } from "./about-company-dialog/about-company-dialog.component";
import { CompanyNameEditDialogComponent } from "./change-company-name-dialog/company-name-edit-dialog.component";
import { EmailVerificationHintDialogComponent } from "./email-verification-hint-dialog/email-verification-hint-dialog.component";
import { PasswordEditorComponent } from "./password-editor/password-editor.component";
import { CompanyFoundationYearEditDialogComponent } from "./change-company-foundation-year-dialog/company-foundation-year-edit-dialog.component";
import { NotReviewedProjectRequestDialogComponent } from "./not-reviewed-project-request-dialog/not-reviewed-project-request-dialog.component";

export const dialogs = [
  QuestionaryDialogComponent,
  CustomerProjectRequestDialogComponent,
  CustomerProjectRequestDialogAboutComponent,
  CustomerProjectRequestDialogReviewsComponent,
  CustomerAddReviewFormComponent,
  ConfirmDialogComponent,
  AccountEditPhotoDialogComponent,
  AddPaymentCardDialogComponent,
  ChangeDefaultPaymentCardDialogComponent,
  AddMoneyDialogComponent,
  CompleteProjectDialogComponent,
  CancelProjectDialogComponent,
  DeclineContractorDialogComponent,
  AddCompanyReviewComponent,
  ImageViewerComponent,
  RequestRefundDialogComponent,
  RefundStatusDialogComponent,
  AddLicenseDialogComponent,
  LocationSuggestDialogDialog,
  EmailConfirmDialogComponent,
  UnavailabilityPeriodDialogComponent,
  SubscriptionDialogComponent,
  RequestReviewDialogComponent,
  RequestReviewRevisionDialogComponent,
  DeleteAccountDialogComponent,
  DeleteCompanyDialogComponent,
  SocialRegistrationAdditionalInfoDialog,
  ReferralDialogComponent,
  InfoWindowDialogComponent,
  PhoneValidationDialogComponent,
  MobileMainSearchBarComponent,
  CompanyLocationDialogComponent,
  CompanyLicensesDialogComponent,
  AboutCompanyDialogComponent,
  CompanyNameEditDialogComponent,
  CompanyFoundationYearEditDialogComponent,
  EmailVerificationHintDialogComponent,
	PasswordEditorComponent,
  NotReviewedProjectRequestDialogComponent
];

export const dialogsMap = {
  'confirm-dialog': ConfirmDialogComponent,
  'questionary-dialog': QuestionaryDialogComponent,
  'customer-project-request-dialog': CustomerProjectRequestDialogComponent,
  'account-edit-photo-dialog': AccountEditPhotoDialogComponent,
  'add-payment-card-dialog': AddPaymentCardDialogComponent,
  'change-default-payment-card-dialog': ChangeDefaultPaymentCardDialogComponent,
  'add-money-dialog': AddMoneyDialogComponent,
  'complete-project-dialog': CompleteProjectDialogComponent,
  'cancel-project-dialog': CancelProjectDialogComponent,
  'decline-contractor-dialog': DeclineContractorDialogComponent,
  'add-review': AddCompanyReviewComponent,
  'image-viewer': ImageViewerComponent,
  'request-refund-dialog': RequestRefundDialogComponent,
  'request-review-dialog': RequestReviewDialogComponent,
  'request-review-revision-dialog': RequestReviewRevisionDialogComponent,
  'refund-status-dialog': RefundStatusDialogComponent,
  'add-license-dialog': AddLicenseDialogComponent,
  'location-suggest-dialog': LocationSuggestDialogDialog,
  'email-confirm-dialog': EmailConfirmDialogComponent,
  'unavailability-period-dialog': UnavailabilityPeriodDialogComponent,
  'subscription-dialog': SubscriptionDialogComponent,
  'delete-account-dialog': DeleteAccountDialogComponent,
  'delete-company-dialog': DeleteCompanyDialogComponent,
  'social-registration-additional-info-dialog': SocialRegistrationAdditionalInfoDialog,
  'referral-dialog': ReferralDialogComponent,
  'info-window-dialog': InfoWindowDialogComponent,
  'phone-validation-dialog': PhoneValidationDialogComponent,
  'mobile-main-search-bar': MobileMainSearchBarComponent,
  'company-location-dialog': CompanyLocationDialogComponent,
  'company-licenses-dialog': CompanyLicensesDialogComponent,
  'about-company-dialog': AboutCompanyDialogComponent,
  'company-name-edit-dialog': CompanyNameEditDialogComponent,
  'company-foundation-year-edit-dialog' : CompanyFoundationYearEditDialogComponent,
  'email-verification-hint-dialog': EmailVerificationHintDialogComponent,
  'password-editor-dialog': PasswordEditorComponent,
  'customer-add-review-dialog': CustomerAddReviewFormComponent,
  'not-reviewed-project-requests-dialog': NotReviewedProjectRequestDialogComponent
};
