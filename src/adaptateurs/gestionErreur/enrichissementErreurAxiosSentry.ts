import axios, { AxiosError } from 'axios';
import type { ErrorEvent, EventHint } from '@sentry/node';

const trouveErreurAxios = (erreur: unknown): AxiosError | undefined => {
  if (axios.isAxiosError(erreur)) return erreur;
  if (erreur instanceof Error) return trouveErreurAxios(erreur.cause);
  return undefined;
};

const enObjetSiJson = (corps: unknown) => {
  if (typeof corps !== 'string') return corps;
  try {
    return JSON.parse(corps);
  } catch {
    return corps;
  }
};

const detailDe = ({ config, response }: AxiosError) => ({
  methode: config?.method?.toUpperCase(),
  url: config?.url,
  params: config?.params,
  corpsEnvoye: enObjetSiJson(config?.data),
  statut: response?.status,
  corpsRecu: response?.data,
});

export const detailleLesErreursAxios = (
  evenement: ErrorEvent,
  hint: EventHint
): ErrorEvent => {
  const erreurAxios = trouveErreurAxios(hint.originalException);
  if (!erreurAxios) return evenement;

  return {
    ...evenement,
    contexts: { ...evenement.contexts, axios: detailDe(erreurAxios) },
  };
};
