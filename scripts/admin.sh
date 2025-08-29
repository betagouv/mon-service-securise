#!/bin/bash

node -e "
  (async () => {
    admin = new (await import('./admin/consoleAdministration.js')).default();
  })();
" -i