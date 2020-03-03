import { RuntimeService } from './services/base';
import { ServiceFactory } from './services/factory';
import { Executor } from './storyscript/interpreter/executor';
import { plainToValue, StoryContext, StoryVar } from './storyscript/interpreter/types';
import { CompilerOutput } from './storyscript/types';

interface EventRepository {
    set(appID: string): Promise<string>
    remove(eventID: string): Promise<void>
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

    public async stop(): Promise<void> {
        console.log(this.events);
        const deregistrations: Promise<void>[] = []
        this.events.forEach((event: Event) => {
            deregistrations.push(this.deregisterEvent(event))
        });

        await Promise.all(deregistrations);
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

    public async registerEvent(
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

        console.log(event);

        this.events.set(eventID, event);
        return eventID;
    }

    public async deregisterEvent(event: Event): Promise<void> {
        console.log(event)

        const service = this.services.get(event.service);
        // It's sad that service calls are split between here and the executor. Perhaps the executor should call back out for both actions and events
        const method = (service as any)[`un${event.command}`] as UnlistenFn; // eslint-disable-line @typescript-eslint/no-explicit-any
        await method.call(service, event.eventID);

        this.events.delete(event.eventID);
        await this.eventRepository.remove(event.eventID);
    }
}

type UnlistenFn = (eventID: string) => Promise<void>;

export {
    App,
}