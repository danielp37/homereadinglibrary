import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../modules/app-auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

    /**
     *
     */
    constructor(
        private authService : AuthService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        if (this.authService.loggedIn()) {
            this.router.navigate(["checkin"]);
        }
    }

    public volunteerSignin() {
        this.authService.volunteerSignin();
    }
}
