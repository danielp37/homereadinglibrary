import { LoaderService } from './../../services/loader.service';
import { Component, NgZone, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { authConfig } from '../../modules/app-auth/services/auth.config';
import { AuthService } from '../../modules/app-auth/services/auth.service';
import { Router } from '@angular/router';
import { Observable, asyncScheduler } from 'rxjs';
import { distinctUntilChanged, observeOn } from 'rxjs/operators';

@Component({
    standalone: false,
    // tslint:disable-next-line:component-selector
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    showLoader$: Observable<boolean>;

    ngOnInit(): void {
        this.oauthService.configure(authConfig);
        this.oauthService.tokenValidationHandler = new JwksValidationHandler();
        this.oauthService.loadDiscoveryDocumentAndTryLogin()
            .then(() => {
                this.ngZone.run(() => {
                    if (this.authService.loggedIn && this.router.url.startsWith("/home"))
                    {
                        this.router.navigate(['/checkin']);
                    }
                });
            });
    }
    constructor(
        private loaderService: LoaderService,
        private oauthService: OAuthService,
        private authService: AuthService,
        private router: Router,
        private ngZone: NgZone
    ) {
        this.showLoader$ = this.loaderService.status.asObservable()
            .pipe(
                distinctUntilChanged(),
                observeOn(asyncScheduler)
            );
    }

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
