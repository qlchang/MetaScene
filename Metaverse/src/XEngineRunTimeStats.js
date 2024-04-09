import RunTimeArray from "./RunTimeArray.js"

export default class XEngineRunTimeStats {
    constructor() {
        E(this, "timeArray_loadStaticMesh", new RunTimeArray);
        E(this, "timeArray_updateStaticMesh", new RunTimeArray);
        E(this, "timeArray_addAvatarToScene", new RunTimeArray)
    }
}