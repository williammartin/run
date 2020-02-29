import { CompilerOutput } from "./storyscript/types";
import { App } from "./app";

interface Compiler {
    compile(source: string): Promise<CompilerOutput>
}

interface AppRepository {
    store(app: App): Promise<void>
    load(id: string): Promise<App>
}

class Runtime {

    private compiler: Compiler;
    // private appRepository: AppRepository;

    constructor(compiler: Compiler, appRepository: AppRepository) {
        this.compiler = compiler;
        // this.appRepository = appRepository;
    }

    public async deploy(appID: string, source: string): Promise<void> {
        // load existing app and stop / delete it

        const story = await this.compiler.compile(source);

        const app = new App(appID, story);
        await app.start();

        return Promise.resolve();
        // this.appRepository.store(app);
    }
}

export { Runtime }