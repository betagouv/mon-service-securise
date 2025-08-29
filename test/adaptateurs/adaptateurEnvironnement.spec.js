import expect from 'expect.js';
import { chiffrement } from '../../src/adaptateurs/adaptateurEnvironnement.js';

describe("L'adaptateur environnement", () => {
  let envActuel;

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

    expect(tousLesSelsDeHachage).to.eql([
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

    expect(tousLesSelsDeHachage).to.eql([
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

    expect(tousLesSelsDeHachage).to.eql([
      { version: 1, sel: 'sel1' },
      { version: 2, sel: 'sel2' },
    ]);
  });

  it('utilise des entiers pour les versions', () => {
    process.env = { CHIFFREMENT_SEL_DE_HASHAGE_1: 'sel1' };

    const tousLesSelsDeHachage = chiffrement().tousLesSelsDeHachage();

    expect(tousLesSelsDeHachage[0].version === 1).to.be(true);
  });
});
