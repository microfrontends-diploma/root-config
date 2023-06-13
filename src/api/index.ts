import { MicrofrontendService } from "./services/microfrontends.service";
import axios from "axios";

const axiosInstance = axios.create({
  // переменная, объявленная при помощи webpack.Define
  // @ts-ignore
  baseURL: `${API_URL}:3030`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export class Api {
  microfrontendService: MicrofrontendService | null = null;

  constructor() {
    this.microfrontendService = new MicrofrontendService(axiosInstance);
  }
}

const apiInstance = new Api();

export default apiInstance;
