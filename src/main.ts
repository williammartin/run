import { Runtime } from "./runtime";
import { RuntimeServer } from "./http/server";
import { Compiler } from "./storyscript/compiler";
import { AppRepository } from "./postgres/apps";

async function main() {
    const compiler = new Compiler();
    await compiler.start();

    const appRepository: AppRepository = new AppRepository();
    const runtime: Runtime = new Runtime(compiler, appRepository);

    const server: RuntimeServer = new RuntimeServer(runtime);
    server.start('3000');
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
