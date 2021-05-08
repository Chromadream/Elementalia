import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { build, serve, watchServe } from "./functions";

yargs(hideBin(process.argv))
  .command(
    "serve",
    "Preview resulting Docker image, without actually building a docker image",
    { port: { alias: "p", default: 3000 } },
    async (argv) => {
      await build();
      await watchServe(argv.port);
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
