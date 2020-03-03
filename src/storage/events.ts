import { v4 as uuid } from 'uuid'

class EventRepository {

    private events: Map<string, string>

    constructor() {
        this.events = new Map<string, string>();
    }

    public async set(appID: string): Promise<string> {
        const eventID = uuid();
        this.events.set(eventID, appID);
        return eventID;
    }

    public async get(eventID: string): Promise<string> {
        return this.events.get(eventID)!;
    }
}

export {
    EventRepository,
}