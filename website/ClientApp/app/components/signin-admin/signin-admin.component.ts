import { LoginFailure } from './../../entities/login-failure';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { BaggyBookService } from './../../services/baggy-book.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Component, OnInit, Output, EventEmitter, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-signin-admin',
  templateUrl: './signin-admin.component.html',
  styleUrls: ['./signin-admin.component.css']
})
export class SigninAdminComponent implements OnInit {
  @Output()onLoggedIn = new EventEmitter();
  public errorStatus: string[];

  constructor(private baggyBookService: BaggyBookService,
    private router: Router,
    private renderer: Renderer2) {
      this.errorStatus = [];
    }

  ngOnInit() {
    const usernameInput = this.renderer.selectRootElement('#username');
    usernameInput.focus();
  }

  loginAdmin(f: NgForm) {
    this.errorStatus = [];
    this.baggyBookService.loginAdmin(f.value.username, f.value.password)
      .then(loggedIn => {
        this.router.navigate(['/bookscheckedout']);
        this.onLoggedIn.emit();
      })
      .catch(error => {
        if (error._body) {
          const response = JSON.parse(error._body) as LoginFailure;
          if (response.login_failure) {
            for (let i = 0; i < response.login_failure.length; i++) {
              this.errorStatus.push(response.login_failure[i]);
            }
          }
        } else {
          this.errorStatus[0] = error._body || error;
        }
      });
  }
}
