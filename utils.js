if (typeof require !== 'undefined') {
    MockData = require('./__tests__/min/MockData.js');
    CommonEvent = require('./CommonEvent.js')
}
const UTIL = (() => {

    function getBeforeVal(notionDbPage, key, rules) {
        return rules.CONVERT.eventPropertyExtractionRules[key](UTIL).extFunc(notionDbPage)
    }

    // 후처리 - 노션 정보 추출 시 rich text
    /**
     * Flattens rich text properties into a singular string.
     * @param {Object} rich_text_result - Rich text property to flatten
     * @return {String} - Flattened rich text
     * */
    function flattenRichText(rich_text_result) {
        let plain_text = "";

        plain_text = rich_text_result.map((result) => {
            return result.rich_text
                ? result.rich_text.plain_text
                : result.plain_text;
        }).join()

        return plain_text;
    }

    function convertPageToCommonEvent(notionDbPage, rulesObj, calendarList, utils) {
        const commonEventObj = new CommonEvent(rulesObj, calendarList)
        return commonEventObj.importFromNotion(notionDbPage, utils)
    }

    function writable(calendarList, gCalCalName) {
        // console.log('달력목록', calendarList)
        // console.log('달력이름', gCalCalName)
        if (!gCalCalName) return false
        const writableCalendar = Object.keys(calendarList).find(key =>
            calendarList[key].writable && calendarList[key].summary === gCalCalName
        )
        // console.log('쓰기가능달력',writableCalendar)
        return !!writableCalendar
    }

    // { start: '2024-07-13', end: null, time_zone: null }
    function hasDate(datePropObj, startOrEndTypeStr) {

        //console.log(datePropObj)
        let hasDate = true

        const propObjEmpty = UTIL.isEmptyObject(datePropObj)
        // console.log("propObjEmpty", propObjEmpty)
        if (propObjEmpty) return false

        const propObjHasNoTargetProp = !Object.hasOwn(datePropObj, startOrEndTypeStr)
        // console.log("propObjHasNoTargetProp", propObjHasNoTargetProp)

        if (propObjHasNoTargetProp) return false

        const propOBjHasNoTargetValue = !datePropObj[startOrEndTypeStr]

        if (propOBjHasNoTargetValue) return false

        return hasDate
    }

    // In don't know what to name on this.. function.
    function getLocaleISOTime(inputDate, minutesToAdd = 0) {

        // Too much. this look more elegant, but i'm not using till I met It's required.
        /*
        const tzname = "America/Detroit";
        const longOffsetFormatter = new Intl.DateTimeFormat("en-US", {timeZone: tzname ,timeZoneName: "longOffset"});
        const longOffsetString = longOffsetFormatter.format(new Date("2013-02-28T19:00:00.000")); // '2/28/2013, GMT-05:00'

        // longOffsetString.split('GMT')[1] will give us '-05:00'
        const gmtOffset = longOffsetString.split('GMT')[1];
         */
        console.log('inputDate',inputDate)
        const copyOfInputData = inputDate
        const dateWithoutTimezone = inputDate.slice(0, -6) + "Z"
        const timeZoneStr = copyOfInputData.slice(-6)
        console.log(dateWithoutTimezone, timeZoneStr)

        // Now, Date contstructor not convert time!!! hooray!!
        const utcDate = new Date(dateWithoutTimezone)
        console.log("utcDate", utcDate)
        utcDate.setMinutes(utcDate.getMinutes() + minutesToAdd)
        console.log("utcDate+30", utcDate)
        const isoDateString = utcDate.toISOString()
        console.log("isoStr", isoDateString)
        // now replace 'Z' with timeZoneStr
        const localIsoDateString = isoDateString.replace('Z', timeZoneStr)
        console.log("isoStr+0900", isoDateString)
        return localIsoDateString;
    }


    // date processing logic fits for below google API
    // calendar.createAllDayEvent(title, date, [end, [options])])
    // calendar.createEvent(title, startTime, endTime, [options]);
    // https://developers.google.com/apps-script/reference/calendar/calendar?hl=ko#createAllDayEvent(String,Date,Object)
    function processDate(datePropObj, startOrEndTypeStr, notionDbPage = {}) {

        if(!isEmptyObject(notionDbPage)){
            const title = notionDbPage.properties[CONFIG.NAME_PROP_NOTION].title[0].plain_text
            console.log('notion title', title)
        }
        console.log("processDate", startOrEndTypeStr)
        console.log("print date", notionDbPage.properties[CONFIG.DATE_PROP_NOTION].date)


        // Find out start time has a time
        // For Notion dates, both start and end dates may or may not have time, so
        // All we need to know is whether the start has time or not.
        let startHasValue = UTIL.hasDate(datePropObj, "start")
        if (!startHasValue) return null

        let startValue = datePropObj.start
        let bothShouldHaveTime = UTIL.hasTime(startValue)
        console.log('start hasTime', UTIL.hasTime(startValue))
        let currentValue = datePropObj[startOrEndTypeStr]
        // both doesn't have a time. It's aAllDayEvent case.
        // in AllDayEvent case, end value is optional. nothing to do.

        // 사용 예시
        //const countryCode = 'Asia/Seoul'; // 예: 'Asia/Seoul', 'America/New_York'
        //const inputDate = '2024-07-15T10:00:00'; // 예: '2024-07-15T10:00:00'
        const minutesToAdd = 30; // 예: 30분 추가
        //console.log(UTIL.getUTCDifferenceInMilliseconds(countryCode, inputDate, minutesToAdd));

        // if not, It's Event. start and end should be existed and also has a time together.
        if (bothShouldHaveTime) {

            let endHasValue = UTIL.hasDate(datePropObj, "end")
            if (startOrEndTypeStr === "end"){
                if(!endHasValue) {
                    console.log("!endHasValue")
                    currentValue = UTIL.getLocaleISOTime(startValue, minutesToAdd)
                    console.log(currentValue)
                } else {
                    // currentValue = UTIL.getLocaleISOTime(datePropObj.start)
                    // console.log("%s, endHasValue", startOrEndTypeStr)
                    // console.log(datePropObj)
                    // console.log(currentValue)
                }
            }
        }

        return currentValue

    }

    function hasTime(dateString) {
        console.log("hasTime", dateString)
        return dateString.search(/([A-Z])/g) !== -1
    }

    // Events that are marked as all day don't have a start or end time but rather mark the whole. Think of a holiday, a birthday,...
    // https://support.google.com/calendar/thread/188156659?hl=en&msgid=188159647
    function allDay(datePropObj) {

        // Find out start time has a time
        // For Notion dates, both start and end dates may or may not have time, so
        // All we need to know is whether the start has time or not.
        let startHasValue = UTIL.hasDate(datePropObj, "start")
        if (!startHasValue) return null

        let startValue = datePropObj.start
        let bothShouldHaveTime = UTIL.hasTime(startValue)

        // both doesn't have a time. It's a AllDayEvent case.
        return !bothShouldHaveTime
    }

    function isEmptyObject(param) {
        return !param || Object.keys(param).length === 0 && param.constructor === Object;
    }

    function splitEventFoUpdate(needUpdateEvents) {

        const syncableList = {
            needUpdateList: {data: [], ids: [], synced: []},
            needRecreateList: {data: [], ids: [], synced: []},
            needCreateList: {data: [], ids: [], synced: []},
        }
        const unSyncableList = {
            noDateList: {data: [], ids: []},
            noAuthorizedList: {data: [], ids: []},
            unknowReasonList: {data: [], ids: []},
        }


        needUpdateEvents.forEach((commonEvent) => {

            const syncable = commonEvent.hasDate && commonEvent.gCalWritable

            const needUpdate = commonEvent.hasGcalInfo && commonEvent.calendarMatched
            const needRecreate = commonEvent.hasGcalInfo && !commonEvent.calendarMatched
            const needCreate = !commonEvent.hasGcalInfo && commonEvent.calendarMatched

            const gCalEId = commonEvent.gCalEId
            const gCalCalId = commonEvent.gCalCalId
            const gCalCalName = commonEvent.gCalCalName
            const nTitle = commonEvent.nTitle

            const data = commonEvent.data

            if (syncable) {
                if (needUpdate) {
                    syncableList.needUpdateList.data.push(data)
                    syncableList.needUpdateList.ids.push({
                        gCalEId: gCalEId,
                        gCalCalName: gCalCalName,
                        nTitle: nTitle
                    })
                }

                if (needRecreate) {
                    syncableList.needRecreateList.data.push(data)
                    syncableList.needRecreateList.ids.push({
                        gCalEId: gCalEId,
                        gCalCalName: gCalCalName,
                        nTitle: nTitle
                    })
                }
                if (needCreate) {
                    syncableList.needCreateList.data.push(data)
                    syncableList.needCreateList.ids.push({
                        gCalEId: gCalEId,
                        gCalCalName: gCalCalName,
                        nTitle: nTitle
                    })
                }
            } else {

                if (!commonEvent.hasDate && commonEvent.gCalWritable) {
                    // console.log('권한있는데 날짜 없음')
                    // console.log(commonEvent.data)
                    unSyncableList.noDateList.data.push(data)
                    unSyncableList.noDateList.ids.push({
                        gCalEId: gCalEId,
                        gCalCalName: gCalCalName,
                        nTitle: nTitle
                    })
                }
                if (commonEvent.hasDate && !commonEvent.gCalWritable) {
                    // console.log('날짜는 있는데 권한 없음')
                    // console.log(commonEvent.data)
                    unSyncableList.noAuthorizedList.data.push(data)
                    unSyncableList.noAuthorizedList.ids.push({
                        gCalEId: gCalEId,
                        gCalCalName: gCalCalName,
                        nTitle: nTitle
                    })
                }
                if (!commonEvent.hasDate && !commonEvent.gCalWritable) {
                    // console.log('날짜도 없고 권한도 없음')
                    // console.log(commonEvent.data)
                    unSyncableList.unknowReasonList.data.push(data)
                    unSyncableList.unknowReasonList.ids.push({
                        gCalEId: gCalEId,
                        gCalCalName: gCalCalName,
                        nTitle: nTitle
                    })
                }

            }
        })

        return {
            syncableList,
            unSyncableList
        }
    }

    function getRelativeDate(daysOffset, hour) {
        let date = new Date();
        date.setDate(date.getDate() + daysOffset);
        date.setHours(hour);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }


    /**
     * Return base notion JSON property object including generation time
     * @param {String} event_id - event id
     * @param {String} calendar_name - calendar key name
     * @returns {Object} - base notion property object
     *  */
    //@Todo 이거 class 로 만들어도 되지 않을까?
    function getBaseNotionProperties(event_id, calendar_name) {
        // console.log('getBaseNotionProperties', calendar_name)

        //@Todo 시간이 늦게 찍히는 문제인 줄 알았는데 아니었음.. 근데 그냥 두리골... 나중에 치우자
        const now = new Date()
        now.setMinutes(now.getMinutes())

        return {
            // 우선순위 추가해서 생성하도록 함
            [CONFIG.EXT_FILTER_PROP_NOTION]: {
                select: {
                    name: CONFIG.EXT_FILTER_VALUE_NOTION,
                },
            },

            // @todo fetch 직전에 1분 추가해서 보내는 게 좋을듯.
            // 여기서 생서안 시점과 실제 동기화가 처리되는 시점이 달라서
            // 계속 최근에 갱신된 항목으로, 무한 동기화됨..
            [CONFIG.LAST_SYNC_PROP_NOTION]: {
                type: "date",
                date: {
                    // start: new Date().toISOString(),
                    start: now.toISOString(),
                },
            },
            [CONFIG.CALENDAR_EVENT_ID_PROP_NOTION]: {
                type: "rich_text",
                rich_text: [
                    {
                        text: {
                            content: event_id, //use ICal uid?
                        },
                    },
                ],
            },
            [CONFIG.CALENDAR_ID_PROP_NOTION]: {
                select: {
                    name: CALENDAR_IDS[calendar_name].id,
                },
            },
            [CONFIG.CALENDAR_NAME_PROP_NOTION]: {
                select: {
                    name: calendar_name,
                },
            },
        };
    }


    /**
     * Error thrown when an event is invalid and cannot be
     * pushed to either Google Calendar or Notion.
     */
    class InvalidEventError extends Error {
        constructor(message) {
            super(message);
            this.name = "InvalidEventError";
        }
    }

    /**
     * Get notion page ID of corresponding gCal event. Returns null if no page found.
     * @param {CalendarEvent} event - Modiffied gCal event object
     */
    function getPageId(event) {
        const url = NOTION_CREDENTIAL_OBJ.databaseUrl;
        const payload = {
            filter: {
                and: [
                    {property: CONFIG.CALENDAR_EVENT_ID_PROP_NOTION, rich_text: {equals: event.id}},
                    {
                        property: CONFIG.SYNC_OPT_TAG_PROP_NOTION,
                        multi_select: {
                            does_not_contain: CONFIG.SYNC_OPT_IGNORE_VALUE_NOTION,
                        },
                    },
                ],
            },
        };

        const response_data = API.NOTION.notionFetch(url, payload, "POST");

        if (response_data.results.length > 0) {
            if (response_data.results.length > 1) {
                console.log(
                    "Found multiple entries with event id %s. This should not happen. Only processing index zero entry.",
                    event.id
                );
            }

            return response_data.results[0].id;
        }
        return null;
    }

    /**
     * Sync to google calendar from Notion
     * @returns {Set[String]} - Array of event IDs that were modified through event creation
     */

    /**
     * Determine if gcal events need to be updated, removed, or added to the database
     * @param {CalendarEvent[]} events Google calendar events
     * @param {Set[String]} ignored_eIds Event IDs to not act on.
     */
    function parseEvents(events, ignored_eIds) {
        let requests = [];
        for (let i = 0; i < events.items.length; i++) {
            let event = events.items[i];
            event["c_name"] = events["c_name"];
            if (ignored_eIds.has(event.id)) {
                console.log("[+ND] Ignoring event %s", event.id);
                continue;
            }
            if (event.status === "cancelled") {
                console.log("[+ND] Event %s was cancelled.", event.id);
                // Remove the event from the database
                UTIL.handleEventCancelled(event);
                continue;
            }
            let start;
            let end;

            if (event.start.date) {
                // 조회된 구글 이벤트 내용 조회
                if(event.id === "pp60lausrn7oprbkp908erqafg"){
                    console.log("Event %s info",event.id)
                    console.log(event.summary)
                    console.log(event.start.date)
                }

                // All-day event.
                start = new Date(event.start.date);
                end = new Date(event.end.date);
                console.log(
                    "[+ND] Event found %s %s (%s -- %s)",
                    event.id,
                    event.summary,
                    start.toLocaleDateString(),
                    end.toLocaleDateString()
                );
            } else {
                // Events that don't last all day; they have defined start times.
                start = event.start.dateTime;
                end = event.end.dateTime;
                console.log(
                    "[+ND] Event found %s %s (%s)",
                    event.id,
                    event.summary,
                    start.toLocaleString()
                );
            }
            let page_response = SERVICE.getPageFromEvent(event);

            if (page_response) {
                console.log(
                    "[+ND] Event %s database page %s exists already. Attempting update.",
                    event.id,
                    page_response.id
                );
                let tags = page_response.properties[CONFIG.SYNC_OPT_TAG_PROP_NOTION].multi_select;
                // console.log("page_response.id",page_response)
                requests.push(
                    SERVICE.updateDatabaseEntry(event, page_response.id, tags || [])
                );

                continue;
            }
            console.log("[+ND] Creating database entry.");

            try {
                requests.push(SERVICE.createDatabaseEntry(event));
            } catch (err) {
                if ((err instanceof UTIL.InvalidEventError) && CONFIG.SKIP_BAD_EVENTS) {
                    console.log(
                        "[+ND] Skipping creation of event %s due to invalid properties.",
                        event.id
                    );
                    // console.log(event)

                    continue;
                }

                throw err;
            }
        }
        console.log("[+ND] Finished parsing page. Sending batch request.");

        const responses = UrlFetchApp.fetchAll(requests);

        for (let i = 0; i < responses.length; i++) {
            let response = responses[i];
            if (response.getResponseCode() === 401) {
                throw new Error("[+ND] Notion token is invalid.");
            } else if (response.getResponseCode() === 404) {
                throw new Error("[+ND] Notion page not found.");
            } else if (response.getResponseCode() === 403) {
                throw new Error("[+ND] Notion page is private.");
            } else if (response.getResponseCode() !== 200) {
                throw new Error(response.getContentText());
            }
        }
    }

    /**
     * Deals with event cancelled from gCal side
     * @param {CalendarEvent} event - Modiffied gCal event object
     */
    function handleEventCancelled(event) {
        const page_id = getPageId(event);

        if (page_id) {
            API.NOTION.updateDatabaseEntry(event, page_id, [], false);
        } else {
            console.log("Event %s not found in Notion database. Skipping.", event.id);
        }
    }

    function extNessasaryPproperly(event) {
        return {
            object: event["object"],
            id: event["id"],
            last_edited_time: event["last_edited_time"],
            archived: event["archived"],
            in_trash: event["in_trash"],
            properties: {
                "마지막 동기화": event["properties"]["마지막 동기화"],
                "달력": event["properties"]["달력"],
                "달력 ID": event["properties"]["달력 ID"],
                "행사 ID": event["properties"]["행사 ID"],
                "실행일": event["properties"]["실행일"],
                "보관됨": event["properties"]["보관됨"],
                "Last Edited": event["properties"]["Last Edited"],
                "이름": event["properties"]["이름"],
                "진행 상태": event["properties"]["진행 상태"],
                "우선순위": event["properties"]["우선순위"],
                "설명": event["properties"]["설명"],
                "위치": event["properties"]["위치"],
            }
        }
    }

    /**
     * Return notion JSON property object based on event data
     * @param {CalendarEvent} event modified GCal event object
     * @param {String[]} existing_tags - existing tags to add to event
     * @returns {Object} notion property object
     */
    function convertToNotionProperty(event, existing_tags = []) {
        // console.log("convertToNotionProperty",event)
        let properties = getBaseNotionProperties(event.id, event.c_name);

        properties[CONFIG.DESCRIPTION_PROP_NOTION] = {
            type: "rich_text",
            rich_text: [
                {
                    text: {
                        content: event.description || "",
                    },
                },
            ],
        };

        properties[CONFIG.LOCATION_PROP_NOTION] = {
            type: "rich_text",
            rich_text: [
                {
                    text: {
                        content: event.location || "",
                    },
                },
            ],
        };

        if (event.start) {
            let start_time;
            let end_time;

            if(event.id === "pp60lausrn7oprbkp908erqafg"){
                console.log("Event %s start end conversion",event.id)
                console.log(event)
            }

            if (event.start.date) {
                // All-day event.
                // bypass UTC conversion. it reduced timezone calculation code.
                const utcTimeTemplate = "T00:00:00.000Z"
                start_time = new Date(event.start.date + utcTimeTemplate)
                end_time = new Date(event.end.date + utcTimeTemplate)

                // Offset by 1 day to get end date.
                end_time.setDate(end_time.getDate() - 1);

                start_time = start_time.toISOString().split("T")[0];
                end_time = end_time.toISOString().split("T")[0];

                if(event.id === "pp60lausrn7oprbkp908erqafg"){
                    console.log("All day - remove timezone")
                    console.log('start_time',start_time)
                    console.log('start_time',end_time)
                }

                // 이런 케이스도 있나??? 햐.. 진짜 겪어봐야 알겠네 진짜..
                end_time = start_time == end_time ? null : end_time;
            } else {
                // Events that don't last all day; they have defined start times.
                start_time = event.start.dateTime;
                end_time = event.end.dateTime;
            }

            properties[CONFIG.DATE_PROP_NOTION] = {
                type: "date",
                date: {
                    start: start_time,
                    end: end_time,
                },
            };

            properties[CONFIG.NAME_PROP_NOTION] = {
                type: "title",
                title: [
                    {
                        type: "text",
                        text: {
                            content: event.summary || "",
                        },
                    },
                ],
            };
        }

        if (event.status === "cancelled") {
            properties[CONFIG.SYNC_OPT_TAG_PROP_NOTION] = {multi_select: existing_tags};

            properties[CONFIG.SYNC_OPT_TAG_PROP_NOTION].multi_select.push({
                name: CONFIG.SYNC_OPT_CANCELLED_VALUE_NOTION,
            });
        }

        return properties;
    }


    /**
     * 속성이 노션에 유효한 지 확인
     *
     * @param {*} properties Properties object to check
     * @returns false if invalid, true if valid
     */
    function checkNotionProperty(properties) {
        // Check if description is too long
        if (properties[CONFIG.DESCRIPTION_PROP_NOTION].rich_text[0].text.content.length > 2000) {
            console.log("Event description is too long.");
            return false;
        }

        return true;
    }

    return {
        getBeforeVal,
        isEmptyObject, // 안 쓰이는 거 같음
        flattenRichText,
        hasTime,
        hasDate,
        processDate,
        allDay,
        writable,
        convertPageToCommonEvent,
        splitEventFoUpdate,
        extNessasaryPproperly,
        getBaseNotionProperties,
        getRelativeDate,
        parseEvents,
        handleEventCancelled,
        //@Todo 이거는 타입인데? 다른 곳으로 빼야 하는 거 아니야?
        InvalidEventError,
        convertToNotionProperty,
        checkNotionProperty,
        getLocaleISOTime
    }
})()

if (typeof module !== 'undefined') module.exports = UTIL;