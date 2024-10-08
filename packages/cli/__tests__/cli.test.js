import path from "node:path";
import { execa } from "execa";

const CLI = path.join(__dirname, "../bin/cli.js");
const bin =
  () =>
  (...args) =>
    execa(CLI, args);

test("run error command", async () => {
  const { stderr } = await bin()("iii");
  console.log(stderr);
  expect(stderr).toContain("未知的命令：iii"); //监听内容，返回结果
});

// 测试help命令不报错
test("should not throw error when use --help", async () => {
  let error = null;
  try {
    await bin()("--help");
  } catch (e) {
    error = e;
  }
  expect(error).toBe(null);
});

// 测试version正确显示
test("show correct version", async () => {
  const { stdout } = await bin()("-V");
  expect(stdout).toContain(require("../package.json").version);
});

// 测试是否正确开启debug模式
test("open debug mode", async () => {
  let error = null;
  try {
    await bin()("--debug");
  } catch (e) {
    error = e;
  }
  expect(error.message).toContain("launch debug mode");
});
