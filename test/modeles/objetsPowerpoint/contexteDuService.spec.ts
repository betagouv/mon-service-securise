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
});
