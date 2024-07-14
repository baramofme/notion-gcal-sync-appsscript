if (typeof require !== 'undefined') {
    MockData = require('./__tests__/min/MockData.js');
    Calendar = {
        CalendarList: {
            list: () => {
                return {
                    items: [
                        {
                            colorId: '7',
                            backgroundColor: '#42d692',
                            conferenceProperties: [Object],
                            accessRole: 'reader',
                            description: 'USA Holiday',
                            etag: '""',
                            defaultReminders: [],
                            summaryOverride: 'USA Holiday',
                            timeZone: 'America/Los_Angeles',
                            id: 'en.usa#holiday@group.v.calendar.google.com',
                            summary: 'USA Holiday',
                            foregroundColor: '#000000',
                            kind: 'calendar#calendarListEntry',
                            selected: true
                        },
                        {
                            timeZone: 'America/Los_Angeles',
                            accessRole: 'owner',
                            foregroundColor: '#000000',
                            primary: true,
                            backgroundColor: '#9fe1e7',
                            id: 'main@gmail.com',
                            selected: true,
                            kind: 'calendar#calendarListEntry',
                            defaultReminders: [],
                            conferenceProperties: [Object],
                            etag: '""',
                            summary: 'Personal',
                            colorId: '14'
                        },
                        {
                            defaultReminders: [],
                            summary: 'Time table',
                            kind: 'calendar#calendarListEntry',
                            accessRole: 'owner',
                            id: 'time@group.calendar.google.com',
                            colorId: '12',
                            backgroundColor: '#fad165',
                            foregroundColor: '#000000',
                            timeZone: 'America/Los_Angeles',
                            etag: '""',
                            description: 'Time table',
                            conferenceProperties: [Object]
                        },
                        {
                            summaryOverride: 'Family',
                            summary: 'Family',
                            accessRole: 'writer',
                            defaultReminders: [],
                            timeZone: 'UTC',
                            id: 'family@group.calendar.google.com',
                            foregroundColor: '#000000',
                            conferenceProperties: [Object],
                            colorId: '24',
                            etag: '""',
                            backgroundColor: '#a47ae2',
                            kind: 'calendar#calendarListEntry',
                            selected: true
                        },
                        {
                            description: 'Google person birthday etc',
                            colorId: '13',
                            foregroundColor: '#000000',
                            backgroundColor: '#92e1c0',
                            id: 'addressbook#contacts@group.v.calendar.google.com',
                            accessRole: 'reader',
                            etag: '""',
                            kind: 'calendar#calendarListEntry',
                            timeZone: 'America/Los_Angeles',
                            defaultReminders: [],
                            summaryOverride: 'birthday',
                            summary: 'birthday',
                            conferenceProperties: [Object]
                        }],
                    kind: 'calendar#calendarList',
                    nextSyncToken: '',
                    etag: '""'
                }

            }
        }
    }
}
const API = (() => {
    /**
     * ========== 노션용 CRUD ==============
     */

    /**
     * Interact with notion API
     * @param {String} url - url to send request to
     * @param {Object} payload_dict - payload to send with request
     * @param {String} method - method to use for request
     * @returns {Object} request response object
     */
    function notionFetch(url, payload_dict, method = "POST") {
        // UrlFetchApp is sync even if async is specified
        let options = {
            method: method,
            headers: NOTION_CREDENTIAL_OBJ.headers,
            muteHttpExceptions: true,
            ...(payload_dict && {payload: JSON.stringify(payload_dict)}),
        };

        const response = UrlFetchApp.fetch(url, options);

        if (response.getResponseCode() === 200) {
            const response_data = JSON.parse(response.getContentText());
            if (response_data.length == 0) {
                throw new Error(
                    "No data returned from Notion API. Check your Notion token."
                );
            }
            return response_data;
        } else if (response.getResponseCode() === 401) {
            throw new Error("Notion token is invalid.");
        } else {
            throw new Error(response.getContentText());
        }
    }

    function getCancelledTaggedNotionPages() {
        const {
            notArchived,
            priorityIsSchedule,
            doDateNotEmpty,
            // @Todo tag 에서 select 로 바뀌면서 둘은 함께가 아니라 경합하는 사이. 그래서 이렇게 둘 다 써줄 필요가 없는데.
            // 하직 뒷부분 코드를 안봐서 뭐가 있는 지 모르니 나중에 필요 없어지면 제거할 것
            ignoredTagFilter,
            cancelledTagFilter
        } = RULES.FILTER
        const url = NOTION_CREDENTIAL_OBJ.databaseUrl;
        const payload = {
            filter: {
                and: [
                    notArchived,
                    doDateNotEmpty,
                    priorityIsSchedule,
                    // 무시아니고 취소만됨
                    cancelledTagFilter(),
                    ignoredTagFilter(false),
                ]
            }
        };

        return notionFetch(url, payload, "POST");
    }

    function getFilteredNotionPages() {
        const {
            notArchived,
            priorityIsSchedule,
            doDateNotEmpty,
            ignoredTagFilter,
            cancelledTagFilter,
            shouldHaveDateStatsFilterArr
        } = RULES.FILTER
        const url = NOTION_CREDENTIAL_OBJ.databaseUrl;
        const payload = {
            sorts: [{timestamp: "last_edited_time", direction: "descending"}],
            filter: {
                and: [
                    notArchived,
                    doDateNotEmpty,
                    priorityIsSchedule,
                    ignoredTagFilter(false),
                    cancelledTagFilter(false)
                ],
                or: [
                    ...shouldHaveDateStatsFilterArr
                ]
            }
        }
        const res = notionFetch(url, payload, "POST");
        return res
    }

    /**
     * Push update to notion database for page
     * @param {Object} properties
     * @param {String} page_id page id to update
     * @param {Boolean} archive whenever or not to archive the page
     * @param {Boolean} multi whenever or not to use single fetch, or return options for fetchAll
     * @returns {*} request object if multi, otherwise URL fetch response
     */
    function updateNotionPage(
        properties,
        page_id,
        archive = false,
        multi = false
    ) {
        //console.log("updateNotionPage", page_id)
        const url = "https://api.notion.com/v1/pages/" + page_id;
        let payload = {};
        payload["properties"] = properties;
        payload["archived"] = archive;

        if (archive) {
            console.log("Archiving cancelled event.");
        }

        let options = {
            method: "PATCH",
            headers: NOTION_CREDENTIAL_OBJ.headers,
            muteHttpExceptions: true,
            payload: JSON.stringify(payload),
        };

        if (multi) {
            options["url"] = url;
            return options;
        }

        return UrlFetchApp.fetch(url, options);
    }

    /**
     * ========== 구글용 ==============
     */

    function getAllGcalCalendar(onlyIncludesList = []) {

        let calendarList = Calendar.CalendarList.list().items;
        var calendars = {};

        for(const calendar of calendarList) {

            if(!onlyIncludesList.includes(calendar.summary)) continue

            const writable = calendar.accessRole === 'owner' || calendar.accessRole === 'writer'

            calendars[calendar.summary] = {
                id: calendar.id,
                summary: calendar.summary,
                writable,
                description: calendar.description
            }
        }

        return calendars;
    }

    /** Create event to Google calendar. Return event ID if successful
     * @param {Object} page - Page object from Notion database
     * @param {Object} commonEvent - Event object for gCal
     * @return {String} - Event ID if successful, false otherwise
     */

    function createGcalEvent(commonEvent) {

        const {
            nPageId, gCalCalName, gCalEId, gCalCalId, gCalSummary, location, description,
            start, end, allDay
        } = commonEvent

        let calendarId = CALENDAR_IDS[gCalCalName].id;
        let options = [gCalSummary, new Date(start)];


        if (end && allDay) {
            // add and shift
            let shifted_date = new Date(end);
            shifted_date.setDate(shifted_date.getDate() + 1);
            options.push(shifted_date);
        } else if (end) {
            options.push(new Date(end));
        }

        options.push({description: description, location: location});

        let calendar = CalendarApp.getCalendarById(calendarId);

        // console.log('calendar options', options)
        // console.log('calendar id', calendarId)
        // console.log('calendar gCalCalName', gCalCalName)

        let newEventId = ""

        try {
            // console.log("create(All)Event")
            // console.log(start,end,allDay)
            // console.log(...options)
            let new_event = allDay
                ? calendar.createAllDayEvent(...options)
                : calendar.createEvent(...options);
            newEventId = new_event.getId().split("@")[0];
        } catch (e) {
            console.log("Failed to push new event to GCal. %s", e);
            return false;
        }

        if (!newEventId) {
            console.log("Event %s not created in gCal.", gCalSummary);
            return false;
        }

        // @Todo 아래를 별도로 분리하는 거 어떨까?
        // 리턴을 하면, 호출한 곳에서 아래 내용을 실핸하는 거지. 함수 이름하고 상관 없는 일을 학 있어 지금
        // @Todo 이해가 필요.
        // 변경할 props 에 해당하는 구조를 마들고 그것만 노션에 patch
        // 커먼객체로 변환 -> getNotionEventWith(속성명) 이렇게 가져온 다음에
        // API 는 그대로 이용하면 어떨까?
        // API 호출도 객체에서 해버리면... 어떨까?
        // 어차피 여기서만 쓰고 버린다는 생각을 하면 여기서 끝인 게 맞기도 한데.
        let properties = UTIL.getBaseNotionProperties(newEventId, gCalCalName);
        API.NOTION.updateNotionPage(properties, nPageId);
        return newEventId;
    }

    /** Delete event from Google calendar
     * @param {String} eventId - Event id to delete
     * @param {String} calendarId - Calendar id to delete event from
     * @param {Object} calendarList -
     * @returns {Boolean} - True if event was deleted, false if not
     */
    function deleteGcalEvent(eventId, calendarId, calendarList) {
        console.log("Deleting event %s from gCal %s", eventId, calendarId)

        if (!calendarId) {
            const beforeGCalEventList = API.GCAL.findGcalEventWithin(eventId, calendarList)
            // console.log("Before delete: ", beforeGCalEventList)
        }
        try {
            let calendar = CalendarApp.getCalendarById(calendarId);
            calendar.getEventById(eventId).deleteGcalEvent();
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    // 배열 반환
    // @TODO 할 것
    function findGcalEventWithin(eventId, calendarList) {
        const writableCaleList = Object.keys(calendarList).map(calKey => {
            const cal = calendarList[calKey]
            return cal.writable && cal.id
        })
        const findResult = writableCaleList.map(calId => {
            const event = Calendar.Events.get(calId, eventId);
            return event
        })
        return findResult
    }

    // @Todo eventId 랑, calendarId 를 안 줘도 되는데?; 귀찮네.
    // @Todo 나머지는 id 를 반환하는데, 예만 Boolean 을 반환해? ;;
    /** Update Google calendar event
     * @param {CommonEvent} commonEvent - Modified event object for gCal
     * @param {String} page_id - Page ID of Notion page to update
     * @param {String} calendar_id - Calendar ID of calendar to update event from
     * @return {Boolean} True if successful, false otherwise
     */
    function updateGcalEvent(commonEvent) {

        const {
            gCalEId, gCalCalId, gCalSummary, location, description,
            start, end, allDay
        } = commonEvent
        try {
            let calendar = CalendarApp.getCalendarById(gCalCalId);
            let calEvent = calendar.getEventById(gCalEId);
            calEvent.setDescription(description);
            calEvent.setTitle(gCalSummary);
            calEvent.setLocation(location);

            if (end && allDay) {
                // all day, multi day
                let shifted_date = new Date(end);
                shifted_date.setDate(shifted_date.getDate() + 2);
                calEvent.setAllDayDates(new Date(start), shifted_date);
            } else if (allDay) {
                // all day, single day
                calEvent.setAllDayDate(new Date(start));
            } else {
                // not all day
                calEvent.setTime(new Date(start), new Date(end) || null);
            }
            return true;
        } catch (e) {
            console.log("Failed to push event update to GCal. %s", e);
            return false;
        }
    }

    return {
        NOTION: {
            getCancelledTaggedNotionPages,
            getFilteredNotionPages,
            updateNotionPage,
            // @ 어떤 거는 직접 호출하고, 어떤 거는 한번 거쳐서 호출하고.. 중구 난방이여
            notionFetch
        },
        GCAL: {
            findGcalEventWithin,
            createGcalEvent,
            getAllGcalCalendar,
            deleteGcalEvent,
            updateGcalEvent
        }
    }
})()

if (typeof module !== 'undefined') module.exports = API;

