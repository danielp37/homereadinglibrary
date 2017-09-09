import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { sharedConfig } from './app.module.shared';

@NgModule({
    bootstrap: sharedConfig.bootstrap,
    declarations: sharedConfig.declarations,
    providers: sharedConfig.providers,
    imports: [
        ServerModule,
        ...sharedConfig.imports
    ]
})
export class AppModule {
}
