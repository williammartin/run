import { CompilerOutput } from "./storyscript/types";
import { App } from "./app";
import { ServiceFactory } from "./services/factory";


interface Compiler {
    compile(source: string): Promise<CompilerOutput>
}

interface AppRepository {
    store(app: App): Promise<void>
    load(id: string): Promise<App>
}

interface EventRepository {
    set(appID: string): Promise<string>
    get(eventID: string): Promise<string>
}

interface Event {
    id: string;
    payload: any /*eslint-disable-line @typescript-eslint/no-explicit-any */;
}

class Runtime {

    private compiler: Compiler;
    private serviceFactory: ServiceFactory;
    private appRepository: AppRepository;
    private eventRepository: EventRepository;

    constructor(compiler: Compiler, serviceFactory: ServiceFactory, appRepository: AppRepository, eventRepository: EventRepository) {
        this.compiler = compiler;
        this.serviceFactory = serviceFactory;
        this.appRepository = appRepository;
        this.eventRepository = eventRepository;
    }

    public async deploy(appID: string, source: string): Promise<void> {
        // load existing app and stop / delete it

        const story = await this.compiler.compile(source);

        const app = new App(appID, story, this.serviceFactory, this.eventRepository);
        await app.start();

        await this.appRepository.store(app);
        return Promise.resolve();
    }

    public async triggerEvent(event: Event): Promise<void> {
        const appID = await this.eventRepository.get(event.id);
        const app = await this.appRepository.load(appID);
        return app.exec(event.id, event.payload);
    }
}

export { Runtime }