export interface DepotDonneesSession {
  revoqueJwt(jwt: string): Promise<void>;
  estJwtRevoque(jwt: string): Promise<boolean>;
}
