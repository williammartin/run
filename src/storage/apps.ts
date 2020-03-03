import { App } from '../app';

class AppRepository {

    private apps: Map<string, App>

    constructor() {
        this.apps = new Map<string, App>();
    }

    public async store(app: App): Promise<void> {
        this.apps.set(app.id, app);
    }

    public async load(id: string): Promise<App> {
        const app = this.apps.get(id);
        if (app === undefined) {
            return Promise.reject(new Error(`no app found with the id: ${id}`));
        }

        return Promise.resolve(app);
    }

    public async contains(id: string): Promise<boolean> {
        return this.apps.has(id);
    }

    public async log(): Promise<void> {
        console.log(this.apps);
    }
}

export {
    AppRepository,
}