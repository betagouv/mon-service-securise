import { Request } from 'express';
import { ACR } from '../oidc/serviceForceMFA.js';

const FAKE_STATE = 'FAKE_STATE';
const FAKE_NONCE = 'FAKE_NONCE';

const urlApresAuthentification = (email: string) =>
  `${process.env.URL_BASE_MSS}/oidc/apres-authentification?code=fake&state=${FAKE_STATE}&email=${email}`;

export const genereDemandeAutorisation = {
  sansForcerLeMFA: async (email: string) => ({
    url: urlApresAuthentification(email),
    state: FAKE_STATE,
    nonce: FAKE_NONCE,
  }),
  quiForceLeMFA: async (email: string) => ({
    url: urlApresAuthentification(email),
    state: FAKE_STATE,
    nonce: FAKE_NONCE,
  }),
};

export const genereDemandeDeconnexion = async () => ({
  url: `${process.env.URL_BASE_MSS}/connexion`,
  state: FAKE_STATE,
});

export const recupereJeton = async (requete: Request) => ({
  idToken: 'FAKE_ID_TOKEN',
  accessToken: requete.query.email,
  connexionAvecMFA: true,
  acr: 'eidas2' as ACR,
});

export const recupereInformationsUtilisateur = async (accessToken: string) => ({
  nom: 'Test',
  prenom: 'Utilisateur',
  email: accessToken,
  siret: '13000766900018',
  idFournisseurIdentite: 'FAKE_IDP',
});

type MethodeAuthentification = 'totp' | 'pop' | 'mfa' | 'pwd' | 'mail';
export const estUneMethodeAuthentificationAvecMFA = (
  methodesAuthentification: MethodeAuthentification[]
) => methodesAuthentification.includes('mfa');
