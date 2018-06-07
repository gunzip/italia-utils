#!/bin/bash

# git clone https://github.com/gunzip/italia-utils
# cd italia-utils
# git checkout convert-pagopa-wsdl
# yarn install
# ./convert-pagopa.sh

yarn build
git clone https://github.com/teamdigitale/italia-pagopa-api
cp -r italia-pagopa-api/wsdl local.wsdl
mkdir local.swagger
for f in $(ls local.wsdl/nodo/*wsdl); do node dist/wsdl-to-swagger.js --wsdl "$f" --out-dir local.swagger $f; done
mkdir local.wsdl-types
for f in $(ls local.swagger/*yaml); do node dist/index.js --api-spec "$f" --out-dir local.wsdl-types; done
