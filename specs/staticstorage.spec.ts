/// <reference path="../definition/jasmine.d.ts" />
/// <reference path="../definition/require.d.ts" />

class TestIO {
    constructor(public buffer = {}) {}
    set(key:string, value:string) {
        this.buffer[key] = value;
    }
    get(key:string) {
        return this.buffer[key];
    }
}

require(["../staticstorage"], function(SS) {

    describe('TimeBasedStorage', function(){
        var storage;
        var io;
        var token = ":";

        function getValue(key) {
            return io.get("test_" + key);
        }

        beforeEach(function(){
            io = new TestIO();
            storage = new SS.TimeBasedStorage(io, 2, "test_", token);
        });
        afterEach(function(){
            storage = undefined;
            io = undefined;
        });

        it('empty get', function(){
            expect(storage.getValue("aaa")).toBe("");
        })

        it('simple set', function(){
            storage.setValue("aaa", "bbb");
            expect(getValue('aaa')).toBe("bbb");
        })

        it('empty pages', function(){
            expect(typeof storage.getPages()).toBe("object");
            expect(storage.getPages().length).toBe(0);
        })

        it('set single page in pages', function(){
            storage.setValue("pages", "123");
            expect(storage.getPages().length).toBe(1);
            expect(storage.getPages()[0]).toBe("123");
        });

        it('empty page', function(){
            expect(typeof storage.getPage("aaa")).toBe("object");
            expect(storage.getPage("aaa").length).toBe(0);
        })

        it('set single page', function(){
            storage.setValue("page_123", "bbb");
            expect(storage.getPage("123").length).toBe(1);
            expect(storage.getPage("123")[0]).toBe("bbb");
        })

        it('api: set', function(){
            storage.set("abc", "def");
            var t1 = getValue("id2time_abc");
            expect(getValue("value_" + t1)).toBe("def");
            expect(getValue("page_" + t1)).toBe(t1);
            expect(getValue("pages")).toBe(t1);

            storage.set("hij", "klm");
            var t2 = getValue("id2time_hij");
            expect(getValue("value_" + t2)).toBe("klm");
            expect(getValue("page_" + t1)).toBe(t2 + token + t1);
            expect(getValue("pages")).toBe(t1);

            storage.set("nop", "qrs");
            var t3 = getValue("id2time_nop");
            expect(getValue("value_" + t3)).toBe("qrs");
            expect(getValue("page_" + t1)).toBe(t2 + token + t1);
            expect(storage.getValue("page_" + t3)).toBe(t3);
            expect(storage.getValue("pages")).toBe(t3 + token + t1);
        })

        it('api: get', function(){
            storage.set("1", "a");
            storage.set("2", "b");
            storage.set("3", "c");

            var t1 = getValue("id2time_1");
            var t2 = getValue("id2time_2");
            var t3 = getValue("id2time_3");

            expect(storage.get("1")).toBe("a");
            expect(getValue("value_" + t1)).toBeUndefined();
            expect(getValue("page_" + t1)).toBe(getValue("id2time_2"));
            expect(getValue("page_" + t3)).toBe(getValue("id2time_3"));
            expect(getValue("pages")).toBe(t3 + token + t1);

            expect(storage.get("2")).toBe("b");
            expect(getValue("value_" + t2)).toBeUndefined();
            expect(getValue("page_" + t1)).toBeUndefined();
            expect(getValue("page_" + t3)).toBe(getValue("id2time_3"));
            expect(getValue("pages")).toBe(t3);

            expect(storage.get("3")).toBe("c");
            expect(getValue("value_" + t3)).toBeUndefined();
            expect(getValue("page_" + t1)).toBeUndefined();
            expect(getValue("page_" + t3)).toBeUndefined();
            expect(getValue("pages")).toBe("");
        })

    });
})