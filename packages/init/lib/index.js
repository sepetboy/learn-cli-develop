import Command from "@learn-cli-develop/command";
import { log } from "@learn-cli-develop/utils";
import createTemplate from "./createTemplate.js";
import downloadTemplate from "./downloadTemplate.js";
import installTemplate from "./installTemplate.js";

/**
 * examples:
 * learn-cli init aaa -t project -tp template-vue3 --force
 * learn-cli init
 */
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
      ["-t, --type <type>", "项目类型(值:project/page)"],
      ["-tp, --template <template>", "项目类型(值:project/page)"],
    ]; //二维数组
  }

  async action([name, opts]) {
    // 调试模式才展示
    log.verbose("init", name, opts);
    log.success("init", name, opts);
    // 1.选择项目模版，生成项目信息
    const selectedTemplate = await createTemplate(name, opts);
    log.verbose("selectedTemplate", selectedTemplate);
    // 2、下载项目模板至缓存目录
    await downloadTemplate(selectedTemplate);
    // 3、安装项目模板
    await installTemplate(selectedTemplate, opts);
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
