#!/bin/bash

node --import tsx -e "
  (async () => {
    module = (await import('./admin/consoleAnalyseDonnees.js'));
    console = new module.ConsoleAnalyseDonnees()
  })();
" -i