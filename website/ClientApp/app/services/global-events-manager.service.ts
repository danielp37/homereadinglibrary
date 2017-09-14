import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class GlobalEventsManager {
    public loginStatusChanged: EventEmitter<boolean> = new EventEmitter();

    constructor() { }

}
