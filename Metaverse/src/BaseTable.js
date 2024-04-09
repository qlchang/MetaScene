import Logger from "./Logger.js"

const logger = new Logger('db')
export default class BaseTable {
    constructor(dbName, dbVersion) {
        this.db = null
        this.isCreatingTable = !1
        this.hasCleared = !1
        this.dbName = dbName,
        this.dbVersion = dbVersion
    }
    async clearDataBase(e) {
        if(!this.hasCleared){
            e && (this.hasCleared = !0)
            if(!window.indexedDB.databases){
                return Promise.resolve()
            }   
            else{
                return new Promise((resolve,reject)=>{
                    const dBDeleteRequest = window.indexedDB.deleteDatabase(this.dbName);
                    dBDeleteRequest.onsuccess = ()=>{
                        resolve()
                    },
                    dBDeleteRequest.onerror = reject
                })
            }
        }
    }
    tableName() {
        throw new Error("Derived class have to override 'tableName', and set a proper table name!")
    }
    keyPath() {
        throw new Error("Derived class have to override 'keyPath', and set a proper index name!")
    }
    index() {
        throw new Error("Derived class have to override 'index', and set a proper index name!")
    }
    async checkAndOpenDatabase() {
        if(this.db){
            return Promise.resolve(this.db)
        }
        else{
            return new Promise((resolve,reject)=>{
                const timeoutId = setTimeout(()=>{
                    logger.info("wait db to open for", 200);
                    if(this.db){
                        resolve(this.db);
                    }
                    else{
                        resolve(this.checkAndOpenDatabase());
                    }
                    clearTimeout(timeoutId)
                }
                , 200);
                this.openDatabase(this.dbName, this.dbVersion || 1, ()=>{
                    this.db && !this.isCreatingTable && resolve(this.db);
                    logger.info(`successCallback called, this.db: ${!!this.db}, this.isCreatingStore: ${this.isCreatingTable}`);
                    clearTimeout(timeoutId);
                }
                , ()=>{
                    reject(new Error("Failed to open database!"));
                    clearTimeout(timeoutId);
                }
                , ()=>{
                    this.db && resolve(this.db);
                    clearTimeout(timeoutId);
                    logger.info(`successCallback called, this.db: ${!!this.db}, this.isCreatingStore: ${this.isCreatingTable}`);
                }
                )
            }
            )
        }
    }

    openDatabase(dbName, version, resolve, reject, complete) {
        if (this.isCreatingTable)
        {
            return;
        }
        this.isCreatingTable = !0;
        logger.info(dbName, version);
        const dBOpenRequest = window.indexedDB.open(dbName, version);
        const tableName = this.tableName();
        dBOpenRequest.onsuccess = _event=>{
            this.db = dBOpenRequest.result;
            logger.info(`IndexedDb ${dbName} is opened.`);
            this.db.objectStoreNames.contains(tableName) && (this.isCreatingTable = !1);
            resolve && resolve(_event)
        };
        
        dBOpenRequest.onerror = _event=>{
            var u;
            logger.error("Failed to open database", (u = _event == null ? void 0 : _event.srcElement) == null ? void 0 : u.error);
            this.isCreatingTable = !1;
            reject && reject(_event);
            this.clearDataBase(!0);
        };
        
        dBOpenRequest.onupgradeneeded = _event=>{
            const u = _event.target.result;
            const _index = this.index();
            logger.info(`Creating table ${tableName}.`);
            let h = u.objectStoreNames.contains(tableName);
            if (h)
                h = u.transaction([tableName], "readwrite").objectStore(tableName);
            else {
                const keyPath = this.keyPath();
                h = u.createObjectStore(tableName, {
                    keyPath: keyPath
                })
            }

            _index.map(f=>{
                h.createIndex(f, f, {
                    unique: !1
                })
            });

            this.isCreatingTable = !1;
            logger.info(`Table ${tableName} opened`);
            complete && complete(_event);
        };
    }
    async add(e) {
        const tableName = this.tableName();
        const promise = (await this.checkAndOpenDatabase()).transaction([tableName], "readwrite").objectStore(tableName).add(e);
        return new Promise(function(resolve, reject) {
            promise.onsuccess = l=>{
                resolve(l)
            }
            ,
            promise.onerror = l=>{
                var u;
                logger.error((u = l.srcElement) == null ? void 0 : u.error),
                reject(l)
            }
        }
        )
    }
    async put(e) {
        const tableName = this.tableName();
        const promise = (await this.checkAndOpenDatabase()).transaction([tableName], "readwrite").objectStore(tableName).put(e);
        return new Promise(function(resolve, reject) {
            promise.onsuccess = l=>{
                resolve(l)
            }
            ,
            promise.onerror = l=>{
                var u;
                logger.error("db put error", (u = l.srcElement) == null ? void 0 : u.error),
                reject(l)
            }
        }
        )
    }
    delete(e, resolve, reject) {
        const tableName = this.tableName();
        this.checkAndOpenDatabase().then(promise=>{
            const s = promise.transaction([tableName], "readwrite").objectStore(tableName).delete(e);
            s.onsuccess = resolve,
            s.onerror = reject
        }
        )
    }
    update() {
        this.checkAndOpenDatabase().then(promise=>{}
        )
    }
    async getAllKeys() {
        const tableName = this.tableName()
        const promise = await this.checkAndOpenDatabase();
        return new Promise((resolve, reject)=>{
            const a = promise.transaction([tableName], "readonly").objectStore(tableName).getAllKeys();
            a.onsuccess = s=>{
                resolve(s.target.result)
            }
            ,
            a.onerror = s=>{
                logger.error("db getAllKeys error", s),
                reject(s)
            }
        }
        )
    }
    async query(keyName, filesrc) {
        const tableName = this.tableName()
        const promise = await this.checkAndOpenDatabase();
        return new Promise((resolve, reject)=>{
            const u = promise.transaction([tableName], "readonly").objectStore(tableName).index(keyName).get(filesrc);
            u.onsuccess = function(c) {
                var f;
                const h = (f = c == null ? void 0 : c.target) == null ? void 0 : f.result;
                resolve && resolve(h)
            }
            ,
            u.onerror = c=>{
                logger.error("db query error", c),
                reject(c)
            }
        }
        )
    }
    async sleep(e) {
        return new Promise(t=>{
            setTimeout(()=>{
                t("")
            }
            , e)
        }
        )
    }
}