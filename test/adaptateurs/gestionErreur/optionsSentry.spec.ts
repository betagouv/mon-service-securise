import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { optionsSentry } from '../../../src/adaptateurs/gestionErreur/optionsSentry.js';

describe("Les options d'initialisation de Sentry", () => {
  it('scrubbe les données sensibles des événements avant envoi', () => {
    const { beforeSend } = optionsSentry();
    const evenement = {
      extra: { nomService: 'Service secret' },
      type: undefined,
    };

    expect(beforeSend!(evenement, {})).toEqual({
      extra: { nomService: '[Filtré]' },
    });
  });

  it("ajoute le détail d'une erreur Axios, scrubbé, avant envoi", () => {
    const { beforeSend } = optionsSentry();
    const config = {
      data: '{"siret":"12345678901234"}',
      headers: new AxiosHeaders(),
    } as InternalAxiosRequestConfig;
    const erreurAxios = new AxiosError('400', 'ERR_BAD_REQUEST', config);

    const evenement = beforeSend!(
      { type: undefined },
      { originalException: new Error('haut niveau', { cause: erreurAxios }) }
    );

    expect(evenement?.contexts?.axios?.corpsEnvoye).toEqual({
      siret: '[Filtré]',
    });
  });

  it('scrubbe les données sensibles des transactions avant envoi', () => {
    const { beforeSendTransaction } = optionsSentry();
    const transaction = {
      type: 'transaction' as const,
      request: { headers: { authorization: 'Bearer cle-api-secrete' } },
    };

    expect(beforeSendTransaction!(transaction, {})).toEqual({
      type: 'transaction',
      request: { headers: { authorization: '[Filtré]' } },
    });
  });

  it('scrubbe les données sensibles des breadcrumbs', () => {
    const { beforeBreadcrumb } = optionsSentry();
    const breadcrumb = { data: { siret: '12345678901234' } };

    expect(beforeBreadcrumb!(breadcrumb, {})).toEqual({
      data: { siret: '[Filtré]' },
    });
  });
});
