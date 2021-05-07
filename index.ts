import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { build } from "./functions/build";

yargs(hideBin(process.argv))
  .command(
    "serve",
    "Preview resulting Docker image, without actually building a docker image",
    { port: { alias: "p", default: 3000 } },
    (argv) => {
      console.log(`Serving Elementalia on Port ${argv.port}`);
    }
  )
  .command(
    "build-docker",
    "Build a Docker image for your OpenAPI specification"
  )
  .command(
    "build",
    "Build a site for your OpenAPI specification. If a Docker image is needed, use build-docker",
    async (_) => {
      await build();
    }
  ).argv;
