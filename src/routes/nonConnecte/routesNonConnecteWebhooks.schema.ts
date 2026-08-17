import { z } from 'zod';

// Côté Brevo ce webhook sera appelé sur l'événement `contact_updated`
// … donc potentiellement bcp de fois, pour toutes sortes de mises à jour.
// Si ce schéma valide la payload entrante, alors on est sûr qu'il s'agit d'une
// mise à jour de pixel de suivi.
export const schemaPostConsentementPixelDeSuivi = z.object({
  event: z.literal('contact_updated'),
  email: z.email(),
  content: z
    .array(
      z.object({
        attributes: z.object({
          _PIXEL_TRACKING_CONSENT: z.boolean().optional(),
        }),
      })
    )
    .min(1)
    .max(1),
});
