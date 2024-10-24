import path from "node:path";
import fse from "fs-extra";
import { pathExistsSync } from "path-exists";
import ora from "ora";
import ejs from "ejs";
import { glob } from "glob";
import { log, makeList, makeInput } from "@learn-cli-develop/utils";

function getCacheFilePath(targetPath, template) {
  return path.resolve(targetPath, "node_modules", template.npmName, "template");
}

function getPluginFilePath(targetPath, template) {
  return path.resolve(
    targetPath,
    "node_modules",
    template.npmName,
    "plugins",
    "index.js"
  );
}

function copyFile(targetPath, template, installDir) {
  const originFile = getCacheFilePath(targetPath, template);
  const fileList = fse.readdirSync(originFile);
  const spinner = ora("正在拷贝模版文件...").start();
  fileList.map((file) => {
    fse.copySync(`${originFile}/${file}`, `${installDir}/${file}`);
  });
  spinner.stop();
  log.success("模板拷贝成功");
}

async function ejsRender(targetPath, installDir, template, name) {
  let files = [];
  const { ignore } = template;
  // 执行插件
  let data = {};
  const pluginPath = getPluginFilePath(targetPath, template);
  if (pathExistsSync(pluginPath)) {
    // window 环境读取文件需要添加file://协议
    const pluginFn = (await import("file://" + pluginPath)).default;
    const api = {
      makeList,
      makeInput,
    };
    data = await pluginFn(api);
  }
  const ejsData = {
    data: {
      name, // 项目名称
      ...data,
    },
  };
  try {
    files = await glob("**", {
      cwd: installDir,
      nodir: true,
      ignore: [...ignore, "**/node_modules/**"],
    });
    files.forEach((file) => {
      const filePath = path.join(installDir, file);
      log.verbose("ejsRender", filePath);
      ejs.renderFile(filePath, ejsData, (err, result) => {
        if (!err) {
          fse.writeFileSync(filePath, result);
        } else {
          log.error("ejs.renderFile", err);
        }
      });
    });
  } catch (error) {
    log.error("ejsRender", error);
  }
}

export default async function installTemplate(selectedTemplate, opts) {
  const { force = false } = opts;
  const { targetPath, name, template } = selectedTemplate;
  const rootDir = process.cwd(); //当前路径
  fse.ensureDirSync(targetPath);
  const installDir = path.resolve(`${rootDir}/${name}`);
  if (pathExistsSync(installDir)) {
    if (!force) {
      log.error(`当前目录下已存在${installDir}文件夹`);
    } else {
      fse.removeSync(installDir);
      fse.ensureDirSync(installDir);
    }
  } else {
    fse.ensureDirSync(installDir);
  }
  copyFile(targetPath, template, installDir);
  await ejsRender(targetPath, installDir, template, name);
}
