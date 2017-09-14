export interface JwtToken {
    aud: string;
    exp: number;
    iat: number;
    id: string;
    iss: string;
    jti: string;
    nbf: string;
    rol: string;
    sub: string;
    given_name: string;
    family_name: string;
}
