import { AuthConfig } from "angular-oauth2-oidc";
import { environment } from "../../../../environments/environment";

export const authConfig : AuthConfig = {
    issuer: environment.issuer,
    clientId: "spa",
    redirectUri: window.location.origin + "/checkin",
    postLogoutRedirectUri: window.location.origin + "/home",

    // these two will be done dynamically from the buttons clicked, but are
    // needed if you want to use the silent_renew
    responseType: "id_token token",
    scope: "openid profile email library",
}
