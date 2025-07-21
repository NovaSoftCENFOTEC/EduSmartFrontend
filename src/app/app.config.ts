import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideClientHydration } from "@angular/platform-browser";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { baseUrlInterceptor } from "./interceptors/base-url.interceptor";
import { accessTokenInterceptor } from "./interceptors/access-token.interceptor";
import { handleErrorsInterceptor } from "./interceptors/handle-errors.interceptor";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from "@abacritt/angularx-social-login";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([
        baseUrlInterceptor,
        accessTokenInterceptor,
        //handleErrorsInterceptor
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
        onError: (err) =>
          console.error("Error en SocialAuthServiceConfig:", err),
      } as SocialAuthServiceConfig,
    },
    provideAnimationsAsync(),
  ],
};
