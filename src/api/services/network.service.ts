import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export interface ExtendedAxiosConfig extends AxiosRequestConfig {
  retrieveAllData?: boolean;
}

/**
 * По идее это должен быть общий модуль взаимодействия с апи
 */
export class NetworkService {
  protected networkModule: AxiosInstance = null;

  // TODO: нужно ли делать так, чтобы сюда можно было передать любой модуль взаимодействия с сетью а не только axios?
  constructor(networkModule: AxiosInstance) {
    this.networkModule = networkModule;

    // TODO: подумать над тем, как можно воткнуть перехватчики
    // this.networkModule.interceptors.response.use();
  }

  protected async get<R>(url: string, config?: ExtendedAxiosConfig): Promise<AxiosResponse<R> | R> {
    const result = await this.networkModule.get<R>(url, config);
    return config?.retrieveAllData ? result : result.data;
  }

  protected async post<D, R>(
    url: string,
    data: D,
    config: ExtendedAxiosConfig = { retrieveAllData: false }
  ): Promise<AxiosResponse<R> | R> {
    const result = await this.networkModule.post<R, AxiosResponse<R>, D>(url, data, config);
    return config?.retrieveAllData ? result : result.data;
  }

  // TODO: добавить в случае необходимости
  private put<T>(): T {
    return null;
  }

  private patch<T>(): T {
    return null;
  }

  private delete() {
    return null;
  }
}
