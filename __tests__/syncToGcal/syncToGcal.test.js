// jshint esversion: 8
if (typeof require !== 'undefined') {
    UnitTestingApp = require('../min/UnitTestingApp.js');
    MockData = require('../min/MockData.js');
    UTIL = require('../../utils.js');
    RULES = require('../../rules.js');
    NOTION_CREDENTIAL_OBJ = require('../../notionCredentials.js')
    CONFIG = require('../../config.js')
    CALENDAR_IDS = require('../../calendarIds.js')
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
    const cancelledEvent = {
        "object": "list",
        "results": [
            {
                "object": "page",
                "id": "페이지ID",
                "last_edited_time": "2024-07-12T14:31:00.000Z",
                "archived": false,
                "in_trash": false,
                "properties": {
                    "달력 ID": {
                        "id": "",
                        "type": "select",
                        "select": {
                            "id": "",
                            "name": "main@gmail.com",
                            "color": "purple"
                        }
                    },
                    "행사 ID": {
                        "id": "",
                        "type": "rich_text",
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "ip492v7t168cu5uct0elmt4pqs",
                                    "link": null
                                },
                                "annotations": {
                                    "bold": false,
                                    "italic": false,
                                    "strikethrough": false,
                                    "underline": false,
                                    "code": false,
                                    "color": "default"
                                },
                                "plain_text": "ip492v7t168cu5uct0elmt4pqs",
                                "href": null
                            }
                        ]
                    },
                    "실행일": {
                        "id": "",
                        "type": "date",
                        "date": {
                            "start": "2024-07-12",
                            "end": null,
                            "time_zone": null
                        }
                    },
                    "보관됨": {
                        "id": "",
                        "type": "checkbox",
                        "checkbox": false
                    },
                    "Last Edited Time": {
                        "id": "",
                        "type": "last_edited_time",
                        "last_edited_time": "2024-07-12T14:31:00.000Z"
                    },
                    "이름": {
                        "id": "",
                        "type": "title",
                        "title": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "11시 취침 시도 #4",
                                    "link": null
                                },
                                "annotations": {
                                    "bold": false,
                                    "italic": false,
                                    "strikethrough": false,
                                    "underline": false,
                                    "code": false,
                                    "color": "default"
                                },
                                "plain_text": "11시 취침 시도 #4",
                                "href": null
                            }
                        ]
                    },
                    "진행 상태": {
                        "id": "",
                        "type": "status",
                        "status": {
                            "id": "",
                            "name": "무계획됨 5",
                            "color": "default"
                        }
                    },
                    "우선순위": {
                        "id": "",
                        "type": "select",
                        "select": {
                            "id": "",
                            "name": "일정 1💼",
                            "color": "blue"
                        }
                    },
                    "설명": {
                        "id": "",
                        "type": "rich_text",
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "",
                                    "link": null
                                },
                                "annotations": {
                                    "bold": false,
                                    "italic": false,
                                    "strikethrough": false,
                                    "underline": false,
                                    "code": false,
                                    "color": "default"
                                },
                                "plain_text": "",
                                "href": null
                            }
                        ]
                    },
                },
                "url": "",
                "public_url": null
            }
        ],
    };
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
    console.log(proxyObj.data)

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
        // console.log(res)
        const resultArr = [
            true, '2024-07-10T11:06:00.000+00:00',
            true, true, true
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


    data.deleteData('cancelledEvent');

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