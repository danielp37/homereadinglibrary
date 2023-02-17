import { BookReservationHistoryComponent } from './../../components/book-reservation-history/book-reservation-history.component';
import { StudentReservationHistoryComponent } from './../../components/student-reservation-history/student-reservation-history.component';
import { VolunteerLogonsComponent } from './../../components/volunteer-logons/volunteer-logons.component';
import { AuthGuard } from './../app-auth/services/authguard.service';
import { CheckInBookComponent } from './../../components/check-in-book/check-in-book.component';
import { BookCopyReservationsComponent } from './../../components/book-copy-reservations/book-copy-reservations.component';
import { CheckOutBookComponent } from './../../components/check-out-book/check-out-book.component';
import { BookListComponent } from './../../components/book-list/book-list.component';
import { ClassListsComponent } from './../../components/class-lists/class-lists.component';
import { SignupVolunteerComponent } from './../../components/signup-volunteer/signup-volunteer.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './../../components/home/home.component';
import { ClassStatsComponent } from 'src/app/components/class-stats/class-stats.component';


const routes: Routes = [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'signup',  component: SignupVolunteerComponent },
            { path: 'classlists',  component: ClassListsComponent, canActivate: [AuthGuard] },
            { path: 'booklist',  component: BookListComponent, canActivate: [AuthGuard] },
            { path: 'checkout',  component: CheckOutBookComponent, canActivate: [AuthGuard] },
            { path: 'checkin',  component: CheckInBookComponent, canActivate: [AuthGuard] },
            { path: 'bookscheckedout', component: BookCopyReservationsComponent, canActivate: [AuthGuard]},
            { path: 'logons', component: VolunteerLogonsComponent, canActivate: [AuthGuard]},
            { path: 'checkouthistory', component: StudentReservationHistoryComponent, canActivate: [AuthGuard]},
            { path: 'bookcheckouthistory', component: BookReservationHistoryComponent, canActivate: [AuthGuard]},
            { path: 'classstats', component: ClassStatsComponent, canActivate: [AuthGuard]},
            { path: '**', redirectTo: 'home' }
        ];
/*[


  { path: 'classlists',  component: ClassListsComponent },
  { path: 'booklist',  component: BookListComponent },
  { path: '',  component: HomeComponent },
];*/

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {}),
    //AuthModule
   ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
