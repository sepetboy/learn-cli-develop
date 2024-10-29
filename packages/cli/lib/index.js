import createInitCommand from "@learn-cli-develop/init";
import createInstallCommand from "@learn-cli-develop/install";
import createLintCommand from "@learn-cli-develop/lint";
import createCli from "./createCli.js";
import "./exception.js";

export default function (args) {
  const program = createCli();
  createInitCommand(program);
  createInstallCommand(program);
  createLintCommand(program);

  program.parse(process.argv);
}
