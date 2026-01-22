import { DepotDonneesSession } from './depotDonneesSession.interface.js';

type ChiffrementPourSession = {
  hacheSha256SansSel: (chaine: string) => string;
};

type PersistancePourSession = {
  estJwtRevoque: (jwt: string) => Promise<boolean>;
  revoqueJwt(jwt: string): Promise<void>;
};

export const creeDepot = ({
  chiffrement,
  persistance,
}: {
  chiffrement: ChiffrementPourSession;
  persistance: PersistancePourSession;
}): DepotDonneesSession => ({
  revoqueJwt: async (jwt: string) => {
    const hash = chiffrement.hacheSha256SansSel(jwt);
    await persistance.revoqueJwt(hash);
  },

  estJwtRevoque: async (jwt: string) => {
    const hash = chiffrement.hacheSha256SansSel(jwt);
    return persistance.estJwtRevoque(hash);
  },
});
