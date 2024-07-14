// jshint esversion: 8
if (typeof require !== 'undefined') {
    UnitTestingApp = require('../min/UnitTestingApp.js');
    MockData = require('../min/MockData.js');
    UTIL = require('../../utils.js');
    RULES = require('../../rules.js');
    NOTION_CREDENTIAL_OBJ = require('../../notionCredentials.js')
    CONFIG = require('../../config.js')
    CALENDAR_IDS = require('../../calendarIds.js')
    filteredNotionEvents = require('./filteredNotionEvents.js')
    cancelledEvent = require('./cancelledEvents.js')
}

/*****************
 * TESTS
 *****************/

/**
 * Runs the tests; insert online and offline tests where specified by comments
 * @returns {void}
 */
function runTests() {
    const test = new UnitTestingApp();
    test.enable();
    test.clearConsole();
    test.levelInfo = 2;

    test.runInGas(false);
    test.printHeader('LOCAL TESTS');
    /************************
     * Run Local Tests Here
     ************************/

    const data = new MockData();
    // @Todo 별도의 파일로 빼고, 테스트 때 위에서 require 하는 것도 좋을듯. 일단은 이렇게 쓰고

    data.addData('cancelledEvent', cancelledEvent);
    data.addData('dates', [
        { start: null, end: null, time_zone: null },
        { start: '2024-07-13', end: null, time_zone: null },
        { start: '2024-07-13', end: '2024-07-13', time_zone: null },
        { start: '2024-09-05T13:40:00.000+09:00',
            end: null,
            time_zone: null },
        { start: '2024-07-03T09:00:00.000+09:00',
            end: '2024-07-03T18:00:00.000+09:00',
            time_zone: null }
    ])

    // helper function to print before converted values with given key
    const getBeforeVal = (key) => RULES.CONVERT.eventPropertyExtractionRules[key](UTIL).extFunc(notionDbPage)

    test.printHeader("Testing Convert Notion Page to Common Event")
    const notionDbPage = data.getData('cancelledEvent').results[0]
    let proxyObj = new CommonEvent(RULES.CONVERT.eventPropertyExtractionRules, CALENDAR_IDS)
    let commonEvent = proxyObj.importFromNotion(notionDbPage, UTIL)

    // console.log(notionDbPage.properties)
    //console.log(proxyObj.data)

    test.printSubHeader("Proxy Getter and Setters");
    test.assert(() => {
        return proxyObj === commonEvent
    }, "Proxy Events Object should be identical")
    test.assert(() => {
        return commonEvent["gCalCalId"]
            && commonEvent.gCalCalId
    }, "Proxy getter working")

    test.printSubHeader("Convert Processing");
    test.assert(() => {
        return getBeforeVal("gCalCalId")
        === proxyObj.gCalCalId
    }, "before and after props value matched")
    test.assert(() => {
        const res = [
            commonEvent.allDay, commonEvent.lastSyncDate,
            commonEvent.hasGcalInfo, commonEvent.recentlyUpdated,
            commonEvent.calendarMatched
        ]
        //console.log(res)
        const resultArr = [
            true, '2024-07-10T11:06:00.000+00:00',
            true, true, false
        ]
        return res.every((item, idx) => item === resultArr[idx])

    }, "extra props processed properly")
    test.assert(() => {
        const dates = data.getData('dates')
        const res = dates.map(date => {
            return UTIL.hasDate(date, 'start') === true
        })
        // console.log(res)
        const resultArr = [ false, true, true, true, true ]
        return res.every((item, idx) => item === resultArr[idx])
    }, "hasDate works properly")
    test.assert(() => {
        const dates = data.getData('dates')
        const res = dates.map(date => {
            return UTIL.processDate(date, 'start')
        })
        // console.log(res)
        const resultArr = [
            undefined,
            '2024-07-13',
            '2024-07-13',
            '2024-09-05T13:40:00.000+09:00T00:00:00',
            '2024-07-03T09:00:00.000+09:00T00:00:00'
        ]
        return res.every((item, idx) => item === resultArr[idx])
    }, "processDate works properly")
    test.assert(() => {
        const dates = data.getData('dates')
        const res = dates.map(date => {
            // console.log(date)
            // console.log(UTIL.allDay(date))
            return UTIL.allDay(date)
        })
        // console.log(res)
        const resultArr = [ false, true, true, false, false ]
        return res.every((item, idx) => item === resultArr[idx])
    }, "allDay works properly")

    //@Todo 삭제가 안되고 납아있는 현상 발견
    data.deleteData('cancelledEvent');
    data.deleteData('dates');

    test.printHeader("Testing syncable To Gcal")
    data.addData('filteredNotionEvents', filteredNotionEvents);
    test.printSubHeader('process updated events')
    test.assert(() => {
        const response_data= data.getData('filteredNotionEvents')
        const commonEvents = response_data.results.map(page => {
            return UTIL.convertPageToCommonEvent(page, RULES.CONVERT.eventPropertyExtractionRules, CALENDAR_IDS, UTIL)
        })
        const needUpdateEvents = commonEvents.filter(event => event.recentlyUpdated)
        const splitList = UTIL.splitEventFoUpdate(needUpdateEvents)
        // console.log(splitList)
    }, "")


    test.runInGas(true);
    test.printHeader('ONLINE TESTS');
    /************************
     * Run Online Tests Here
     ************************/
}

/**
 * If we're running locally, execute the tests. In GAS environment, runTests() needs to be executed manually
 */
(function () {
    /*
     * @param {Boolean} - if true, were're in the GAS environment, otherwise we're running locally
     */
    const IS_GAS_ENV = typeof ScriptApp !== 'undefined';
    if (!IS_GAS_ENV) runTests();
})();