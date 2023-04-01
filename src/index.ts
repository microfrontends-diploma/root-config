import { MFInterface } from "./layout/types";
import EventEmitter from "events";
import { SingleSpaCustomEventDetail } from "single-spa";
import { buildAppLayout } from "./layout";

type ServerResponse = { name: string; src: string; route: string };

const evEmitter = new EventEmitter();

buildAppLayout(
  [
    {
      name: "navbar",
      importUrl: "@navbar",
      activeWhen: "*",
      type: "application",
      props: {
        evEmitter,
      },
    },
  ],
  document.getElementById("navigation")
);

// регистрация микрофронтов после запроса на их получение
// FIXME: захардкоженный юрл
fetch("http://localhost:3030/microfrontends").then((res) => {
  res.json().then((result: ServerResponse[]) => {
    const routes = [];

    const mfs: MFInterface[] = result.map((val) => {
      routes.push(val.route);

      return {
        name: val.name,
        type: "route",
        // TODO: заменить на url, который будет присылать сам микрофронтенд
        importUrl: `http://localhost:3030/${val.src}`,
        activeWhen: val.route,
      };
    });

    buildAppLayout(mfs, document.getElementById("content"));

    window.addEventListener(
      "single-spa:app-change",
      (event: CustomEvent<SingleSpaCustomEventDetail>) => {
        for (const key in event.detail.newAppStatuses) {
          if (
            key === "navbar" &&
            event.detail.newAppStatuses[key] === "MOUNTED"
          ) {
            // FIXME: кастомный ивент эмиттер
            evEmitter.emit("routes", routes);
          }
        }
      }
    );
  });
});
