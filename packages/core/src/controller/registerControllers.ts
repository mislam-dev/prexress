import { Application, createRouter, Handler } from "@prexress/frm";
import "reflect-metadata";
import { container } from "tsyringe";
import {
  CONTROLLER_KEY,
  CONTROLLER_MIDDLEWARE_KEY,
  DTO_KEY,
  MIDDLEWARE_KEY,
  ROUTE_KEY,
} from "../decorator/decorator.keys";
import { RouteDefinition } from "../decorator/router.decorator";
import { validateDtoHandler } from "../validator/class-schema.validator";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
type Constructor = new (...args: any[]) => {};
type ControllerMetaData = {
  basePath: string;
  routes: RouteDefinition[];
  middlewares: Handler[];
};

export function registerController(
  app: Application,
  controllers: Constructor[],
) {
  controllers.forEach((Controller: Constructor) => {
    const controllerInstance = container.resolve(Controller);

    const controllerMetaData: ControllerMetaData = {
      basePath: Reflect.getMetadata(CONTROLLER_KEY, Controller),
      routes: Reflect.getMetadata(
        ROUTE_KEY,
        Controller.prototype,
      ) as RouteDefinition[],
      middlewares:
        (Reflect.getMetadata(
          CONTROLLER_MIDDLEWARE_KEY,
          Controller,
        ) as Handler[]) || [],
    };

    if (!controllerMetaData.basePath) {
      throw new Error(
        `[registerController]: base must be defined for controller ${Controller.name}`,
      );
    }
    if (!controllerMetaData.routes.length) {
      throw new Error(
        `[registerController]: routes must be defined for controller ${Controller.name}`,
      );
    }

    const router = createRouter();

    if (controllerMetaData.middlewares.length > 0) {
      controllerMetaData.middlewares.forEach((m) => {
        router.use(m);
      });
      console.log("[registerController]: controllers middlewares applied!");
    }

    controllerMetaData.routes.forEach((route: RouteDefinition) => {
      if (!(route.methodName in controllerInstance)) {
        throw new Error(
          `[registerController]: method ${route.methodName} not defined in controller ${Controller.name}`,
        );
      }
      const dto = Reflect.getMetadata(
        DTO_KEY,
        Controller.prototype,
        route.methodName,
      );

      const middlewares =
        (Reflect.getMetadata(
          MIDDLEWARE_KEY,
          Controller.prototype,
          route.methodName,
        ) as Handler[]) || [];

      const dtoHandler = dto ? [validateDtoHandler(dto)] : [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = (controllerInstance as any)[route.methodName].bind(
        controllerInstance,
      );

      router[route.method](
        route.path,
        ...[...middlewares, ...dtoHandler, handler],
      );
    });
    app.use(controllerMetaData.basePath, router);
  });
}
