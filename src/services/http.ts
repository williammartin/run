import * as rm from 'typed-rest-client/HttpClient';

import { RuntimeService } from './base';

class HTTPService implements RuntimeService {

  private httpClient: rm.HttpClient;
  private serviceURL: string;

  constructor(serviceURL: string) {
    this.serviceURL = serviceURL;
    this.httpClient = new rm.HttpClient('http-service', [], {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
  }

  public name(): string {
    return 'http';
  }

  public async listen(appID: string, eventID: string, { path }: { path: string }): Promise<void> {
    const body: { appID: string, eventID: string, path: string } = {
      appID,
      eventID,
      path,
    }

    let res: rm.HttpClientResponse = await this.httpClient.post(this.serviceURL + '/listen', JSON.stringify(body))
    if (res.message.statusCode !== 200) {
      return Promise.reject(new Error(`Expected status code to be 200 but was ${res.message.statusCode}`));
    }
  }

  public async unlisten(eventID: string): Promise<void> {
    const body: { eventID: string } = {
      eventID,
    }

    let res: rm.HttpClientResponse = await this.httpClient.post(this.serviceURL + '/unlisten', JSON.stringify(body))
    if (res.message.statusCode !== 200) {
      return Promise.reject(new Error(`Expected status code to be 200 but was ${res.message.statusCode}`));
    }
  }
}

export {
  HTTPService,
}