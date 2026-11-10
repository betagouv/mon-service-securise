import { piecesDuDossier } from '../../../src/modeles/objetsPowerpoint/piecesDuDossier.js';

describe('Les pièces du dossier transmises avant la commission', () => {
  it('comprennent toujours le support, la décision, la synthèse, le rapport d’audit et l’analyse de risque', () => {
    expect(piecesDuDossier()).toEqual([
      'Présent support de commission',
      'Décision d’homologation à signer',
      'Synthèse de la sécurité du service (MonServiceSécurisé)',
      'Rapport d’audit, si réalisé',
      'Analyse de risque, si réalisée',
    ]);
  });
});
