import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../../src/modeles/descriptionServiceV2.ts';
import { uneDescriptionV2Valide } from '../constructeurs/constructeurDescriptionServiceV2.js';

describe('Une description service V2', () => {
  it('connaît ses données à persister', () => {
    const descriptionV2 = new DescriptionServiceV2({
      nomService: 'Mairie',
      organisationResponsable: {
        nom: 'Ville V',
        siret: '1111111111111',
        departement: '33',
      },
      niveauDeSecurite: 'niveau1',
      categorieDonneesTraitees: 'documentsRHSensibles',
      volumetrieDonneesTraitees: 'faible',
    });

    const aPersister = descriptionV2.donneesSerialisees();

    expect<DonneesDescriptionServiceV2>(aPersister).toEqual({
      nomService: 'Mairie',
      organisationResponsable: {
        departement: '33',
        nom: 'Ville V',
        siret: '1111111111111',
      },
      niveauDeSecurite: 'niveau1',
      categorieDonneesTraitees: 'documentsRHSensibles',
      volumetrieDonneesTraitees: 'faible',
    });
  });

  it('renvoie toujours un statut de saisie à « COMPLETES » car MSS ne permet pas de créer une Description V2 incomplète', async () => {
    const descriptionV2 = uneDescriptionV2Valide().construis();

    expect(descriptionV2.statutSaisie()).toBe('completes');
  });
});
