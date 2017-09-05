import { CheckInBookComponent } from './../../components/check-in-book/check-in-book.component';
import { BookCopyReservationsComponent } from './../../components/book-copy-reservations/book-copy-reservations.component';
import { CheckOutBookComponent } from './../../components/check-out-book/check-out-book.component';
import { BookListComponent } from './../../components/book-list/book-list.component';
import { ClassListsComponent } from './../../components/class-lists/class-lists.component';
import { SigninVolunteerComponent } from './../../components/signin-volunteer/signin-volunteer.component';
import { SignupVolunteerComponent } from './../../components/signup-volunteer/signup-volunteer.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './../../components/home/home.component';


const routes: Routes = [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'signup',  component: SignupVolunteerComponent },
            { path: 'signin',  component: SigninVolunteerComponent },
            { path: 'classlists',  component: ClassListsComponent },
            { path: 'booklist',  component: BookListComponent },
            { path: 'checkout',  component: CheckOutBookComponent },
            { path: 'checkin',  component: CheckInBookComponent },
            { path: 'bookscheckedout', component: BookCopyReservationsComponent},
            { path: '**', redirectTo: 'home' }
        ];
/*[


  { path: 'classlists',  component: ClassListsComponent },
  { path: 'booklist',  component: BookListComponent },
  { path: '',  component: HomeComponent },
];*/

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
