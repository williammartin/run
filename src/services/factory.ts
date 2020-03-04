import { RuntimeService } from './base';
import { HTTPService } from './http';
import { LogService } from './log';

class ServiceFactory {

    public get(name: string): RuntimeService {
        switch (name) {
            case 'log':
                return new LogService();
            case 'http':
                // TODO: Inject service configuration
                return new HTTPService(process.env.HTTP_SERVICE_URL!);
            default:
                return new NonExistentService(name);
        }
    }
}

class NonExistentService implements RuntimeService {

    private nonExistentName: string;

    constructor(name: string) {
        this.nonExistentName = name;
    }

    public name(): string {
        throw new Error(`${this.nonExistentName} does not exist.`);
    }
}

export {
    ServiceFactory,
}