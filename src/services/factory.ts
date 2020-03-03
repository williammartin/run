import { RuntimeService } from "./services/base";
import { LogService } from "./services/log";
import { HTTPService } from "./services/http";

class ServiceFactory {

    public get(name: string): RuntimeService {
        switch(name) {
            case 'log':
                return new LogService();
            case 'http':
                return new HTTPService('http://localhost:9000');
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