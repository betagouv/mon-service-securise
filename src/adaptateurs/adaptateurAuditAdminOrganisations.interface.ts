import { TraceAudit } from '../modeles/gestionOrganisations/traceAudit.js';

export type AdaptateurAuditAdminOrganisations = {
  trace: (evenement: TraceAudit) => Promise<void>;
};
