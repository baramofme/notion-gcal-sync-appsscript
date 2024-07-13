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
    test.levelInfo = 1;

    test.runInGas(false);
    test.printHeader('LOCAL TESTS');
    /************************
     * Run Local Tests Here
     ************************/

    test.printSubHeader("Testing Convert Notion Page to Common Event");

    const data = new MockData();

    // @Todo 별도의 파일로 빼고, 테스트 때 위에서 require 하는 것도 좋을듯. 일단은 이렇게 쓰고


    data.addData('cancelledEvent', cancelledEvent);

    test.assert(() => {
            const notionDbPage = data.getData('cancelledEvent').results[0]
            let commonEventObj = new CommonEvent(RULES.eventPropertyExtractionRules,CALENDAR_IDS)
            commonEventObj = commonEventObj.importFromNotion(notionDbPage,UTIL)

            console.log(commonEventObj)
//            console.log(commonEventObj.gCalCalId)
//            console.log(commonEventObj.gCalName)


    // console.log(notionDbPage.properties)
    //console.log(proxyObj.data)




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


//    test.assert(() => {
//            const commonEvent = data.getData('cancelledEvent').results.map(page => {
//                return UTIL.convertPageToCommonEvent(page, RULES.CONVERT.eventPropertyExtractionRules, CALENDAR_IDS, UTIL)
//            })
//            return true
//        }
//        , 'Names array successfully registered in MockData');

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
        console.log(splitList)
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