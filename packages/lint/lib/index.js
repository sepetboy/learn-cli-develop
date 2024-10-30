import Command from "@learn-cli-develop/command";
import { log } from "@learn-cli-develop/utils";
import { ESLint } from "eslint";
import jest from "jest";
import Mocha from "mocha";
// import vueConfig from "./eslint/vueConfig.js"; //注意添加js后缀
import path from "node:path";
import { dirname } from "dirname-filename-esm"; // esm模式，没有__dirname变量，在此处进行转换
const __dirname = dirname(import.meta);
const configPath = path.resolve(__dirname, "./eslint/vueConfig.js");
/**
 * examples:
 * learn-cli lint
 */
class LintCommand extends Command {
  get command() {
    return "lint";
  }
  get description() {
    return "lint command";
  }

  extractESLint(resultText, type) {
    const map = {
      problems: /[0-9]+ problems/,
      errors: /([0-9]+) errors/,
      warnings: /([0-9]+) warnings/,
    };
    if (map[type]) {
      return resultText.match(map[type])[0].match(/[0-9]+/)[0];
    } else {
      return null;
    }
  }

  parseESLintResult(resultText) {
    const problems = this.extractESLint(resultText, "problems");
    const errors = this.extractESLint(resultText, "errors");
    const warnings = this.extractESLint(resultText, "warnings");
    return {
      problems,
      errors,
      warnings,
    };
  }

  async action([name, opts]) {
    // 1、eslint
    const cwd = process.cwd();
    const eslint = new ESLint({
      cwd,
      // overrideConfig: vueConfig,// 只能用文件路径，否则提示Could not find config file
      overrideConfigFile: configPath,
    });
    const results = await eslint.lintFiles(["./src/**/*.js", "./src/**/*.vue"]);
    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    console.log(resultText);
    const eslintResult = this.parseESLintResult(resultText);
    log.verbose("eslintResult", eslintResult);
    log.success(
      "eslint检查完毕",
      "错误：" + eslintResult.errors,
      "，警告：" + eslintResult.warnings
    );
    // 2、jest
    log.info("自动执行jest测试");
    await jest.run("test");
    log.success("jest测试执行完毕");
    // 3、mocha
    log.info("自动执行mocha测试");
    const mochaInstance = new Mocha();
    mochaInstance.addFile(path.resolve(cwd, "__tests__/mocha_test.js"));
    mochaInstance.run(() => {
      log.success("mocha测试执行完毕");
    });
  }

  // preAction() {
  //   console.log("pre");
  // }

  // postAction() {
  //   console.log("post");
  // }
}

function lint(instance) {
  return new LintCommand(instance);
}

export default lint;
