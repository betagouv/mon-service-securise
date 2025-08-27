import expect from 'expect.js';
import * as Referentiel from '../../src/referentiel.js';
import Risque from '../../src/modeles/risque.js';
import ListeRisques from '../../src/modeles/listeRisques.js';

describe('La liste des risques', () => {
  describe('sur demande de risques par niveau de gravité', () => {
    const referentiel = Referentiel.creeReferentiel({
      niveauxGravite: {
        nonConcerne: {},
        grave: {},
        critique: {},
      },
    });

    it('trie les risques selon leur niveau de gravité', () => {
      const listeRisques = new ListeRisques(
        Risque,
        {
          items: [
            { commentaire: 'Un risque', niveauGravite: 'grave' },
            { commentaire: 'Un risque deux', niveauGravite: 'critique' },
            { commentaire: 'Un risque trois', niveauGravite: 'critique' },
          ],
        },
        referentiel
      );

      const parNiveauGravite = listeRisques.parNiveauGravite();

      expect(parNiveauGravite).to.have.key('grave');
      expect(parNiveauGravite).to.have.key('critique');
      expect(parNiveauGravite.critique.length).to.equal(2);
    });

    it('ajoute les commentaires des risques', () => {
      const listeRisques = new ListeRisques(
        Risque,
        {
          items: [{ commentaire: 'Un commentaire', niveauGravite: 'grave' }],
        },
        referentiel
      );

      const parNiveauGravite = listeRisques.parNiveauGravite();

      expect(parNiveauGravite.grave.length).to.equal(1);
      expect(parNiveauGravite.grave[0].commentaire).to.equal('Un commentaire');
    });

    it('peut utiliser un accumulateur avec des valeurs préexistantes', () => {
      const listeRisques = new ListeRisques(
        Risque,
        {
          items: [{ commentaire: 'Un risque deux', niveauGravite: 'grave' }],
        },
        referentiel
      );

      const parNiveauGravite = listeRisques.parNiveauGravite({
        grave: [{ commentaire: 'Un risque' }],
      });

      expect(parNiveauGravite.grave.length).to.equal(2);
      expect(parNiveauGravite.grave[0].commentaire).to.equal('Un risque');
      expect(parNiveauGravite.grave[1].commentaire).to.equal('Un risque deux');
    });
  });
});
