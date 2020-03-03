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
    await this.runtime.triggerEvent(event);
    return { status: 200 }
  }
}

export {
    AppController,
};
