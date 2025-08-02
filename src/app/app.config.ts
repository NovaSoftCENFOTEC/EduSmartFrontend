import {ApplicationConfig, importProvidersFrom, LOCALE_ID} from "@angular/core";
import {provideRouter} from "@angular/router";

import {routes} from "./app.routes";
import {provideClientHydration} from "@angular/platform-browser";
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {baseUrlInterceptor} from "./interceptors/base-url.interceptor";
import {accessTokenInterceptor} from "./interceptors/access-token.interceptor";
import {handleErrorsInterceptor} from "./interceptors/handle-errors.interceptor";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {
    GoogleLoginProvider,
    SocialAuthServiceConfig,
    SocialLoginModule,
} from "@abacritt/angularx-social-login";

import {registerLocaleData} from "@angular/common";
import localeEs from "@angular/common/locales/es";

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideClientHydration(),
        provideHttpClient(
            withInterceptors([
                baseUrlInterceptor,
                accessTokenInterceptor,
            ])
        ),
        importProvidersFrom(SocialLoginModule),
        {
            provide: "SocialAuthServiceConfig",
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider(
                            "731369077540-79b1cu21reeiu3kv8647ej5jq601bcih.apps.googleusercontent.com"
                        ),
                    },
                ],
            } as SocialAuthServiceConfig,
        },
        provideAnimationsAsync(),
        {provide: LOCALE_ID, useValue: 'es'}
    ],
};
