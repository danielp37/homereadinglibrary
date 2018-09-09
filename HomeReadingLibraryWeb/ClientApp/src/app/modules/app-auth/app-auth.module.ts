import { AuthGuard } from './services/authguard.service';
import { AuthService } from './services/auth.service';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { OAuthModule } from "angular-oauth2-oidc";
// import { AuthHttp, AuthConfig } from 'angular2-jwt';

// export function authHttpServiceFactory(http: Http, options: RequestOptions) {
//   return new AuthHttp(new AuthConfig(), http, options);
// }

@NgModule({
  imports: [
    OAuthModule
  ],
  providers: [
    // {
    //   provide: AuthHttp,
    //   useFactory: authHttpServiceFactory,
    //   deps: [Http, RequestOptions]
    // },
    AuthService,
    AuthGuard
  ]
})
export class AuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [AuthService, AuthGuard]
    }
  }
}
