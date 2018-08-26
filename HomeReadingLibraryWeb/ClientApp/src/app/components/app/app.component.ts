import { LoaderService } from './../../services/loader.service';
import { Component, OnInit } from '@angular/core';
import { OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';
import { authConfig } from '../../modules/app-auth/services/auth.config';

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
        this.oauthService.loadDiscoveryDocumentAndTryLogin();
    }
    constructor(
        private loaderService: LoaderService,
        private oauthService: OAuthService
    ) {}
}
