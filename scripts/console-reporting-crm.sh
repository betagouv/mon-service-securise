#!/bin/bash

node --import tsx -e "
  (async () => {
    module = (await import('./admin/consoleReportingCrm.ts'));
    crm = new module.ConsoleReportingCrm()
  })();
" -i
