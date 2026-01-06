import { Issuer, generators } from 'openid-client';
import { Request } from 'express';
import { oidc } from './adaptateurEnvironnement.js';

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

const genereDemandeAutorisation = async () => {
  const client = await recupereClient();
  const nonce = generators.nonce(32);
  const state = generators.state(32);
  const url = client.authorizationUrl({
    scope: 'openid email given_name usual_name siret',
    nonce,
    state,
    // https://partenaires.proconnect.gouv.fr/docs/fournisseur-service/niveaux-acr#les-m%C3%A9thodes-dauthentifications
    claims: { id_token: { amr: null } },
  });

  return { url, nonce, state };
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

  const { nonce, state } = requete.cookies.AgentConnectInfo;
  const token = await client.callback(
    configurationOidc.urlRedirectionApresAuthentification(),
    params,
    { nonce, state }
  );

  const { amr } = token.claims();
  const connexionAvecMFA =
    !!amr &&
    estUneMethodeAuthentificationAvecMFA(amr as MethodeAuthentification[]);

  return {
    accessToken: token.access_token,
    connexionAvecMFA,
    idToken: token.id_token,
  };
};

const recupereInformationsUtilisateur = async (accessToken: string) => {
  const client = await recupereClient();
  const {
    given_name: prenom,
    usual_name: nom,
    email,
    siret,
  } = await client.userinfo(accessToken);
  return { prenom, nom, email, siret };
};

export {
  estUneMethodeAuthentificationAvecMFA,
  genereDemandeAutorisation,
  genereDemandeDeconnexion,
  recupereInformationsUtilisateur,
  recupereJeton,
};
