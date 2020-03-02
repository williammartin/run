import { RuntimeService } from "./base";
import * as rm from 'typed-rest-client/HttpClient';

class HTTPService implements RuntimeService {

  private httpClient: rm.HttpClient;
  private serviceURL: string;

  constructor(serviceURL: string) {
    this.serviceURL = serviceURL;
    this.httpClient = new rm.HttpClient('graphile-worker', [], {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
  }

  public name(): string {
    return 'http';
  }

  // public async listen({ eventID, path }: { eventID: string, path: string }): Promise<void> {
  public async listen(appID: string, eventID: string, { path }: { path: string }): Promise<void> {

    // console.log(args);
    // const appID = this.app!.id;
    // logger.debug("http.listen: ", { eventID, path });
    // const req: ListenRequest = {
    //   eventID,
    //   appID,
    //   path,
    // };
    // await httpService("/listen", req);

    const body: { appID: string, eventID: string, path: string } = {
      appID,
      eventID,
      path,
    }
    
    console.log(body);

    let res: rm.HttpClientResponse = await this.httpClient.post(this.serviceURL + '/listen', JSON.stringify(body))
    if (res.message.statusCode !== 200) {
        return Promise.reject(new Error(`Expected status code to be 200 but was ${res.message.statusCode}`));
    }
  }
}

export {
  HTTPService,
}