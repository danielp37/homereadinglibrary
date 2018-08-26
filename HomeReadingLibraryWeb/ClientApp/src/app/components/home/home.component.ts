import { Component } from '@angular/core';
import { AuthService } from '../../modules/app-auth/services/auth.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'home',
    templateUrl: './home.component.html'
})
export class HomeComponent {
    /**
     *
     */
    constructor(
        private authService : AuthService
    ) {
        
        
    }

    public volunteerSignin() {
        this.authService.volunteerSignin();
    }
}
