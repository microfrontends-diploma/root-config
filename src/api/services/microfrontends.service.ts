import { MicroserviceDTO } from "../dto/microservices.dto";
import { ExtendedAxiosConfig, NetworkService } from "./network.service";

export class MicrofrontendService extends NetworkService {
  getMicrofrontends = (config?: ExtendedAxiosConfig) => {
    return this.get<MicroserviceDTO[]>("/microfrontends", config) as Promise<MicroserviceDTO[]>;
  };
}
