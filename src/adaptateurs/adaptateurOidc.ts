import { Issuer, generators } from 'openid-client';
import { Request } from 'express';
import { oidc } from './adaptateurEnvironnement.js';
import { cookieProConnect } from '../oidc/cookies.js';
import { ACR, ACR_GARANTISSANT_MFA } from '../oidc/serviceForceMFA.js';

const configurationOidc = oidc();

async function recupereClient() {
  const agentConnect = await Issuer.discover(
    configurationOidc.urlBase() as string
  );
  return new agentConnect.Client({
    client_id: configurationOidc.clientId() as string,
    client_secret: configurationOidc.clientSecret(),
    redirect_uris: [configurationOidc.urlRedirectionApresAuthentification()],
    response_types: ['code'],
    id_token_signed_response_alg: 'RS256',
    userinfo_signed_response_alg: 'RS256',
  });
}

const genereDemandeAutorisation = {
  sansForcerLeMFA: async () => {
    const client = await recupereClient();
    const nonce = generators.nonce(32);
    const state = generators.state(32);
    const url = client.authorizationUrl({
      scope: 'openid email given_name usual_name siret idp_id',
      nonce,
      state,
      // https://partenaires.proconnect.gouv.fr/docs/fournisseur-service/niveaux-acr#les-m%C3%A9thodes-dauthentifications
      claims: { id_token: { amr: null } },
    });

    return { url, nonce, state };
  },
  quiForceLeMFA: async (email: string) => {
    const client = await recupereClient();
    const nonce = generators.nonce(32);
    const state = generators.state(32);
    const url = client.authorizationUrl({
      scope: 'openid email given_name usual_name siret idp_id',
      nonce,
      state,
      login_hint: email,
      claims: {
        id_token: {
          amr: null,
          acr: { essential: true, values: [...ACR_GARANTISSANT_MFA] },
        },
      },
    });

    return { url, nonce, state };
  },
};

const genereDemandeDeconnexion = async (idToken: string) => {
  const state = generators.state(32);
  const client = await recupereClient();
  const url = client.endSessionUrl({
    post_logout_redirect_uri:
      configurationOidc.urlRedirectionApresDeconnexion(),
    id_token_hint: idToken,
    state,
  });

  return { url, state };
};

// La liste des identifiants de méthodes est disponible ici :
// https://partenaires.proconnect.gouv.fr/docs/fournisseur-service/niveaux-acr#les-m%C3%A9thodes-dauthentifications
type MethodeAuthentification = 'totp' | 'pop' | 'mfa' | 'pwd' | 'mail';

const estUneMethodeAuthentificationAvecMFA = (
  methodesAuthentification: MethodeAuthentification[]
) => methodesAuthentification.includes('mfa');

const recupereJeton = async (requete: Request) => {
  const client = await recupereClient();
  const params = client.callbackParams(requete);

  const { nonce, state } = cookieProConnect.recupere(requete);
  const token = await client.callback(
    configurationOidc.urlRedirectionApresAuthentification(),
    params,
    { nonce, state }
  );

  const { amr, acr } = token.claims();
  const connexionAvecMFA =
    !!amr &&
    estUneMethodeAuthentificationAvecMFA(amr as MethodeAuthentification[]);

  return {
    accessToken: token.access_token as string,
    connexionAvecMFA,
    idToken: token.id_token as string,
    acr: acr as ACR,
  };
};

const recupereInformationsUtilisateur = async (accessToken: string) => {
  const client = await recupereClient();
  const {
    given_name: prenom,
    usual_name: nom,
    email,
    siret,
    idp_id: idFournisseurIdentite,
  } = await client.userinfo(accessToken);

  return {
    prenom: prenom as string,
    nom: nom as string,
    email: email as string,
    siret: siret as string | undefined,
    idFournisseurIdentite: idFournisseurIdentite as string,
  };
};

export {
  estUneMethodeAuthentificationAvecMFA,
  genereDemandeAutorisation,
  genereDemandeDeconnexion,
  recupereInformationsUtilisateur,
  recupereJeton,
};
