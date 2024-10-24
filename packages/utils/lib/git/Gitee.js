import axios from "axios";
import { GitServer } from "./GitServer.js";

const BASE_URL = "https://gitee.com/api/v5";

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

  post() {}

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
}

export default Gitee;
