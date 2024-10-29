import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";

export default [
  { files: ["**/*.{js,mjs,cjs,vue}"] },
  { languageOptions: { globals: globals.browser } }, // browser 属性AudioWorkletGlobalScope有个空格（太坑了，手动去掉它）
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
];
// export default {
//   env: {
//     browser: true,
//     es2021: true,
//   },
//   extends: ["plugin:vue/vue3-essential", "airbnb-base"],
//   overrides: [],
//   parserOptions: {
//     ecmaVersion: "latest",
//     sourceType: "module",
//   },
//   plugins: ["vue"],
//   rules: {},
// };
