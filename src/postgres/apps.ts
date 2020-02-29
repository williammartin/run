import { App } from "../app";

class AppRepository {

    private apps: Map<string, App>

    constructor() {
        this.apps = new Map<string, App>();
    }

    public async store(app: App): Promise<void> {
        this.apps.set(app.ID(), app);
    }
    
    public async load(id: string): Promise<App> {
        const app = this.apps.get(id);
        if (app === undefined) {
            return Promise.reject(new Error(`no app found with the id: ${id}`));
        }

        return Promise.resolve(app);
    }
}

export {
    AppRepository,
}