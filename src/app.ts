import { CompilerOutput } from "./storyscript/types";
import { Executor } from "./storyscript/interpreter/executor";
import { StoryContext } from "./storyscript/interpreter/types";
import { ServiceFactory } from "./service";
import { RuntimeService } from "./services/base";

class App {

    private id: string;
    private story: CompilerOutput;
    private context: StoryContext;
    private services: Map<string, RuntimeService>;

    constructor(id: string, story: CompilerOutput, serviceFactory: ServiceFactory) {
        this.id = id;
        this.story = story;
        this.context = new StoryContext();
        this.services = new Map<string, RuntimeService>();

        story.services.forEach((serviceName: string) => {
            const service = serviceFactory.get(serviceName);
            this.services.set(serviceName, service);
        });
    }

    public async start(): Promise<void> {
        await new Executor(this.story, this.context, this.services).run();
        return Promise.resolve();
    }

    // public serialise(): string {
    //     return this.id
        // const services = mapValues(this.services, service => service.serialize());
        // let context = omitBy(this.context, (v, k) => k === "app");
        // context = classToPlain(context);
        // // TODO: serialize context
        // return JSON.stringify({
        //   id: this.id,
        //   events: this.events,
        //   context,
        //   services,
        //   story: this.story,
        // });
    // }

    // public static from(seralised: string): App {
        // return new App(seralised, {} as CompilerOutput);
    // }
}

export {
    App,
}