import path from "node:path";
import { program } from "commander";
import semver from "semver";
import chalk from "chalk";
import fse from "fs-extra";
import { dirname } from "dirname-filename-esm";
import { log } from "@learn-cli-develop/utils";

const __dirname = dirname(import.meta);
const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = fse.readJsonSync(pkgPath);
const LOWEST_NODE_VERSION = "14.0.0";

function checkNodeVersion() {
  log.verbose("node version", process.version);
  // gte是大于等于
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(
      chalk.red(`learn-cli 需要安装${LOWEST_NODE_VERSION}以上版本的Node.js`)
    );
  }
}

function preAction() {
  // 检查node版本
  checkNodeVersion();
}
export default function createCli() {
  log.info("version", pkg.version);
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .hook("preAction", preAction);

  program.on("option:debug", function () {
    if (program.opts().debug) {
      log.verbose("debug", "launch debug mode");
    }
  });
  program.on("command:*", function (obj) {
    log.error("未知的命令：" + obj[0]);
  });
  return program;
}
