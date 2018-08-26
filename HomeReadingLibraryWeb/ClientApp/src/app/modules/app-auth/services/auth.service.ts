import { JwtToken } from './../../../entities/jwt-token';
import { Router } from '@angular/router';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
// import { tokenNotExpired, JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthService {
    public token: string;
    // public jwtHelper: JwtHelper = new JwtHelper();
    private role: string;
    private _loggedInName: string;



    constructor(private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object,
        private oauthService: OAuthService) { 
        }

    public volunteerSignin() {
        this.oauthService.initImplicitFlow();
    }

    public loggedIn(): boolean {
        if (this.platformId === 'browser') {
            let isNotExpired = false; //tokenNotExpired();
            if (isNotExpired && !this.token) {
                this.token = localStorage.getItem('token');
                if (this.token) {
                    this.setupAuthToken(this.token);
                } else {
                    isNotExpired = false;
                }
            }
            return isNotExpired;
        }
        return false;
    }

    public logInWithJwtToken(username: string, token: string): boolean {
        if (token) {
            this.token = token;
            this.setupAuthToken(token);
            console.log(
                // this.jwtHelper.decodeToken(token),
                // this.jwtHelper.getTokenExpirationDate(token),
                // this.jwtHelper.isTokenExpired(token)
              );
            localStorage.setItem('token', token);
        } else {
            return false;
        }
    }

    private setupAuthToken(token: string) {
        const decodedToken = {} as JwtToken; // this.jwtHelper.decodeToken(token) as JwtToken;
        this.role = decodedToken.rol;
        this._loggedInName = `${decodedToken.given_name} ${decodedToken.family_name}`
    }

    public logout() {
        this.oauthService.logOut();
    }

    public get isVolunteer(): boolean {
        return this.role === 'volunteer_access';
    }

    public get isAdmin(): boolean {
        return this.role === 'admin_access';
    }

    public get userRole(): string {
        return this.role;
    }

    public get loggedInName(): string {
        return this._loggedInName;
    }
}
