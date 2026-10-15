import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { detailleLesErreursAxios } from '../../../src/adaptateurs/gestionErreur/enrichissementErreurAxiosSentry.js';

const uneErreurAxios400 = () => {
  const config = {
    method: 'post',
    url: 'https://crm.exemple/rest/donneesMssEntitesUtilisatricess',
    params: { filter: 'siret[eq]:"123"' },
    data: '{"name":"ANSSI"}',
    headers: new AxiosHeaders(),
  } as InternalAxiosRequestConfig;
  return new AxiosError(
    'Request failed with status code 400',
    'ERR_BAD_REQUEST',
    config,
    {},
    {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config,
      data: { messages: ['Champ invalide'] },
    }
  );
};

const contexteAxiosAttendu = {
  methode: 'POST',
  url: 'https://crm.exemple/rest/donneesMssEntitesUtilisatricess',
  params: { filter: 'siret[eq]:"123"' },
  corpsEnvoye: { name: 'ANSSI' },
  statut: 400,
  corpsRecu: { messages: ['Champ invalide'] },
};

describe("L'enrichissement des événements Sentry avec le détail d'une erreur Axios", () => {
  it("ajoute le détail de l'erreur Axios capturée", () => {
    const evenement = detailleLesErreursAxios(
      { type: undefined },
      { originalException: uneErreurAxios400() }
    );

    expect(evenement.contexts?.axios).toEqual(contexteAxiosAttendu);
  });

  it("ajoute le détail d'une erreur Axios trouvée dans la chaîne des causes", () => {
    const intermediaire = new Error('intermédiaire', {
      cause: uneErreurAxios400(),
    });
    const erreur = new Error('haut niveau', { cause: intermediaire });

    const evenement = detailleLesErreursAxios(
      { type: undefined },
      { originalException: erreur }
    );

    expect(evenement.contexts?.axios).toEqual(contexteAxiosAttendu);
  });

  it('conserve les contextes déjà présents', () => {
    const evenement = detailleLesErreursAxios(
      { type: undefined, contexts: { os: { name: 'linux' } } },
      { originalException: uneErreurAxios400() }
    );

    expect(evenement.contexts?.os).toEqual({ name: 'linux' });
  });

  it("garde le corps envoyé tel quel s'il n'est pas du JSON", () => {
    const erreurAxios = uneErreurAxios400();
    erreurAxios.config!.data = 'pas du JSON';

    const evenement = detailleLesErreursAxios(
      { type: undefined },
      { originalException: erreurAxios }
    );

    expect(evenement.contexts?.axios?.corpsEnvoye).toBe('pas du JSON');
  });

  it("laisse l'événement intact sans erreur Axios", () => {
    const evenement = { type: undefined, message: 'rien à voir' };

    const resultat = detailleLesErreursAxios(evenement, {
      originalException: new Error('autre', { cause: new Error('autre') }),
    });

    expect(resultat).toEqual(evenement);
  });
});
