import { Runtime } from "./runtime";
import { RuntimeServer } from "./http/server";
import { Compiler } from "./storyscript/compiler";
import { AppRepository } from "./postgres/apps";
import { ServiceFactory } from "./service";
import EventRepository from "./events";

async function main() {
    const compiler = new Compiler();
    await compiler.start();

    const serviceFactory: ServiceFactory = new ServiceFactory();
    const appRepository: AppRepository = new AppRepository();
    const eventRepository: EventRepository = new EventRepository();

    const runtime: Runtime = new Runtime(compiler, serviceFactory, appRepository, eventRepository);

    const server: RuntimeServer = new RuntimeServer(runtime);
    server.start('9001');
}

function getEnvOrError(envVar: string): string {
    if (!process.env[envVar]) {
        throw new Error(`Environment variable '` + envVar + `' must be set.`);
    }
    return process.env[envVar] || '';
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
