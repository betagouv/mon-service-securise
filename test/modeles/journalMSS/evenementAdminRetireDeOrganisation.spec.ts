import EvenementAdminRetireDeOrganisation from '../../../src/modeles/journalMSS/evenementAdminRetireDeOrganisation.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("Un événement de retrait d'admin d'une organisation", () => {
  it("consigne les identifiants hachés de l'acteur, de la cible et le siret haché", () => {
    const evenement = new EvenementAdminRetireDeOrganisation(
      { idActeur: unUUID('a'), idCible: unUUID('c'), siret: 'abcd' },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'ADMIN_RETIRE_DE_ORGANISATION',
      donnees: { idActeur: unUUID('A'), idCible: unUUID('C'), siret: 'ABCD' },
      date: '17/11/2022',
    });
  });
});
