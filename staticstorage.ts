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
class TimeBasedStorages {
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
    set(id: string, value: string):void {
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
            this.setValue("pages", timestamp + this.token + pages.join(this.token));
        }
        this.setValue("value_" + timestamp, value);
        this.setValue("page_" + pageId, pagestr);
        this.setValue("id2time_" + id, timestamp);
    }
    get(id: string): string {
        var timestamp, pages, pageId, page, updatepage = [], tmpid, value = null;
        // map the id to timestamp
        timestamp = parseInt(this.getValue("id2time_" + id));
        // iterate over the page blocks
        pages = this.getPages();
        for (var i = 0; i < pages.length; i++) {
            pageId = parseInt(pages[i]);
            // trace till we find the block with a timestamp thats older
            if (pageId <= timestamp) {
                // get the value
                value = this.getValue("value_" + timestamp); 
                // remove marker from the page block
                page = this.getPage(pageId);
                for (var j = 0; j < page.length; j++) {
                    tmpid = page[j];
                    if (tmpid !== timestamp) {
                        updatepage.push(tmpid);
                    }
                }
                if (updatepage.length > 0) {
                    // remove it from the current page block
                    this.setValue("page_" + pageId, updatepage.join(this.token));                    
                } else {
                    // clear page block and remove it from the page list
                    this.setValue("page_" + pageId, undefined);
                    this.setValue("pages", pages.filter(function(p){
                        return p !== pageId;
                    }).join(this.token)); // not using splice b/c you'll mutate the state of the iterator
                }
                // reset other data
                this.setValue("value_" + timestamp, undefined);
                this.setValue("id2time_" + id, undefined);

                // we are done
                break;
            }
        }
        return value;
    }
}