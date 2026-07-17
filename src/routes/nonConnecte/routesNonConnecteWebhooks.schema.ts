import { z } from 'zod';

// Côté Brevo ce webhook sera appelé sur l'événement `contact_updated`
// … donc potentiellement bcp de fois.
// Volontairement, on force zod à ne laisser passer que du _PIXEL_TRACKING_CONSENT
// pour ne pas déclencher notre code métier sur un attribut qui ne nous intéresse
// pas.
export const schemaPostConsentementPixelDeSuivi = z.object({
  event: z.literal('contact_updated'),
  email: z.email(),
  content: z
    .array(
      z.object({
        attributes: z.object({ _PIXEL_TRACKING_CONSENT: z.boolean() }),
      })
    )
    .min(1)
    .max(1),
});
