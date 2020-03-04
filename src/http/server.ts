import 'reflect-metadata';

import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';

import { Runtime } from '../runtime';

class RuntimeServer {

  constructor(runtime: Runtime) {
    Container.set('runtime', runtime)
  }

  public async start(port: string): Promise<any> {

    useContainer(Container);

    console.log(__dirname)
    const app = createExpressServer({
      controllers: [__dirname + "/controllers/*.*"]
    });

    return app.listen(port);
  }
}

export {
  RuntimeServer,
}