import axios from "axios";

const BASE_URL = "http://book.youbaobao.xyz:7001"; //C:\Windows\System32\drivers\etc

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

function onSuccess(response) {
  return response.data;
}

function OnFailed(error) {
  return Promise.reject(error);
}

service.interceptors.response.use(onSuccess, OnFailed);

export default service;
