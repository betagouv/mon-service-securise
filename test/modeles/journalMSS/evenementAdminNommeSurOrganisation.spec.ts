import EvenementAdminNommeSurOrganisation from '../../../src/modeles/journalMSS/evenementAdminNommeSurOrganisation.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("Un événement de nomination d'admin sur une organisation", () => {
  it("consigne les identifiants hachés de l'acteur, de la cible et le siret haché", () => {
    const evenement = new EvenementAdminNommeSurOrganisation(
      { idActeur: unUUID('a'), idCible: unUUID('c'), siret: 'abcd' },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'ADMIN_NOMME_SUR_ORGANISATION',
      donnees: { idActeur: unUUID('A'), idCible: unUUID('C'), siret: 'ABCD' },
      date: '17/11/2022',
    });
  });
});
