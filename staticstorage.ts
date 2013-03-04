interface ICallbackType {
    (...args:any[]);
}
interface ISyncIO {
    set(key:string, value:string):void;
    get(value:string):string;   
}

/* Note:
 * # api
 * - store : store the value using a unique id
 * - get : retrieves the data from storage and removes it
 * # data info
 * page = collection of timestamps
 * pageId = timestamp of the first item added to the page
 * value = the actual value stored
 * id2time = mapping from id to the timestamp
 */
class TimeBasedStorage {
    constructor (private io: ISyncIO, private pageSize = 8, private ns = "tbs_", private token = ":") {}
    private page(pageNum: number): string[] {
        var pages, pageId;
        pages = this.getPages();
        pageId = pages[pageNum];
        return this.getPage(pageId);
    }
    private getValue(key: string):string {
        var value;
        try {
            value = this.io.get(this.ns + key);
        } catch (e) {
            console.error(e);
            value = "";
        }
        return value;
    }
    private setValue(key: string, value: string):void {
        try {
            this.io.set(this.ns + key, value);
        } catch (e) {
            console.error(e);
        }
    }
    private getPages():string[] {
        return this.getValue("pages").split(this.token);
    }
    private getPage(pageId: string):string[] {
        return this.getValue("page_" + pageId).split(this.token);
    }
    store(id: string, value: string):void {
        var pages, page, pageId, pagestr, timestamp;
        pages = this.getPages();
        pageId = pages[0];
        page = this.getPage(pageId);
        timestamp = (new Date()).getTime();
        if (page.length < this.pageSize) {
            pagestr = timestamp + this.token + page.join(this.token);
        } else {
            pageId = timestamp;
            pagestr = timestamp;
            this.setValue("pages_" + timestamp, timestamp + this.token + pages.join(this.token));
        }
        this.setValue("value_" + timestamp, value);
        this.setValue("page_" + pageId, pagestr);
        this.setValue("id2time_" + id, timestamp);
    }
    get(id: string): string {
        var timestamp, pages, pageId;
        timestamp = parseInt(this.setValue("id2time_" + id));
        pages = this.getPages();
        for (var i = 0; i < pages.length; i++) {
            pageId = parseInt(pages[i]);
            if (pageId)
        }
    }
}