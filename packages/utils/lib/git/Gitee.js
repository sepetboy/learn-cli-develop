import axios from "axios";
import { GitServer } from "./GitServer.js";
import log from "../log.js";

const BASE_URL = "https://gitee.com/api/v5"; //https://gitee.com/api/v5/swagger#/getV5User

class Gitee extends GitServer {
  constructor() {
    super();
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
    });
    // this.service.interceptors.request.use(
    //   (config) => {
    //     config.headers["Authorization"] = `Bearer ${this.token}`;
    //     config.headers["Accept"] = "application/vnd.github+json";
    //     return config;
    //   },
    //   (error) => {
    //     return Promise.reject(error);
    //   }
    // );
    this.service.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  get(url, params, headers) {
    return this.service({
      url,
      params: {
        ...params,
        access_token: this.token,
      },
      method: "get",
      headers,
    });
  }

  post(url, data, headers) {
    return this.service({
      url,
      data: {
        ...data,
      },
      params: {
        access_token: this.token,
      },
      method: "post",
      headers,
    });
  }

  searchRepositories(params) {
    return this.get("/search/repositories", params);
  }

  searchCode(params) {
    return this.get("/search/code", params);
  }

  getTags(fullName, params) {
    return this.get(`/repos/${fullName}/tags`);
  }

  getRepoUrl(fullName) {
    return `https://gitee.com/${fullName}.git`;
  }

  getUser() {
    return this.get("/user");
  }

  getOrg() {
    return this.get("/user/orgs");
  }

  getRepo(owner, repo) {
    console.log(owner, repo);
    return this.get(`/repos/${owner}/${repo}`).catch((err) => {
      return null;
    });
  }

  async createRepo(name) {
    // 判断仓库已经存在，如果存在则跳过创建
    const repo = await this.getRepo(this.login, name);
    if (!repo) {
      log.info("仓库不存在，开始创建");
      if (this.own === "user") {
        return this.post("/user/repos", { name });
      } else if (this.own === "org") {
        return this.post("/orgs/" + this.login + "/repos", { name });
      }
    } else {
      log.info("仓库已存在，直接返回");
    }
    return repo;
  }
}

export default Gitee;
