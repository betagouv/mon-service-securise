import * as client from 'openid-client';
import { Request } from 'express';
import { oidc } from './adaptateurEnvironnement.js';
import { cookieProConnect } from '../oidc/cookies.js';
import { ACR_GARANTISSANT_MFA } from '../oidc/acr.js';

const configurationOidc = oidc();

async function recupereConfiguration() {
  return client.discovery(
    new URL(configurationOidc.urlBase() as string),
    configurationOidc.clientId() as string,
    {
      client_secret: configurationOidc.clientSecret(),
      id_token_signed_response_alg: 'RS256',
      userinfo_signed_response_alg: 'RS256',
    }
  );
}

const genereDemandeAutorisation = async () => {
  const configuration = await recupereConfiguration();
  const nonce = client.randomNonce();
  const state = client.randomState();
  const url = client.buildAuthorizationUrl(configuration, {
    redirect_uri: configurationOidc.urlRedirectionApresAuthentification(),
    scope: 'openid email given_name usual_name siret',
    nonce,
    state,
    // https://partenaires.proconnect.gouv.fr/docs/fournisseur-service/niveaux-acr#les-m%C3%A9thodes-dauthentifications
    claims: JSON.stringify({
      id_token: {
        amr: null,
        ...(!configurationOidc.desactiveMFA() && {
          acr: { essential: true, values: [...ACR_GARANTISSANT_MFA] },
        }),
      },
    }),
  });

  return { url: url.href, nonce, state };
};

const genereDemandeDeconnexion = async (idToken: string) => {
  const state = client.randomState();
  const configuration = await recupereConfiguration();
  const url = client.buildEndSessionUrl(configuration, {
    post_logout_redirect_uri:
      configurationOidc.urlRedirectionApresDeconnexion(),
    id_token_hint: idToken,
    state,
  });

  return { url: url.href, state };
};

// La liste des identifiants de méthodes est disponible ici :
// https://partenaires.proconnect.gouv.fr/docs/fournisseur-service/niveaux-acr#les-m%C3%A9thodes-dauthentifications
type MethodeAuthentification = 'totp' | 'pop' | 'mfa' | 'pwd' | 'mail';

const estUneMethodeAuthentificationAvecMFA = (
  methodesAuthentification: MethodeAuthentification[]
) => methodesAuthentification.includes('mfa');

const recupereJeton = async (requete: Request) => {
  const configuration = await recupereConfiguration();
  const urlCourante = new URL(
    requete.originalUrl,
    configurationOidc.urlRedirectionApresAuthentification()
  );

  const { nonce, state } = cookieProConnect.recupere(requete);
  const token = await client.authorizationCodeGrant(
    configuration,
    urlCourante,
    { expectedNonce: nonce, expectedState: state }
  );

  const { amr, acr } = token.claims()!;
  const connexionAvecMFA =
    !!amr &&
    estUneMethodeAuthentificationAvecMFA(amr as MethodeAuthentification[]);

  return {
    accessToken: token.access_token as string,
    connexionAvecMFA,
    idToken: token.id_token as string,
    acr: acr as string | undefined,
  };
};

const recupereInformationsUtilisateur = async (accessToken: string) => {
  const configuration = await recupereConfiguration();
  const {
    given_name: prenom,
    usual_name: nom,
    email,
    siret,
  } = await client.fetchUserInfo(
    configuration,
    accessToken,
    client.skipSubjectCheck
  );

  return {
    prenom: prenom as string,
    nom: nom as string,
    email: email as string,
    siret: siret as string | undefined,
  };
};

export {
  estUneMethodeAuthentificationAvecMFA,
  genereDemandeAutorisation,
  genereDemandeDeconnexion,
  recupereInformationsUtilisateur,
  recupereJeton,
};
