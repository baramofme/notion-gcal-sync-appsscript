// jshint esversion: 8
// import 'google-apps-script';
if (typeof require !== 'undefined') {
    MockData = require('../../UnitTestingApp/MockData.js');
}
/**
 *
 */
let CommonEvent = (function () {
    // const _testData = JSON.parse('[["Start Time","End Time","Title","Location","Confirmed","Guests"],["2021-03-23T16:00:00.000Z","2021-03-23T17:00:00.000Z","Busy","",true,[]],["2021-03-23T22:00:00.000Z","2021-03-24T04:00:00.000Z","Sleep","",true,[]],["2021-03-24T16:00:00.000Z","2021-03-24T17:00:00.000Z","Busy","",true,[]],["2021-03-24T22:00:00.000Z","2021-03-25T04:00:00.000Z","Sleep","",true,[]],["2021-03-25T16:00:00.000Z","2021-03-25T17:00:00.000Z","Busy","",true,[]],["2021-03-25T22:00:00.000Z","2021-03-26T04:00:00.000Z","Sleep","",true,[]],["2021-03-26T15:00:00.000Z","2021-03-26T16:00:00.000Z","Busy","",true,[]],["2021-03-26T16:00:00.000Z","2021-03-26T17:00:00.000Z","Busy","",true,[]],["2021-03-26T22:00:00.000Z","2021-03-27T04:00:00.000Z","Sleep","",true,[]],["2021-03-27T22:00:00.000Z","2021-03-28T04:00:00.000Z","Sleep","",true,[]],["2021-03-28T16:30:00.000Z","2021-03-28T18:30:00.000Z","Косыскимы","https://zoom.us/j/99476920957?pwd=WGJRWitpK3E3RHZKanJ4YnVwMWtSUT09",true,[]],["2021-03-28T21:00:00.000Z","2021-03-29T03:00:00.000Z","Sleep","",true,[]],["2021-03-29T09:30:00.000Z","2021-03-29T10:00:00.000Z","Weekly Dmitry & Philippe Call","",true,["dmitry.kostyuk@gmail.com"]],["2021-03-29T15:00:00.000Z","2021-03-29T16:00:00.000Z","Busy","",true,[]],["2021-03-29T21:00:00.000Z","2021-03-30T03:00:00.000Z","Sleep","",true,[]],["2021-03-30T15:00:00.000Z","2021-03-30T16:00:00.000Z","Busy","",true,[]],["2021-03-30T21:00:00.000Z","2021-03-31T03:00:00.000Z","Sleep","",true,[]],["2021-03-31T15:00:00.000Z","2021-03-31T16:00:00.000Z","Busy","",true,[]],["2021-03-31T21:00:00.000Z","2021-04-01T03:00:00.000Z","Sleep","",true,[]],["2021-04-01T15:00:00.000Z","2021-04-01T16:00:00.000Z","Busy","",true,[]],["2021-04-01T21:00:00.000Z","2021-04-02T03:00:00.000Z","Sleep","",true,[]],["2021-04-02T14:00:00.000Z","2021-04-02T15:00:00.000Z","Busy","",true,[]],["2021-04-02T15:00:00.000Z","2021-04-02T16:00:00.000Z","Busy","",true,[]],["2021-04-02T21:00:00.000Z","2021-04-03T03:00:00.000Z","Sleep","",true,[]],["2021-04-03T21:00:00.000Z","2021-04-04T03:00:00.000Z","Sleep","",true,[]],["2021-04-04T16:30:00.000Z","2021-04-04T18:30:00.000Z","Косыскимы","https://zoom.us/j/99476920957?pwd=WGJRWitpK3E3RHZKanJ4YnVwMWtSUT09",true,[]],["2021-04-04T21:00:00.000Z","2021-04-05T03:00:00.000Z","Sleep","",true,[]],["2021-04-05T09:30:00.000Z","2021-04-05T10:00:00.000Z","Weekly Dmitry & Philippe Call","",true,["dmitry.kostyuk@gmail.com"]],["2021-04-05T15:00:00.000Z","2021-04-05T16:00:00.000Z","Busy","",true,[]],["2021-04-05T21:00:00.000Z","2021-04-06T03:00:00.000Z","Sleep","",true,[]]]');
    let mockData;
    // if (typeof CalendarApp === 'undefined') mockData = new MockData().addData('testCalData', _testData);

    const _commonEvent = new WeakMap();

    class CommonEvent {
        #rulesObj = {}
        #calendarList = {}

        constructor(rulesObj, calendarList, mockData) {
            //if (!(startTime instanceof Date)) throw new Error('startTime is not a valid date-time format');
            //if (!(endTime instanceof Date)) throw new Error('endTime is not a valid date-time format');
            //const headers = ['Start Time', 'End Time', 'Title', 'Location', 'Confirmed', 'Guests'];
            // _commonEvent.set(this, [headers]);

            this.#rulesObj = rulesObj;
            this.#calendarList = calendarList;

            // if mock data is provided, use it. else, initialize with headers.
            if (mockData) {
                // _commonEvent.set(this, mockData.getData('testCalData'));
                return this;
            }

            return this;
        }

        importFromNotion(notionDbPage) {

            let obj = {}

            const ruleKeys = Object.keys(this.#rulesObj)
            ruleKeys.forEach(key => {
                const {extFunc, convFunc} = this.#rulesObj[key](this)
                obj = convFunc(extFunc(notionDbPage))
            })

            // @Todo 이것도 별도의 rules 로 만들면 좋지 않을까?
            const calNames = Object.keys(this.#calendarList)
            obj["calendarMatched"] = calNames.some(name => {
                return obj.gCalName === name
                    && obj.gCalCalId === this.#calendarList[name].id
            })
            obj["hasGcalInfo"] = obj.gCalEId && obj.gCalName

            _commonEvent.set(this, obj)
        }

        get(key) {
            if (key !== undefined) return _commonEvent.get(this)[key];
            return _commonEvent.get(this);
        }

        print(row) {
            console.log(JSON.stringify(this.get(row)));
            return true;
        }
    }

    return CommonEvent;

})();

if (typeof module !== 'undefined') module.exports = CommonEvent;