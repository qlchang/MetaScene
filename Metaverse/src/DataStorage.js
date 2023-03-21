/*
class DataStorage{
    static _GetStorage() {
        try {
            return localStorage.setItem("test", ""),
            localStorage.removeItem("test"),
            localStorage
        } catch {
            const e = {};
            return {
                getItem: t=>{
                    const r = e[t];
                    return r === void 0 ? null : r
                }
                ,
                setItem: (t,r)=>{
                    e[t] = r
                }
            }
        }
    }
    static ReadString(e, t) {
        const r = this._Storage.getItem(e);
        return r !== null ? r : t
    }
    static WriteString(e, t) {
        this._Storage.setItem(e, t)
    }
    static ReadBoolean(e, t) {
        const r = this._Storage.getItem(e);
        return r !== null ? r === "true" : t
    }
    static WriteBoolean(e, t) {
        this._Storage.setItem(e, t ? "true" : "false")
    }
    static ReadNumber(e, t) {
        const r = this._Storage.getItem(e);
        return r !== null ? parseFloat(r) : t
    }
    static WriteNumber(e, t) {
        this._Storage.setItem(e, t.toString())
    }
};
*/