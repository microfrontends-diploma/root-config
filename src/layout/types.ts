import { RegisterApplicationConfig } from "single-spa";

export interface MFInterface extends Omit<RegisterApplicationConfig, "app"> {
  type: "route" | "application";
  importUrl?: string;
  props?: Record<string, any>;
}
