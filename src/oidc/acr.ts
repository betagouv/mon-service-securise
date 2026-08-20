// Depuis la documentation https://partenaires.proconnect.gouv.fr/docs/fournisseur-service/double_authentification
export const ACR_GARANTISSANT_MFA = [
  'eidas0-mfa',
  'eidas1-mfa',
  'eidas2',
  'eidas3',
] as const;

export type ACR = (typeof ACR_GARANTISSANT_MFA)[number];

export const garantitUnMFA = (acr?: string) =>
  ACR_GARANTISSANT_MFA.includes(acr as ACR);
