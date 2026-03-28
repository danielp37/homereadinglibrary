import { Injectable, NgZone } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Forces all HttpClient response callbacks back into the Angular zone.
 *
 * After upgrading to Angular 21 / zone.js 0.15, the angular-oauth2-oidc library
 * can cause the zone context to be lost during app initialisation. Any HttpClient
 * observable that is subscribed outside the Angular zone will deliver its values
 * outside the zone too, meaning Angular change detection never runs and the UI
 * only updates on the next user-driven event (e.g. clicking the nav menu).
 *
 * Placing this interceptor at the top of the HTTP pipeline guarantees that every
 * next / error / complete notification is re-entered into NgZone, regardless of
 * what zone the subscriber happens to be in.
 */
@Injectable()
export class ZoneHttpInterceptor implements HttpInterceptor {
  constructor(private ngZone: NgZone) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return new Observable(observer => {
      const sub = next.handle(req).subscribe({
        next:     event => this.ngZone.run(() => observer.next(event)),
        error:    err   => this.ngZone.run(() => observer.error(err)),
        complete: ()    => this.ngZone.run(() => observer.complete()),
      });
      return () => sub.unsubscribe();
    });
  }
}
