import { Response, Request } from 'express';
import { estUrlLegalePourRedirection } from '../http/redirection.js';

export const cookieProConnect = {
  deposePourConnexion: (
    reponse: Response,
    urlRedirection: string | undefined,
    state: string,
    nonce: string
  ) => {
    const urlValide =
      urlRedirection && estUrlLegalePourRedirection(urlRedirection);

    reponse.cookie(
      'AgentConnectInfo',
      { state, nonce, ...(urlValide && { urlRedirection }) },
      {
        maxAge: 5 * 60_000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      }
    );
  },
  deposePourDeconnexion: (reponse: Response, state: string) => {
    reponse.cookie(
      'AgentConnectInfo',
      { state },
      {
        maxAge: 30_000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      }
    );
  },
  recupere: (
    requete: Request
  ): { nonce?: string; state?: string; urlRedirection?: string } =>
    requete.cookies.AgentConnectInfo || {
      state: undefined,
      nonce: undefined,
      urlRedirection: undefined,
    },
  existe: (requete: Request) => requete.cookies.AgentConnectInfo !== undefined,
  supprime: (reponse: Response) => reponse.clearCookie('AgentConnectInfo'),
};
