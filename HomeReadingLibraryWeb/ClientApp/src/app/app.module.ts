import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CollapseModule } from "ngx-bootstrap/collapse";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { OAuthModule } from "angular-oauth2-oidc";
import { ZoneHttpInterceptor } from './services/zone-http-interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from "@swimlane/ngx-datatable";

//import { AppComponent } from './app.component';
import { AppRoutingModule } from './modules/app-routing/app-routing.module';
import { HomeComponent } from './components/home/home.component';
import { AppComponent } from './components/app/app.component';
import { LoaderService } from './services/loader.service';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { AuthModule } from './modules/app-auth/app-auth.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SortClassPipe } from './pipes/sort-class.pipe';
import { BaggyBookService } from './services/baggy-book.service';
import { CheckInBookComponent } from './components/check-in-book/check-in-book.component';
import { CheckOutBookComponent } from './components/check-out-book/check-out-book.component';
import { AddStudentComponent } from './components/add-student/add-student.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookLookupService } from './services/book-lookup.service';
import { SortNamePipe } from './pipes/sort-name.pipe';
import { SortDatePipe } from './pipes/sort-date.pipe';
import { UtcDatePipe } from './pipes/utc-date.pipe';
import { ClassListsComponent } from './components/class-lists/class-lists.component';
import { AddClassComponent } from './components/add-class/add-class.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UploadStudentsComponent } from './components/upload-students/upload-students.component';
import { SignupVolunteerComponent } from './components/signup-volunteer/signup-volunteer.component';
import { BookReservationHistoryComponent } from './components/book-reservation-history/book-reservation-history.component';
import { StudentReservationHistoryComponent } from './components/student-reservation-history/student-reservation-history.component';
import { VolunteerLogonsComponent } from './components/volunteer-logons/volunteer-logons.component';
import { BookCopyReservationsComponent } from './components/book-copy-reservations/book-copy-reservations.component';
import { ClassStatsComponent } from './components/class-stats/class-stats.component';
import { AdminReportsComponent } from './components/admin-reports/admin-reports.component';
import { MissingCheckinsReportComponent } from './components/missing-checkins-report/missing-checkins-report.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    SortClassPipe,
    SortNamePipe,
    SortDatePipe,
    UtcDatePipe,
    CheckInBookComponent,
    CheckOutBookComponent,
    AddStudentComponent,
    ClassListsComponent,
    AddClassComponent,
    UploadStudentsComponent,
    SignupVolunteerComponent,
    BookReservationHistoryComponent,
    StudentReservationHistoryComponent,
    VolunteerLogonsComponent,
    BookCopyReservationsComponent,
    ClassStatsComponent,
    AdminReportsComponent,
    MissingCheckinsReportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CollapseModule.forRoot(),
    AuthModule,
    HttpClientModule,
    ModalModule.forRoot(),
    OAuthModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgbModule,
    FontAwesomeModule,
    BookListComponent
  ],
  providers: [
    LoaderService, BaggyBookService, BookLookupService,
    { provide: HTTP_INTERCEPTORS, useClass: ZoneHttpInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
