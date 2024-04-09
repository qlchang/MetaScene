
import BaseTable from "./BaseTable.js"

class ModelTable extends BaseTable {
    constructor() {
        super("XverseDatabase", 1)
    }
    tableName() {
        return "models"
    }
    index() {
        return ["url"]
    }
    keyPath() {
        return "url"
    }
}

const modelTable = new ModelTable();
export { modelTable };