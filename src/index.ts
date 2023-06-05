import { MFInterface } from "./layout/types";
import EventEmitter from "events";
import { SingleSpaCustomEventDetail, getAppStatus, getMountedApps } from "single-spa";
import { buildAppLayout } from "./layout";
import "./styles/index.css";
import { ContainerEl } from "single-spa-layout/dist/types/isomorphic/constructRoutes";
import apiInstance from "./api";

// TODO: кастомный ивент эмиттер
const eventEmitter = new EventEmitter();

const initialMicrofrontends: Array<{
  mf: MFInterface;
  container: ContainerEl;
}> = [
  {
    mf: {
      name: "navbar",
      importUrl: "@navbar-mf",
      activeWhen: "*",
      type: "application",
      props: {
        eventEmitter,
      },
    },
    container: document.getElementById("navigation"),
  },
  {
    mf: {
      name: "home-mf",
      importUrl: "@home-mf",
      activeWhen: "/home",
      type: "route",
    },
    container: document.getElementById("content"),
  },
  {
    mf: {
      name: "settings-mf",
      importUrl: "@settings-mf",
      activeWhen: "/settings",
      type: "route",
    },
    container: document.getElementById("content"),
  },
];

initialMicrofrontends.map((microfrontend) => {
  buildAppLayout([microfrontend.mf], microfrontend.container);
});

/**
 * Во время разработки вставьте сюда локально-запущенный микрофронтенд в формате:
 * {
 *  name: имя микрофронта (тэг, по которому его можно будет отслеживать)
 *  importUrl: юрл микрофронта (указывается при запуске и имеет вид "http://localhost:PORT/microfront-name.js")
 *  activeWhen: путь в браузере, по которому вы хотите видеть свой микрофронт
 *  type: "route" - чтобы микрофронтенд был виден только по роуту, указанному в activeWhen
 * }
 * DOM-элемент, в котором должно отображаться состояние микрофронтенда
 *
 * Пример:
 * buildAppLayout(
 *  [
 *    {
 *      name: "",
 *      importUrl: "",
 *      activeWhen: "",
 *      type: "",
 *      },
 *    ],
 *  document.getElementById("")
 * );
 */

apiInstance.microfrontendService.getMicrofrontends().then((res) => {
  const routes: string[] = [];
  const styles: string[] = [];

  const mfs: MFInterface[] = res.map((val) => {
    routes.push(val.route);
    styles.push(val.styles);

    return {
      name: val.name,
      type: "route",
      importUrl: val.src,
      activeWhen: val.route,
      props: {
        eventEmitter,
      },
    };
  });

  buildAppLayout(mfs, document.getElementById("content"));

  if (getAppStatus("navbar") === "MOUNTED") {
    eventEmitter.emit("navbar", routes);
  } else {
    window.addEventListener("single-spa:app-change", (event: CustomEvent<SingleSpaCustomEventDetail>) => {
      for (const key in event.detail.newAppStatuses) {
        if (key === "navbar" && event.detail.newAppStatuses[key] === "MOUNTED") {
          eventEmitter.emit("navbar", routes);
        }
      }
    });
  }
});
