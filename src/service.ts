import { RuntimeService } from "./services/base";
import { LogService } from "./services/log";

class ServiceFactory {

    public get(name: string): RuntimeService {
        switch(name) {
            case 'log':
                return new LogService();
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