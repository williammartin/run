import { RuntimeService } from "./base";

class LogService implements RuntimeService {

    public name(): string {
        return 'log';
    }

    public async info({ msg }: { msg: string }): Promise<void> {
        console.log({ msg });
    }
}

export {
    LogService,
}