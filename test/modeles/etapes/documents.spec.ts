import Documents from '../../../src/modeles/etapes/documents.js';

describe('Une étape « Documents »', () => {
  it('sait se convertir en JSON', () => {
    const etape = new Documents({
      documents: ['unDocument'],
      avecDocuments: true,
    });

    expect(etape.toJSON()).toEqual({
      avecDocuments: true,
      documents: ['unDocument'],
    });
  });

  it("sait déclarer l'étape sans document", () => {
    const etape = new Documents({ documents: ['A', 'B'] });

    etape.declareSansDocument();

    expect(etape.avecDocuments).toBe(false);
    expect(etape.documents).toEqual([]);
  });

  it('sait enregistrer des documents', () => {
    const etape = new Documents();

    etape.enregistreDocuments(['A', 'B']);

    expect(etape.avecDocuments).toBe(true);
    expect(etape.documents).toEqual(['A', 'B']);
  });

  describe("sur vérification que l'étape est complète", () => {
    it('est incomplète par défaut', () => {
      const etapeParDefaut = new Documents();
      expect(etapeParDefaut.estComplete()).toBe(false);
    });

    it("est complète s'il n'y a aucun document et qu'elle est déclarée sans document", () => {
      const aucunDocuments = new Documents({
        documents: [],
        avecDocuments: false,
      });
      expect(aucunDocuments.estComplete()).toBe(true);
    });

    describe("dans le cas où l'étape est déclarée avec documents", () => {
      it("n'est pas complète s'il n'y a pas de document", () => {
        const sansDocuments = new Documents({
          documents: [],
          avecDocuments: true,
        });

        expect(sansDocuments.estComplete()).toBe(false);
      });

      it("est complète s'il y a des documents", () => {
        const avecDocumentss = new Documents({
          documents: ['unDocument'],
          avecDocuments: true,
        });

        expect(avecDocumentss.estComplete()).toBe(true);
      });
    });
  });
});
