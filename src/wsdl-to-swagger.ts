/* tslint:disable:no-console */

import * as apiconnWsdl from "apiconnect-wsdl";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import { Spec } from "swagger-schema-official";

import yargs = require("yargs");

export function wsdlToswaggerString(
  url: string
): Promise<ReadonlyArray<[string, Spec]>> {
  // tslint:disable-next-line:no-any
  return (
    apiconnWsdl
      .getJsonForWSDL(url)
      // tslint:disable-next-line:no-any
      .then((wsdls: any) => {
        // Get Services from all parsed WSDLs
        const serviceData = apiconnWsdl.getWSDLServices(wsdls);
        // Loop through all services and generate yaml file
        // tslint:disable-next-line:no-any
        return serviceData.services.map((item: any) => {
          const serviceName = item.service;
          const wsdlId = item.filename;
          const wsdlEntry = apiconnWsdl.findWSDLForServiceName(
            wsdls,
            serviceName
          );
          const swagger = apiconnWsdl.getSwaggerForService(
            wsdlEntry,
            serviceName,
            wsdlId
          );
          return [serviceName, swagger];
        });
      })
      .catch(console.error)
  );
}

export async function wsdlToswaggerSpecs(
  srcWsdl: string,
  outDir: string
): Promise<string[]> {
  const swaggers = await wsdlToswaggerString(srcWsdl);
  return Promise.all(
    swaggers.map(
      (swagger): Promise<string> =>
        new Promise((resolve, reject) => {
          const filePath = path.join(outDir, swagger[0] + ".yaml");
          return fs.writeFile(
            path.join(outDir, swagger[0] + ".yaml"),
            yaml.safeDump(swagger[1]),
            err => (err ? reject(err) : resolve(filePath))
          );
        })
    )
  );
}

const argv = yargs
  .option("wsdl", {
    demandOption: true,
    description: "Path to input WSDL file",
    normalize: true,
    string: true
  })
  .option("out-dir", {
    demandOption: true,
    description: "Output directory to store generated swagger files",
    normalize: true,
    string: true
  })
  .help().argv;

wsdlToswaggerSpecs(argv.wsdl, argv["out-dir"])
  .then(paths => console.dir(paths))
  .catch(console.error);
