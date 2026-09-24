import EvenementDossierHomologationImporte from '../../src/bus/evenementDossierHomologationImporte.ts';
import { unDossier } from '../constructeurs/constructeurDossier.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { creeReferentiel } from '../../src/referentiel.ts';

describe("L'événement `DossierHomologationImporte`", () => {
  it("porte le marqueur d'import, qui le distingue d'une finalisation", () => {
    const evenement = new EvenementDossierHomologationImporte({
      idService: unUUID('S'),
      dossier: unDossier(creeReferentiel()).construis(),
      idUtilisateur: unUUID('U'),
    });

    expect(evenement.importe).toBe(true);
  });
});
