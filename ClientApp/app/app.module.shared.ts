import { ModalModule } from 'ngx-bootstrap/modal';
import { AddClassComponent } from './components/add-class/add-class.component';
import { BookCopyReservationsComponent } from './components/book-copy-reservations/book-copy-reservations.component';
import { CheckOutBookComponent } from './components/check-out-book/check-out-book.component';
import { BookLookupService } from './services/book-lookup.service';
import { BaggyBookService } from './services/baggy-book.service';
import { ClassListsComponent } from './components/class-lists/class-lists.component';
import { SortClassPipe } from './pipes/sort-class.pipe';
import { AddStudentComponent } from './components/add-student/add-student.component';
import { AddBookComponent } from './components/add-book/add-book.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { SigninVolunteerComponent } from './components/signin-volunteer/signin-volunteer.component';
import { SignupVolunteerComponent } from './components/signup-volunteer/signup-volunteer.component';
import { InMemoryDataService } from './services/in-memory-data.service';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './modules/app-routing/app-routing.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { DataTableModule } from 'angular-2-data-table';

import { AppComponent } from './components/app/app.component'
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';

export const sharedConfig: NgModule = {
    bootstrap: [ AppComponent ],
    entryComponents: [

    ],
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        SignupVolunteerComponent,
        SigninVolunteerComponent,
        AddBookComponent,
        BookListComponent,
        AddStudentComponent,
        ClassListsComponent,
        SortClassPipe,
        CheckOutBookComponent,
        BookCopyReservationsComponent,
        AddClassComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        InMemoryWebApiModule.forRoot(InMemoryDataService, {passThruUnknownUrl: true}),
        DataTableModule,
        ModalModule.forRoot()
    ],
    providers: [BaggyBookService, BookLookupService ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
};
