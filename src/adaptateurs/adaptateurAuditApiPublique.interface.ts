import { UUID } from '../typesBasiques.js';

export type TraceAuditApiPublique = {
  idCleApi: UUID;
  idUtilisateur: UUID;
  route: string;
  adresseIp: string;
};

export type AdaptateurAuditApiPublique = {
  trace: (trace: TraceAuditApiPublique) => Promise<void>;
};
