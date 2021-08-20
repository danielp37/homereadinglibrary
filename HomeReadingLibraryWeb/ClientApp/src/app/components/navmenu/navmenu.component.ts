import { UrlSegment } from '@angular/router';
import { AuthGuard } from './../../modules/app-auth/services/authguard.service';
import { AuthService } from './../../modules/app-auth/services/auth.service';
import { Component } from '@angular/core';
import { faUsers, faListUl, faBook, faHome, faBookReader, faListAlt } from "@fortawesome/free-solid-svg-icons";

@Component({
    selector: 'app-nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.css']
})
export class NavMenuComponent {

    faUsers = faUsers;
    faListUl = faListUl;
    faBook = faBook;
    faHome = faHome;
    faBookReader = faBookReader;
    faListAlt = faListAlt;

    public isCollapsed : boolean = true;
    constructor(private authGuard: AuthGuard,
        public authService: AuthService) {
    }

    isAccessibleByCurrentUser(route: UrlSegment[]) {
        return this.authGuard.isRouteAllowed(route);
    }

    logout() {
        this.authService.logout();
    }

    get loggedIn(): boolean {
        return this.authService.loggedIn();
    }

    get isVolunteer(): boolean {
        return this.authService.isVolunteer;
    }

    get isAdmin(): boolean {
        return this.authService.isAdmin;
    }
}
