import {
  chiffrement,
  crm,
  mss,
  statique,
} from '../../src/adaptateurs/adaptateurEnvironnement.js';

describe("L'adaptateur environnement", () => {
  let envActuel: NodeJS.ProcessEnv;

  beforeEach(() => {
    envActuel = process.env;
  });

  afterEach(() => {
    process.env = envActuel;
  });

  it('sait charger les sels', async () => {
    process.env = {
      CHIFFREMENT_SEL_DE_HASHAGE_1: 'sel1',
      CHIFFREMENT_SEL_DE_HASHAGE_2: 'sel2',
    };

    const tousLesSelsDeHachage = chiffrement().tousLesSelsDeHachage();

    expect(tousLesSelsDeHachage).toEqual([
      { version: 1, sel: 'sel1' },
      { version: 2, sel: 'sel2' },
    ]);
  });

  it('charge les sels dans le bon ordre', async () => {
    process.env = {
      CHIFFREMENT_SEL_DE_HASHAGE_1: 'sel1',
      CHIFFREMENT_SEL_DE_HASHAGE_3: 'sel3',
      CHIFFREMENT_SEL_DE_HASHAGE_2: 'sel2',
    };

    const tousLesSelsDeHachage = chiffrement().tousLesSelsDeHachage();

    expect(tousLesSelsDeHachage).toEqual([
      { version: 1, sel: 'sel1' },
      { version: 2, sel: 'sel2' },
      { version: 3, sel: 'sel3' },
    ]);
  });

  it('ne charge pas les sels qui ne correspondent pas au format indiqué', async () => {
    process.env = {
      CHIFFREMENT_SEL_DE_HASHAGE_1: 'sel1',
      CHIFFREMENT_SEL_DE_HASHAGE_V3: 'sel3',
      CHIFFREMENT_SEL_DE_HASHAGE_2: 'sel2',
    };

    const tousLesSelsDeHachage = chiffrement().tousLesSelsDeHachage();

    expect(tousLesSelsDeHachage).toEqual([
      { version: 1, sel: 'sel1' },
      { version: 2, sel: 'sel2' },
    ]);
  });

  it('utilise des entiers pour les versions', () => {
    process.env = { CHIFFREMENT_SEL_DE_HASHAGE_1: 'sel1' };

    const tousLesSelsDeHachage = chiffrement().tousLesSelsDeHachage();

    expect(tousLesSelsDeHachage[0].version === 1).toBe(true);
  });

  describe('sur demande des URL de MonServiceSécurisé', () => {
    it("expose l'URL de base de l'API publique", () => {
      process.env = { URL_BASE_API_MSS: 'https://api.example.org' };

      expect(mss().urlBaseApi()).toBe('https://api.example.org');
    });

    it("construit l'URL de la documentation à partir de l'URL de base de l'API publique", () => {
      process.env = { URL_BASE_API_MSS: 'https://api.example.org' };

      expect(mss().urlDocumentationApi()).toBe('https://api.example.org/docs');
    });
  });

  describe("sur demande de l'URL de base du CRM", () => {
    it("retourne l'URL de la variable d'environnement", () => {
      process.env = {
        REPORTING_TWENTY_CRM_URL_BASE: 'https://crm.example.org',
      };

      expect(crm().urlBase().toString()).toBe('https://crm.example.org/');
    });

    it("jette une erreur quand la variable d'environnement est absente", () => {
      process.env = {};

      expect(() => crm().urlBase()).toThrowError(
        new Error(
          "La variable d'environnement de l'URL de base du CRM Twenty est absente."
        )
      );
    });
  });

  describe('sur demande de la politique de cache des fichiers statiques', () => {
    it("utilise la valeur de la variable d'environnement", () => {
      process.env = {
        CACHE_CONTROL_FICHIERS_STATIQUES: 'public, max-age=86400',
      };

      expect(statique().politiqueCache()).toEqual('public, max-age=86400');
    });

    it("interdit le stockage quand la variable d'environnement est absente", () => {
      process.env = {};

      expect(statique().politiqueCache()).toEqual('no-store');
    });
  });
});
