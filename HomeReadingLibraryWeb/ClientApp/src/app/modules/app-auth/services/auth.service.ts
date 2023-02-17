import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class AuthService {
    public token: string;
    private role: string;
    private _loggedInName: string;

    constructor(private router: Router,
        private oauthService: OAuthService) { 
        }

    public volunteerSignin() {
        this.oauthService.initImplicitFlow();
    }

    public loggedIn(): boolean {
        return this.oauthService.hasValidAccessToken();
    }

    public logout() {
        this.oauthService.logOut();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public get identity() : any {
        return this.oauthService.getIdentityClaims();
    }

    public get isVolunteer(): boolean {
        return this.userRoles && this.userRoles.indexOf('VolunteerAccess') !== -1;
    }

    public get isAdmin(): boolean {
        return this.userRoles && this.userRoles.indexOf('AdminAccess') !== -1;
    }

    public get userRoles(): string[] {
        if(this.identity) {
            if(Array.isArray(this.identity.role)) {
                return this.identity.role;
            }
            else return [this.identity.role];
        }
    }

    public get loggedInName(): string {
        if(this.identity) {
            return this.identity.name;
        }
    }

}
