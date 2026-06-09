import {
  TraceAudit,
  TypeActionAudit,
} from '../modeles/gestionOrganisations/traceAudit.js';

export type AdaptateurAuditAdminOrganisations = {
  trace: (evenement: TraceAudit<TypeActionAudit>) => Promise<void>;
};
