import { Issuer, generators } from 'openid-client';
import { oidc } from './adaptateurEnvironnement.js';

const configurationOidc = oidc();

async function recupereClient() {
  const agentConnect = await Issuer.discover(configurationOidc.urlBase());
  return new agentConnect.Client({
    client_id: configurationOidc.clientId(),
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
  });

  return { url, nonce, state };
};

const genereDemandeDeconnexion = async (idToken) => {
  const state = generators.state(32);
  const client = await recupereClient();
  const url = client.endSessionUrl({
    post_logout_redirect_uri:
      configurationOidc.urlRedirectionApresDeconnexion(),
    id_token_hint: idToken,
    state,
  });

  return {
    url,
    state,
  };
};

const recupereJeton = async (requete) => {
  const client = await recupereClient();
  const params = client.callbackParams(requete);

  const { nonce, state } = requete.cookies.AgentConnectInfo;
  const token = await client.callback(
    configurationOidc.urlRedirectionApresAuthentification(),
    params,
    { nonce, state }
  );

  return {
    idToken: token.id_token,
    accessToken: token.access_token,
  };
};

const recupereInformationsUtilisateur = async (accessToken) => {
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
  genereDemandeAutorisation,
  genereDemandeDeconnexion,
  recupereInformationsUtilisateur,
  recupereJeton,
};
