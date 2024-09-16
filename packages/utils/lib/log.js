import log from "npmlog";
import isDebug from "./isDebug.js";

if (isDebug()) {
  log.level = "verbose"; //debugger模式也能展示
} else {
  log.level = "info"; //info以上级别都能展示
}

log.heading = "learn-cli";
log.addLevel("success", 2000, { fg: "green", bg: "red", bold: true }); //可以使用log.success打印日志

export default log;
