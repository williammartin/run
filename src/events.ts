export default class EventRepository {

    private events: Map<string, string>

    constructor() {
        this.events = new Map<string, string>();
    }

    public async set(eventID: string, appID: string): Promise<void> {
        this.events.set(eventID, appID);
    }

    public async get(eventID: string): Promise<string> {
        return this.events.get(eventID)!;
    }
}