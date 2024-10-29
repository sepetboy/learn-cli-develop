import Command from "@learn-cli-develop/command";
import { log } from "@learn-cli-develop/utils";
import { ESLint } from "eslint";
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
    console.log("results", results);
    const formatter = await eslint.loadFormatter("stylish");
    const resultText = formatter.format(results);
    console.log(resultText);
    const eslintResult = this.parseESLintResult(resultText);
    log.verbose("eslintResult", eslintResult);
    // 2、jest/mocha
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
