import { DepotDonneesSession } from './depotDonneesSession.interface.js';

type ChiffrementPourSession = {
  hacheSha256SansSel: (chaine: string) => string;
};

type PersistancePourSession = {
  estJwtRevoque: (jwtHache: string) => Promise<boolean>;
  revoqueJwt(jwtHache: string, dateExpirationJwt: Date): Promise<void>;
};

type SecondesAvantExpiration = number;

export const creeDepot = ({
  chiffrement,
  persistance,
  decodeJwt,
}: {
  chiffrement: ChiffrementPourSession;
  persistance: PersistancePourSession;
  decodeJwt: (jwt: string) => { exp: SecondesAvantExpiration };
}): DepotDonneesSession => ({
  revoqueJwt: async (jwt: string) => {
    const hash = chiffrement.hacheSha256SansSel(jwt);

    const secondesVersMillisecondes = decodeJwt(jwt).exp * 1_000;
    const dateExpiration = new Date(secondesVersMillisecondes);

    await persistance.revoqueJwt(hash, dateExpiration);
  },

  estJwtRevoque: async (jwt: string) => {
    const hash = chiffrement.hacheSha256SansSel(jwt);
    return persistance.estJwtRevoque(hash);
  },
});
