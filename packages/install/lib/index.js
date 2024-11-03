import Command from "@learn-cli-develop/command";
import {
  log,
  Github,
  Gitee,
  makeList,
  getGitPlatForm,
  makeInput,
  printErrorLog,
  initGitServer,
} from "@learn-cli-develop/utils";
import ora from "ora";

const PREV_PAGE = "${prev_page}";
const NEXT_PAGE = "${next_page}";
const SEARCH_MODE = {
  REPO: "search_repo",
  CODE: "search_code",
};

class InstallCommand extends Command {
  // 必须有返回值，不然会报错
  get command() {
    return "install [name]";
  }

  get description() {
    return "description";
  }

  get options() {}

  async action() {
    await this.generateGitAPI();
    await this.searchGitAPI();
    await this.selectTags();
    await this.downloadRepo();
    await this.installDependencies();
    await this.runRepo();
  }

  async runRepo() {
    await this.gitAPI.runRepo(process.cwd(), this.keyword);
  }

  async downloadRepo() {
    const spinner = ora(
      `正在下载:${this.keyword}(${this.selectedTag})`
    ).start();
    try {
      await this.gitAPI.cloneRepo(this.keyword, this.selectedTag);
      spinner.stop();
      log.success(`下载成功：${this.keyword}(${this.selectedTag})`);
    } catch (error) {
      spinner.stop();
      printErrorLog(error);
    }
  }

  async installDependencies() {
    const spinner = ora(
      `正在安装依赖:${this.keyword}(${this.selectedTag})`
    ).start();
    try {
      const res = await this.gitAPI.installDependencies(
        process.cwd(),
        this.keyword,
        this.selectedTag
      );
      spinner.stop();
      if (!res) {
        log.error(`依赖安装失败：：${this.keyword}(${this.selectedTag})`);
      } else {
        log.success(`依赖安装成功：：${this.keyword}(${this.selectedTag})`);
      }
    } catch (error) {
      spinner.stop();
      printErrorLog(error);
    }
  }

  async generateGitAPI() {
    this.gitAPI = await initGitServer();
  }

  async searchGitAPI() {
    // 1、收集搜索关键字和开发语言
    const platform = this.gitAPI.getPlatForm();
    if (platform === "github") {
      this.mode = await makeList({
        message: "请选择搜索的模式",
        choices: [
          {
            name: "仓库",
            value: SEARCH_MODE.REPO,
          },
          {
            name: "源码",
            value: SEARCH_MODE.CODE,
          },
        ],
      });
    } else {
      this.mode = SEARCH_MODE.REPO;
    }
    console.log("this.mode", this.mode);
    this.q = await makeInput({
      message: "请输入搜索关键字",
      validate(value) {
        if (value.length > 0) {
          return true;
        } else {
          return "请输入搜索关键字";
        }
      },
    });
    this.language = await makeInput({
      message: "请输入开发语言",
    });
    this.page = 1;
    this.perPage = 10;
    await this.doSearch();
  }

  async selectTags() {
    this.tagPage = 1;
    this.tagPerPage = 10;
    await this.doSelectTags();
  }

  async doSearch() {
    const platform = this.gitAPI.getPlatForm();
    let searchResult;
    let count;
    let list;
    if (platform === "github") {
      const params = {
        q: this.q + (this.language ? `+language:${this.language}` : ""),
        order: "desc",
        // sort: "stars",
        per_page: this.perPage,
        page: this.page,
      };
      if (this.mode == SEARCH_MODE.REPO) {
        searchResult = await this.gitAPI.searchRepositories(params);
        list = searchResult.items.map((item) => ({
          name: `${item.full_name}(${item.description})`,
          value: item.full_name,
        }));
      } else if (this.mode === SEARCH_MODE.CODE) {
        searchResult = await this.gitAPI.searchCode(params);
        list = searchResult.items.map((item) => ({
          name:
            item.repository.full_name + item.repository.description
              ? item.repository.description
              : "",
          value: item.repository.full_name,
        }));
      }
      count = searchResult.total_count; //整体数据量
    } else if (platform === "gitee") {
      const params = {
        q: this.q,
        order: "desc",
        // sort: "stars_count",
        per_page: this.perPage,
        page: this.page,
      };
      if (this.language) {
        params.language = this.language; //注意输入格式JavaScript
      }
      searchResult = await this.gitAPI.searchRepositories(params);
      list = searchResult.items.map((item) => ({
        name: `${item.full_name}(${item.description})`,
        value: item.full_name,
      }));
      count = 999999; //整体数据量
    } else {
      return;
    }

    // 判断当前页数，是否已经到达最大页数
    if (
      (platform === "github" && this.page * this.perPage < count) ||
      list.length > 0
    ) {
      list.push({
        name: "下一页",
        value: NEXT_PAGE,
      });
    }
    if (this.page > 1) {
      list.unshift({
        name: "上一页",
        value: PREV_PAGE,
      });
    }
    if (count > 0) {
      const keyword = await makeList({
        message:
          platform === "github"
            ? `请选择要下载的项目(共${count}条数据)`
            : "请选择要下载的项目",
        choices: list,
        loop: false,
      });

      if (keyword === NEXT_PAGE) {
        await this.nextPage();
      } else if (keyword === PREV_PAGE) {
        await this.prevPage();
      } else {
        // 下载项目
        this.keyword = keyword;
      }
    }
  }

  async nextPage() {
    this.page++;
    await this.doSearch();
  }

  async prevPage() {
    this.page--;
    await this.doSearch();
  }

  async doSelectTags() {
    const platform = this.gitAPI.getPlatForm();
    let tagsListChoices = [];
    if (platform === "github") {
      const params = {
        page: this.tagPage,
        per_page: this.tagPerPage,
      };
      const tagsList = await this.gitAPI.getTags(this.keyword, params);

      console.log(tagsList);
      tagsListChoices = tagsList.map((item) => ({
        name: item.name,
        value: item.name,
      }));
      if (tagsList.length > 0) {
        tagsListChoices.push({
          name: "下一页",
          value: NEXT_PAGE,
        });
      }
      if (this.tagPage > 1) {
        tagsListChoices.unshift({
          name: "上一页",
          value: PREV_PAGE,
        });
      }
    } else if (platform === "gitee") {
      const tagsList = await this.gitAPI.getTags(this.keyword);
      tagsListChoices = tagsList.map((item) => ({
        name: item.name,
        value: item.name,
      }));
    } else {
      return;
    }

    const selectedTag = await makeList({
      message: "请选择tag",
      choices: tagsListChoices,
    });
    console.log(selectedTag);

    if (selectedTag === NEXT_PAGE) {
      await this.nextTags();
    } else if (selectedTag === PREV_PAGE) {
      await this.prevTags();
    } else {
      // 下载项目
      this.selectedTag = selectedTag;
    }
  }

  async nextTags() {
    this.tagPage++;
    this.doSelectTags();
  }

  async prevTags() {
    this.tagPage--;
    this.doSelectTags();
  }
}

function Install(instance) {
  return new InstallCommand(instance);
}

export default Install;
