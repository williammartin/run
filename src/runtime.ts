import { CompilerOutput } from "./storyscript/types";
import { App } from "./app";
import { ServiceFactory } from "./service";

interface Compiler {
    compile(source: string): Promise<CompilerOutput>
}

interface AppRepository {
    store(app: App): Promise<void>
    load(id: string): Promise<App>
}

interface EventRepository {
    store(event: Event): Promise<void>
    load(id: string): Promise<App>
}

interface Event {
    appID: string,
    eventID: string,
    payload: any,
}

class Runtime {

    private compiler: Compiler;
    private serviceFactory: ServiceFactory;
    // private appRepository: AppRepository;

    constructor(compiler: Compiler, serviceFactory: ServiceFactory) {
        this.compiler = compiler;
        this.serviceFactory = serviceFactory;
        // this.appRepository = appRepository;
    }

    public async deploy(appID: string, source: string): Promise<void> {
        // load existing app and stop / delete it

        const story = await this.compiler.compile(source);

        const app = new App(appID, story, this.serviceFactory);
        await app.start();

        return Promise.resolve();
        // this.appRepository.store(app);
    }

    // public async handleEvent(event: Event): Promise<void> {
    //     const app = this.appRepository.load(event.appID);
    //     await app.trigger(event);
    // }
}

export { Runtime }