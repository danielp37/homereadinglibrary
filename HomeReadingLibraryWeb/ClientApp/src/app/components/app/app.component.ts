import { LoaderService } from './../../services/loader.service';
import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { authConfig } from '../../modules/app-auth/services/auth.config';
import { AuthService } from '../../modules/app-auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    showLoader: boolean;

    ngOnInit(): void {
        this.loaderService.status.subscribe((val: boolean) => {
            this.showLoader = val;
        });
        this.oauthService.configure(authConfig);
        this.oauthService.tokenValidationHandler = new JwksValidationHandler();
        this.oauthService.loadDiscoveryDocumentAndTryLogin()
            .then(() => {
                if (this.authService.loggedIn && this.router.url.startsWith("/home"))
                {
                    this.router.navigate(['/checkin']);
                }
            });
    }
    constructor(
        private loaderService: LoaderService,
        private oauthService: OAuthService,
        private authService: AuthService,
        private router: Router
    ) {}

    public get name() {
        return this.authService.loggedInName;
    }

    public get claims() {
        return this.oauthService.getIdentityClaims();
    }

    public get scope() {
        return this.oauthService.scope;
    }

    public get accessToken() {
        return this.oauthService.getAccessToken();
    }
}
