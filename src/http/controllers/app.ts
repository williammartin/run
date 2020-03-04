import { Body, JsonController, Post } from 'routing-controllers';
import { Container } from 'typedi';

import { Runtime } from '../../runtime';


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
    console.log(`received deploy request: ${req}`)
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
