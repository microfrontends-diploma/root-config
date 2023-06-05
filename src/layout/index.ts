import { registerApplication, start } from "single-spa";
import { constructRoutes, constructApplications, constructLayoutEngine } from "single-spa-layout";
import { ContainerEl } from "single-spa-layout/dist/types/isomorphic/constructRoutes";
import { MFInterface } from "./types";

export function buildAppLayout(mfs: MFInterface[], containerEl: ContainerEl) {
  const routes = constructRoutes({
    routes: mfs.map((mf) => {
      return mf.type === "application"
        ? {
            type: "application",
            name: mf.name,
            props: mf.props,
          }
        : {
            type: "route",
            path: mf.activeWhen,
            routes: [{ type: "application", name: mf.name, props: mf.props }],
          };
    }),
    containerEl,
  });

  const applications = constructApplications({
    routes,
    loadApp({ name }) {
      const targetMf = mfs.find((mf) => mf.name === name);

      let url = "";

      if (targetMf) {
        if (targetMf.importUrl) {
          url = targetMf.importUrl;
        }
      }
      return System.import(url);
    },
  });

  const layoutEngine = constructLayoutEngine({ routes, applications });
  applications.forEach(registerApplication);
  layoutEngine.activate();

  start();
}
