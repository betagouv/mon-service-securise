export interface DepotDonneesSession {
  revoqueJwt(tokenJwt: string): Promise<void>;
}
