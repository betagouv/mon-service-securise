#!/bin/bash

node --import tsx -e "
  (async () => {
    admin = new (await import('./admin/consoleAdministration.js')).default();
  })();
" -i