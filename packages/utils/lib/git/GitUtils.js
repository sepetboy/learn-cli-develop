import { makeList } from "../inquirer.js";
import log from "../log.js";
import Github from "./Github.js";
import Gitee from "./Gitee.js";
import { getGitLogin, getGitOwn, getGitPlatForm } from "./GitServer.js";
export async function initGitServer() {
  let platform = getGitPlatForm();
  if (!platform) {
    platform = await makeList({
      message: "请选择Git平台",
      choices: [
        {
          name: "GitHub",
          value: "github",
        },
        {
          name: "Gitee",
          value: "gitee",
        },
      ],
    });
  }
  let gitAPI;
  log.verbose("platform", platform);
  if (platform === "github") {
    gitAPI = new Github();
  } else {
    gitAPI = new Gitee();
  }
  gitAPI.savePlatForm(platform);
  await gitAPI.init();
  return gitAPI;
}

export async function initGitType(gitAPI) {
  //   仓库类型
  let gitOwn = getGitOwn();
  // 仓库登录名
  let gitLogin = getGitLogin();
  if (!gitLogin && !gitOwn) {
    const user = await gitAPI.getUser();
    const org = await gitAPI.getOrg();
    log.verbose("user", user);
    log.verbose("org", org);
    if (!gitOwn) {
      gitOwn = await makeList({
        message: "请选择仓库类型",
        choices: [
          {
            name: "User",
            value: "user",
          },
          {
            name: "Organization",
            value: "org",
          },
        ],
      });
      log.verbose("gitOwn", gitOwn);
    }
    if (gitOwn === "user") {
      gitLogin = user?.login;
    } else {
      if (Array.isArray(org) && org.length > 0) {
        const orgList = org.map((item) => ({
          name: item.name || item.login,
          value: item.login,
        }));
        gitLogin = await makeList({
          message: "请选择组织",
          choices: orgList,
        });
        log.verbose("gitLogin", gitLogin);
      } else {
        log.info("您未创建过组织");
        return;
      }
    }
  }
  if (!gitLogin || !gitOwn) {
    throw new Error(
      "未获取到用户的Git登录信息！请使用learn-cli commit --clear清除缓存后重试！"
    );
  }
  gitAPI.saveOwn(gitOwn);
  gitAPI.saveLogin(gitLogin);
  return gitLogin;
}

export async function createRemoteRepo(gitAPI, name) {
  const res = await gitAPI.createRepo(name);
}
