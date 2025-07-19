import { GroupChat } from "whatsapp-web.js";

export class MemoryGroupRepository {

    private groups: GroupChat[]

    public constructor() {
        this.groups = []
    }

    public getGroups(): GroupChat[] {
        return this.groups;
    }

    public setGroups(groups: GroupChat[]): void {
        this.groups = groups;
    }

}