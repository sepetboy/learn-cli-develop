import { homedir } from "node:os";
import path from "node:path";
import {
  log,
  makeList,
  makeInput,
  getLatestVersion,
} from "@learn-cli-develop/utils";
const ADD_TYPE_PROJECT = "project";
const ADD_TYPE_PAGE = "page";
const ADD_TEMPLATE = [
  {
    name: "vue3项目模版",
    value: "template-vue3",
    npmName: "@learn-cli-develop/template-vue3",
    version: "1.0.0",
  },
  {
    name: "react18项目模版",
    value: "template-react18",
    npmName: "@learn-cli-develop/template-react18",
    version: "1.0.0",
  },
];
const ADD_TYPE = [
  {
    name: "项目",
    value: ADD_TYPE_PROJECT,
  },
  {
    name: "页面",
    value: ADD_TYPE_PAGE,
  },
];
const TEMP_HOME = ".learn-cli-develop";

// 获取创建类型
function getAddType() {
  return makeList({
    choices: ADD_TYPE,
    message: "请选择初始化类型",
    defaultValue: ADD_TYPE_PROJECT,
  });
}

// 获取项目名称
function getAddName() {
  return makeInput({
    message: "请输入项目名称",
    defaultValue: "",
    validate(v) {
      if (v.length > 0) {
        return true;
      }
      return "项目名称必须输入";
    },
  });
}

// 选择项目模版
function getAddTemplate() {
  return makeList({
    choices: ADD_TEMPLATE,
    message: "请选择项目模版",
  });
}

// 安装缓存目录
function makeTargetPath() {
  console.log(homedir());
  return path.resolve(`${homedir()}/${TEMP_HOME}`, "addTemplate");
}

export default async function createTemplate(name, opts) {
  let { type = null, template = null } = opts;
  let addType, // 创建的项目类型
    addName, // 创建的项目名称
    selectedTemplate; // 创建的项目模版
  if (type) {
    addType = type;
  } else {
    addType = await getAddType();
  }
  log.verbose("addType", addType);
  if (addType === ADD_TYPE_PROJECT) {
    if (name) {
      addName = name;
    } else {
      addName = await getAddName();
    }
    log.verbose("addName", addName);
    if (template) {
      selectedTemplate = ADD_TEMPLATE.find((item) => item.value === template);
      if (!selectedTemplate) {
        throw new Error(`项目模板 ${template} 不存在！`);
      }
    } else {
      const addTemplate = await getAddTemplate();
      selectedTemplate = ADD_TEMPLATE.find(
        (item) => item.value === addTemplate
      );
    }
    log.verbose("selectedTemplate", selectedTemplate);
    // 获取最新的npm版本号
    const latestVersion = await getLatestVersion(selectedTemplate.npmName);
    log.verbose("latestVersion", latestVersion);
    selectedTemplate.version = latestVersion;
    // 安装缓存目录
    const targetPath = makeTargetPath();
    return {
      type: addType,
      name: addName,
      template: selectedTemplate,
      targetPath,
    };
  } else {
    throw new Error(`创建的项目类型 ${addType} 不支持`);
  }
}
