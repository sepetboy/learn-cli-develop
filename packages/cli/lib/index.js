import createInitCommand from "@learn-cli-develop/init";
import createCli from "./createCli.js";
import "./exception.js";

export default function (args) {
  const program = createCli();
  createInitCommand(program);

  program.parse(process.argv);
}
