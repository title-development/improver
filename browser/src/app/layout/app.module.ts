import { LOCALE_ID, ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandler } from '../util/error-handler';
import { AppComponent } from './app.component';
import { SecurityService } from '../auth/security.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Constants } from '../util/constants';
import { Messages } from '../util/messages';
import { ObserveMediaDirective } from '../directives/observe-media.directive';
import { routing } from './app.routing';
import { ScrollService } from '../util/scroll.service';
import { PhoneHelpService } from '../util/phone-help.service';
import { AgmCoreModule } from '@agm/core';
import { NotificationResource } from '../util/notification.resource';
import { PopUpMessageService } from '../util/pop-up-message.service';
import { QuestionaryControlService } from '../util/questionary-control.service';
import { HTTP_INTERCEPTORS, HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { NgArrayPipesModule } from 'angular-pipes';
import { HomeModule } from '../entity/home/home.module';
import { BillingService } from '../api/services/billing.service';
import { RegistrationService } from '../api/services/registration.service';
import { ActivationService } from '../api/services/activation.service';
import { GeolocationService } from '../api/services/geolocation.service';
import { ServiceTypeService } from '../api/services/service-type.service';
import { CompanyService } from '../api/services/company.service';
import { LeadService } from '../api/services/lead.service';
import { AccountService } from '../api/services/account.service';
import { ProjectService } from '../api/services/project.service';
import { ReviewService } from '../api/services/review.service';
import { TradeService } from '../api/services/trade.service';
import { QuickReplyService } from '../api/services/quick-replay.service';
import { SharedModule } from '../shared/shared.module';
import { PopUpMessageComponent } from '../shared/pop-up-message/pop-up-message.component';
import { PopUpMessageContainerComponent } from '../shared/pop-up-message/pop-up-message-container/pop-up-message-container.component';
import { LayoutModule } from './layout.module';
import { DialogsModule } from '../shared/dialogs/dialogs.module';
import { PageNotFoundComponent } from '../entity/not-found/not-found.component';
import { AuthModule } from '../auth/auth.module';
import { ForbiddenComponent } from '../entity/forbidden/forbidden.component';
import { CUSTOM_DATE_FORMATS } from '../util/CUSTOM_DATE_FORMATS';
import { CvInputModule } from '../theme/input/cv-input.module';
import { CvIconModule } from '../theme/icon/cv-icon-module';
import { CvInputFieldModule } from '../theme/input-field/form-field.module';
import { LicenseService } from '../api/services/license.service';
import { RestDeleteInterceptor } from '../util/interceptors/rest-delete.interseptor';
import { TokenInterceptor } from '../util/interceptors/token.interceptor';
import { TricksService } from '../util/tricks.service';
import { StripeService } from '../util/stripe.service';
import { PaymentService } from '../api/services/payment.service';
import { GoogleMapUtilsService } from '../util/google-map.utils';
import { MapMarkersStore } from '../util/google-map-markers-store.service';
import { ProjectActionService } from '../util/project-action.service';
import { MediaQueryService } from '../util/media-query.service';
import { LayoutComponent } from './layout.component';
import { CvButtonModule } from '../theme/button/cv-button.module';
import { UserService } from '../api/services/user.service';
import { environment } from '../../environments/environment';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FindProfessionalService } from '../util/find-professional.service';
import { SubscriptionActionsService } from '../entity/contractor/subscription-actions/subscription-actions.service';
import { ComponentCanDeactivateGuard } from '../auth/router-guards/component-can-deactivate.guard';
import { ScrollHolderService } from '../util/scroll-holder.service';
import { NotificationService } from '../api/services/notification.service';
import { TicketService } from '../api/services/ticket.service';
import { ProjectRequestService } from '../api/services/project-request.service';
import { AuthServiceConfig, FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { SocialLoginService } from '../api/services/social-login.service';
import { AccessDeniedInterceptor } from '../util/interceptors/access-denied.interceptor';
import { MyStompService } from 'app/util/my-stomp.service';
import { InternalServerErrorComponent } from '../entity/internal-server-error/internal-server-error.component';
import { CustomRouteReuseStrategy } from '../util/router-reuse.strategy';
import { TutorialsService } from '../api/services/tutorials.service';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { PhoneService } from "../api/services/phone.service";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MAT_DATE_FORMATS, MatNativeDateModule } from "@angular/material/core";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { AuthInterceptor } from "../util/interceptors/auth.interseptor";

const rootRouting: ModuleWithProviders = RouterModule.forRoot([], {useHash: false});


export function getAuthServiceConfigs() {
  let config = new AuthServiceConfig(
    [
      {
        id: FacebookLoginProvider.PROVIDER_ID,
        provider: new FacebookLoginProvider(environment.facebookClientId)
      },
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider(environment.googleClientId)
      },
    ]
  );
  return config;
}

@NgModule({
  imports: [
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    rootRouting,
    routing,
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HomeModule,
    SharedModule,
    LayoutModule,
    MatAutocompleteModule,
    MatToolbarModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MatNativeDateModule,
    FlexLayoutModule,
    MatSnackBarModule,
    NgArrayPipesModule,
    DialogsModule,
    AuthModule,
    AgmCoreModule.forRoot({apiKey: environment.googleApiKey, libraries: ['places']}),
    CvIconModule,
    CvInputModule,
    CvInputFieldModule,
    CvButtonModule,
    HammerModule
  ],
  declarations: [
    PageNotFoundComponent,
    ForbiddenComponent,
    InternalServerErrorComponent,
    AppComponent,
    PopUpMessageContainerComponent,
    PopUpMessageComponent,
    ObserveMediaDirective,
    LayoutComponent
  ],
  entryComponents: [
    PopUpMessageContainerComponent,
    PopUpMessageComponent
  ],
  providers: [
    Constants,
    Messages,
    SecurityService,
    BillingService,
    RegistrationService,
    ActivationService,
    UserService,
    GeolocationService,
    ProjectService,
    CompanyService,
    LicenseService,
    AccountService,
    ServiceTypeService,
    LeadService,
    ProjectRequestService,
    ReviewService,
    ScrollService,
    PhoneHelpService,
    NotificationService,
    NotificationResource,
    PopUpMessageService,
    TradeService,
    QuestionaryControlService,
    QuickReplyService,
    FindProfessionalService,
    TricksService,
    PaymentService,
    StripeService,
    ProjectActionService,
    TicketService,
    GoogleMapUtilsService,
    MapMarkersStore,
    MediaQueryService,
    ErrorHandler,
    SubscriptionActionsService,
    ComponentCanDeactivateGuard,
    ScrollHolderService,
    SocialLoginService,
    TutorialsService,
    PhoneService,
    MyStompService,
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    },
    {provide: 'Window', useValue: window},
    {provide: LOCALE_ID, useValue: 'en-US'},
    {provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AccessDeniedInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RestDeleteInterceptor,
      multi: true
    },
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy
    },

    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: environment.googleReCaptchaSiteKey } as RecaptchaSettings,
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {disableClose: true, hasBackdrop: true, autoFocus: false}}
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
