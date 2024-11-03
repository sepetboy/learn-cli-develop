<!-- 在cli中装本地的init包 -->

npm i @learn-cli-develop/init -w packages/cli

<!-- lerna创建包 -->

lerna create utils

# learn 教程

https://juejin.cn/post/6980887310980087815

npm config set registry=https://registry.npmmirror.com

# gitee API 地址

https://gitee.com/api/v5/swagger#/getV5User

# git 命令

## 创建 tag

git tag -a release/0.0.2 -m release/0.0.2

## 查看 tag

git tag

## 提交 tag

git push --tags

## 查看远程 tag

git ls-remote --tags
