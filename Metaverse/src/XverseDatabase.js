class XverseDatabase extends Dexie$1 {
    constructor() {
        super("XverseDatabase1");
        this.version(1).stores({
            models: "++id,name"
        }),
        this.models = this.table("models")
    }
}