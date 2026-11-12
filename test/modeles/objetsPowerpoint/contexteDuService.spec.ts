import { contexteDuService } from '../../../src/modeles/objetsPowerpoint/contexteDuService.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';

describe('Le contexte du service présenté à la commission', () => {
  it('reprend la présentation du service comme description du système d’information', () => {
    const description = uneDescriptionV2Valide()
      .avecPresentation('Un portail de démarches en ligne')
      .construis();

    expect(contexteDuService(description).description).toBe(
      'Un portail de démarches en ligne'
    );
  });

  it('présente l’organisation responsable par son nom et son SIRET formaté', () => {
    const description = uneDescriptionV2Valide()
      .avecOrganisationResponsable({
        nom: 'Commune de Villeneuve',
        siret: '12345678900010',
      })
      .construis();

    expect(contexteDuService(description).organisation).toBe(
      'Commune de Villeneuve (123 456 789 00010)'
    );
  });

  it('présente l’organisation responsable par son seul SIRET formaté quand son nom est inconnu', () => {
    const description = uneDescriptionV2Valide()
      .avecOrganisationResponsable({ siret: '12345678900010' })
      .construis();

    expect(contexteDuService(description).organisation).toBe(
      '123 456 789 00010'
    );
  });
});
