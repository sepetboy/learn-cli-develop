import Command from "@learn-develop-cli/command";
import { log } from "@learn-develop-cli/utils";
class InitCommand extends Command {
  get command() {
    return "init [name]";
  }
  get description() {
    return "init project";
  }

  get options() {
    return [
      ["-f, --force", "是否强制更新", false],
      // ["-v, --vvv", "是否强制更新", false],
    ]; //二维数组
  }

  action([name, opts]) {
    // 调试模式才展示
    log.verbose("init", name, opts);
    log.success("init", name, opts);
  }

  // preAction() {
  //   console.log("pre");
  // }

  // postAction() {
  //   console.log("post");
  // }
}

function Init(instance) {
  return new InitCommand(instance);
}

export default Init;
