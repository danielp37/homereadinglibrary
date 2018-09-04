import { AuthConfig } from "angular-oauth2-oidc";
import { environment } from "../../../../environments/environment";

export const authConfig : AuthConfig = {
    issuer: window.location.origin,
    clientId: "spa",
    redirectUri: window.location.origin + "/home",
    postLogoutRedirectUri: window.location.origin + "/home",


    responseType: "id_token token",
    scope: "openid profile email LoginRole library library.VolunteerAccess library.AdminAccess",
}
