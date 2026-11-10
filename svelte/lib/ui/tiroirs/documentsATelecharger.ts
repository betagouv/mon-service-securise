type ServiceAvecDocuments = {
  documentsPdfDisponibles?: string[];
  supportCommissionPptxDisponible?: boolean;
};

export const aDesDocumentsATelecharger = ({
  documentsPdfDisponibles = [],
  supportCommissionPptxDisponible = false,
}: ServiceAvecDocuments) =>
  documentsPdfDisponibles.length > 0 || supportCommissionPptxDisponible;
