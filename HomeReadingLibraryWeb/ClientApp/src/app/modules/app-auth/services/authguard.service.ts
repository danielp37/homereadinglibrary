import { Injectable } from '@angular/core';
import { UrlSegment, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { CanActivate } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

    private urlPermissions = {
        VolunteerAccess: ['checkin', 'checkout', 'checkouthistory', 'bookcheckouthistory', 'classstats'],
        anonymous_access: ['home', '', 'signup' ]
    }


    constructor(private auth: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.isRouteAllowed(route.url)
    }

    public isRouteAllowed(url: UrlSegment[]): boolean {
        if (this.auth.loggedIn()) {
            if (this.auth.isAdmin) {
                return true;
            }
            return this.urlPermissions['VolunteerAccess'] && this.urlPermissions['VolunteerAccess'].indexOf(url[0].path) > -1;
        } else {
            if (this.urlPermissions.anonymous_access.indexOf(url[0].path) > -1) {
                return true;
            }
            this.router.navigate(['home']);
            return false;
        }
    }
}
