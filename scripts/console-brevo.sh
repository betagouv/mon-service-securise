#!/bin/bash

node --import tsx -e "
  (async () => {
    module = (await import('./admin/consoleBrevo.ts'));
    brevo = new module.ConsoleBrevo()
  })();
" -i