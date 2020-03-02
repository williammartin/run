import { CompilerOutput } from "./storyscript/types";
import { Executor } from "./storyscript/interpreter/executor";
import { StoryContext, StoryVar, plainToValue, StoryServiceValue } from "./storyscript/interpreter/types";
import { ServiceFactory } from "./service";
import { RuntimeService } from "./services/base";
import EventRepository from "./events";

type Event = {
    eventID: string;
    line: string;
    service: string;
    command: string;
    args: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    output: string;
}

class App {

    public id: string;
    public story: CompilerOutput;
    public context: StoryContext;
    public services: Map<string, RuntimeService>;
    public events: Map<string, Event>;

    constructor(id: string, story: CompilerOutput, serviceFactory: ServiceFactory, private eventRepository: EventRepository) {
        this.id = id;
        this.story = story;
        this.context = new StoryContext();
        this.services = new Map<string, RuntimeService>();
        this.events = new Map<string, Event>();

        story.services.forEach((serviceName: string) => {
            const service = serviceFactory.get(serviceName);
            this.services.set(serviceName, service);
        });
    }

    public async start(): Promise<void> {
        await new Executor(this).run();

        console.log(this.context.frames)
        return Promise.resolve();
    }

    public async exec(eventID: string, payload: any): Promise<void> {
        const event = this.events.get(eventID);
        // TODO: Handle this properly
        if (event === undefined) {
            return
        }
        const safeVar = plainToValue(payload);
        this.context.setVar(event.output, new StoryVar(event.output, safeVar));
        await new Executor(this).exec(event.line);
    }

    public setupEvent(
        service: string,
        command: string,
        args: {
          [argName: string]: any /*eslint-disable-line @typescript-eslint/no-explicit-any */;
        },
        line: string,
        output: string
      ): string {
        // const eventID = await events.register(this.id);
        // TODO: check params
        // TODO: auto-inject custom-params based on attributes
        const eventID = 'foo';
        this.eventRepository.set(eventID, this.id);
        const event: Event = {
          output,
          line,
          service: service,
          eventID,
          command,
          args
        };
        
        this.events.set(eventID, event);
        return eventID;
      }

    //   public serialise(): string {
    //     const services = mapValues(this.services, service => service.serialize());
    //     let context = omitBy(this.context, (v, k) => k === "app");
    //     context = classToPlain(context);
    //     // TODO: serialize context
    //     return JSON.stringify({
    //       id: this.id,
    //       events: this.events,
    //       context,
    //       services,
    //       story: this.story,
    //     });
    //   }
    
    //   /**
    //    * Allows to load an app from the database into memory.
    //    */
    //   public static from(value: string): App {
    //     const { services, story, context, id, ...attrs } = JSON.parse(value);
    //     const app = Object.assign(new App(id, story), attrs);
    
    //     // restore service attributes
    //     forEach(services, (
    //       v: any /*eslint-disable-line @typescript-eslint/no-explicit-any */,
    //       k: string
    //     ) => {
    //       Object.assign(app.services[k], v);
    //     });
    
    //     // context requires more special work
    //     // 1) deserialize + inject app into the context
    //     const restoredContext = plainToClass(StoryContext, context);
    //     Object.defineProperty(restoredContext, "app", {
    //       value: app,
    //       writable: false,
    //     });
    //     app.context = restoredContext;
    
    //     // 2) fix-up service vars and inject the full service
    //     forEach(app.context.frames, frame => {
    //       forEach(frame, v => {
    //         const val = v.value;
    //         if (val instanceof StoryServiceValue) {
    //           Object.defineProperty(val, "_value", {
    //             value: app.services[(val.value() as unknown) as string],
    //             writable: false,
    //           });
    //         }
    //       });
    //     });
    //     return app;
    //   }

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