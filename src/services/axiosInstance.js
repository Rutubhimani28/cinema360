import axios from "axios";
import { constant } from "../constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import qs from "qs";
import { storeData } from "./localStorage";

const axiosInstance = axios.create({
  baseURL: constant.baseUrl,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const fetchToken = async () => {
  const datas = qs.stringify({
    grant_type: process.env.REACT_APP_AZURE_GRANT_TYPE,
    client_id: process.env.REACT_APP_AZURE_CLIENT_ID,
    client_secret: process.env.REACT_APP_AZURE_CLIENT_SECRET,
    resource: process.env.REACT_APP_AZURE_RESOURCE,
  });

  try {
    const response = await axios.post(
      "https://login.microsoftonline.com/56f89eac-5849-472e-bbb0-ec7848e1c4c3/oauth2/token",
      datas,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "Cache-Control": "no-store, no-cache",
        },
      }
    );
    storeData("token", response.data.access_token);
    storeData("token_exp_time", response.data.expires_in);
    // tokenGet("120")
    tokenGet(response.data.expires_in);
    setToken(response.data.access_token);
  } catch (error) {
    console.error("LLLLLLLLL", error);
  }
};
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.log(
      error.response.status,
      error.response.status === 401,
      !originalRequest._retry,
      "jjjjjjjjjjjjjjjjj"
    );
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // await axios.post(baseURL + 'users/generate-new-token', {}, { withCredentials: true })
        //     .then((response) => {
        //         if (response.status === 200) {
        //             const { accessToken } = response.data;
        //             originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        //             return axiosInstance(originalRequest);
        //         }
        //     })
        //     .catch((refreshError) => {
        //         const { store } = require('../reduxNew/store').configureStore();
        //         const _id = localStorage.getItem("_id");
        //         store.dispatch(logout(_id));
        //         return Promise.reject(refreshError);
        //     })
        const datas = qs.stringify({
          grant_type: process.env.REACT_APP_AZURE_GRANT_TYPE,
          client_id: process.env.REACT_APP_AZURE_CLIENT_ID,
          client_secret: process.env.REACT_APP_AZURE_CLIENT_SECRET,
          resource: process.env.REACT_APP_AZURE_RESOURCE,
        });

        try {
          const response = await axios.post(
            "https://login.microsoftonline.com/56f89eac-5849-472e-bbb0-ec7848e1c4c3/oauth2/token",
            datas,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                "Cache-Control": "no-store, no-cache",
              },
            }
          );
          if (response.status === 200) {
            const token = response.data.access_token;

            storeData("token", token);
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
            // storeData('token_exp_time', response.data.expires_in);
            // tokenGet(response.data.expires_in)
            // setToken(response.data.access_token);
          }
        } catch (error) {
          console.error("LLLLLLLLL", error);
        }
      } catch (refreshError) {
        await AsyncStorage.clear();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
