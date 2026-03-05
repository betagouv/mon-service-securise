export const ACR_GARANTISSANT_MFA = [
  'eidas2',
  'eidas3',
  'https://proconnect.gouv.fr/assurance/self-asserted-2fa',
  'https://proconnect.gouv.fr/assurance/consistency-checked-2fa',
] as const;

export type ACR = (typeof ACR_GARANTISSANT_MFA)[number];

type ConfigurationServiceForceMFA = {
  fournisseursAvecMFA: string[];
  generationUrlProConnectMFA: (email: string) => {
    url: string;
    state: string;
    nonce: string;
  };
};

type OrdrePourMFA =
  | { action: 'LAISSE_PASSER'; raison: string }
  | {
      action: 'REDIRIGE_VERS_PROCONNECT';
      url: string;
      nonce: string;
      state: string;
    };

export class ServiceForceMFA {
  // eslint-disable-next-line no-empty-function
  constructor(private readonly config: ConfigurationServiceForceMFA) {}

  execute({
    idFournisseurIdentite,
    email,
    acr,
  }: {
    idFournisseurIdentite: string;
    email: string;
    acr?: ACR;
  }): OrdrePourMFA {
    if (!this.config.fournisseursAvecMFA.includes(idFournisseurIdentite))
      return { action: 'LAISSE_PASSER', raison: 'MFA_NON_PRIS_EN_CHARGE' };

    if (acr) return { action: 'LAISSE_PASSER', raison: 'MFA_DEJA_VALIDE' };

    const { url, nonce, state } = this.config.generationUrlProConnectMFA(email);
    return { action: 'REDIRIGE_VERS_PROCONNECT', url, nonce, state };
  }
}
