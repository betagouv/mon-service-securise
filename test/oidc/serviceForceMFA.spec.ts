import { ServiceForceMFA } from '../../src/oidc/serviceForceMFA.ts';

describe('Le service qui force le MFA', () => {
  it("laisse passer, si le fournisseur d'identité ne supporte même pas le MFA", () => {
    const s = new ServiceForceMFA({
      fournisseursAvecMFA: ['F-1'],
      generationUrlProConnectMFA: vi.fn(),
    });

    const resultat = s.execute({
      idFournisseurIdentite: 'F-SANS-MFA',
      email: 'j@mail.fr',
    });

    expect(resultat.action).toBe('LAISSE_PASSER');
    assert(resultat.action === 'LAISSE_PASSER');
    expect(resultat.raison).toBe('MFA_NON_PRIS_EN_CHARGE');
  });

  it("laisse passer, si ProConnect assure la présence d'un MFA via le claim `acr`", () => {
    const s = new ServiceForceMFA({
      fournisseursAvecMFA: ['F-1'],
      generationUrlProConnectMFA: vi.fn(),
    });

    const resultat = s.execute({
      idFournisseurIdentite: 'F-1',
      acr: 'eidas2',
      email: 'j@mail.fr',
    });

    expect(resultat.action).toBe('LAISSE_PASSER');
    assert(resultat.action === 'LAISSE_PASSER');
    expect(resultat.raison).toBe('MFA_DEJA_VALIDE');
  });

  it("ordonne de rediriger si le fournisseur d'identité supporte le MFA mais on n'a pas encore d'ACR", () => {
    const generationUrlProConnectMFA = (email: string) => ({
      url: `https://url-proco.fr?email=${email}`,
      nonce: 'un-nonce',
      state: 'un-state',
    });

    const s = new ServiceForceMFA({
      fournisseursAvecMFA: ['F-1'],
      generationUrlProConnectMFA,
    });

    const email = 'jean@domaine.fr';
    const resultat = s.execute({ idFournisseurIdentite: 'F-1', email });

    expect(resultat.action).toBe('REDIRIGE_VERS_PROCONNECT');
    assert(resultat.action === 'REDIRIGE_VERS_PROCONNECT');
    expect(resultat.url).toBe(`https://url-proco.fr?email=${email}`);
    expect(resultat.nonce).toBe(`un-nonce`);
    expect(resultat.state).toBe(`un-state`);
  });
});
