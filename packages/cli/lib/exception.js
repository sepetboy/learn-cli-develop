import { log, isDebug } from "@learn-cli-develop/utils";

function printErrorLog(e, type) {
  if (isDebug()) {
    log.error(type, e);
  } else {
    log.error(type, e.message);
  }
}

// 监听报错
process.on("uncaughtException", (e) => {
  printErrorLog(e, "error");
});

process.on("unhandledRejection", (e) => {
  printErrorLog(e, "promise");
});
