import helmet from 'helmet';
import {
  SCRIPT_UI_KIT,
  SOURCES_EXTERNES,
} from '../documentation/pageDocumentation.js';

export const politiqueSecuriteDocumentation = (urlBaseMss: string) =>
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: [SCRIPT_UI_KIT],
        styleSrc: ["'unsafe-inline'", SOURCES_EXTERNES.uiKit, `${urlBaseMss}/`],
        fontSrc: [`${urlBaseMss}/`],
        imgSrc: [
          "'self'",
          'data:',
          SOURCES_EXTERNES.uiKitAssets,
          `${urlBaseMss}/`,
        ],
        connectSrc: [SOURCES_EXTERNES.uiKitAssets],
        baseUri: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    frameguard: { action: 'deny' },
  });
