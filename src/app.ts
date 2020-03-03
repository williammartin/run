import { CompilerOutput } from "./storyscript/types";
import { Executor } from "./storyscript/interpreter/executor";
import { StoryContext, StoryVar, plainToValue, StoryServiceValue } from "./storyscript/interpreter/types";
import { ServiceFactory } from "./services/factory";
import { RuntimeService } from "./services/base";

interface EventRepository {
    set(appID: string): Promise<string>
}

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
        return new Executor(this).run();
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

    public async setupEvent(
        service: string,
        command: string,
        args: {
            [argName: string]: any /*eslint-disable-line @typescript-eslint/no-explicit-any */;
        },
        line: string,
        output: string
    ): Promise<string> {
        const eventID = await this.eventRepository.set(this.id);
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
}

export {
    App,
}