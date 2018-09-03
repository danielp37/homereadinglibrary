import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CollapseModule } from "ngx-bootstrap/collapse";
import { HttpClientModule } from "@angular/common/http";
import { OAuthModule } from "angular-oauth2-oidc";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//import { AppComponent } from './app.component';
import { AppRoutingModule } from './modules/app-routing/app-routing.module';
import { HomeComponent } from './components/home/home.component';
import { AppComponent } from './components/app/app.component';
import { LoaderService } from './services/loader.service';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { AuthModule } from './modules/app-auth/app-auth.module';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { SortClassPipe } from './pipes/sort-class.pipe';
import { BaggyBookService } from './services/baggy-book.service';
import { CheckInBookComponent } from './components/check-in-book/check-in-book.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    SortClassPipe,
    CheckInBookComponent
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
    ReactiveFormsModule
  ],
  providers: [LoaderService, BaggyBookService],
  bootstrap: [AppComponent]
})
export class AppModule { }
