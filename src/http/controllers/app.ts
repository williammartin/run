import { JsonController, Body, Post } from "routing-controllers";
import { Runtime } from "../../runtime";
import {Container} from "typedi";


interface AppRequest {
  appID: string;
}

interface AppResponse {
  appID: string;
}

interface DeployRequest extends AppRequest {
  source: string;
  appID: string;
}

interface DeployResponse extends AppResponse {
  status: number;
}

interface Event {
  id: string;
  payload: any /*eslint-disable-line @typescript-eslint/no-explicit-any */;
}

@JsonController("/app")
class AppController {

  private runtime: Runtime

  // Injected by routing-controller
  constructor(container: Container) {
    this.runtime = Container.get('runtime');
  }

  @Post("/deploy")
  public async deploy(@Body() req: DeployRequest): Promise<DeployResponse> {
      await this.runtime.deploy(req.appID, req.source)
      return { status: 200, appID: req.appID }
  }

  @Post("/events")
  async handleEvents(@Body() event: Event): Promise<object> {
    console.log(event);

    await this.runtime.triggerEvent(event);
    return { status: 200 }

    // // don't load from memory as the request might be on a different worker
    // // simulate deserializing instead
    // // TODO: log event + track event execution errors
    // const appID = await events.getApp(event.id);
    // const app = apps[appID];
    // if (app === undefined) {
    //   throw new Error(
    //     `Invalid event: ${event.id}. App: ${appID} doesn't exist.`
    //   );
    // }
    // const storedApp = apps[appID].storedApp!;
    // const runtimeApp = App.load(storedApp);
    // await runtimeApp.triggerEvent(event.id, event.payload);
    return {};
  }
}

export {
    AppController,
};
