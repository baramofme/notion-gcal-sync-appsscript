if (typeof require !== 'undefined') {
    MockData = require('./__tests__/min/MockData.js');
    Calendar = {
        CalendarList: {
            list: () => {
                return { items:
                        [ { colorId: '7',
                            backgroundColor: '#42d692',
                            conferenceProperties: [Object],
                            accessRole: 'reader',
                            description: '대한민국의 공휴일',
                            etag: '"1658723053756000"',
                            defaultReminders: [],
                            summaryOverride: '대한민국의 휴일',
                            timeZone: 'Asia/Seoul',
                            id: 'ko.south_korea#holiday@group.v.calendar.google.com',
                            summary: '대한민국의 휴일',
                            foregroundColor: '#000000',
                            kind: 'calendar#calendarListEntry',
                            selected: true },
                            { timeZone: 'Asia/Seoul',
                                accessRole: 'owner',
                                foregroundColor: '#000000',
                                primary: true,
                                backgroundColor: '#9fe1e7',
                                id: 'baram204@gmail.com',
                                selected: true,
                                kind: 'calendar#calendarListEntry',
                                defaultReminders: [],
                                conferenceProperties: [Object],
                                etag: '"1718209136093000"',
                                summary: '개인',
                                colorId: '14' },
                            { defaultReminders: [],
                                summary: '타임 테이블',
                                kind: 'calendar#calendarListEntry',
                                accessRole: 'owner',
                                id: 'irbdktg0ce0l3haioo7kc05lfg@group.calendar.google.com',
                                colorId: '12',
                                backgroundColor: '#fad165',
                                foregroundColor: '#000000',
                                timeZone: 'Asia/Seoul',
                                etag: '"1720409437000000"',
                                description: '타임 테이블 보기용 달력',
                                conferenceProperties: [Object] },
                            { summaryOverride: '가족',
                                summary: '가족',
                                accessRole: 'writer',
                                defaultReminders: [],
                                timeZone: 'UTC',
                                id: 'family04088495301278171384@group.calendar.google.com',
                                foregroundColor: '#000000',
                                conferenceProperties: [Object],
                                colorId: '24',
                                etag: '"1720435922972000"',
                                backgroundColor: '#a47ae2',
                                kind: 'calendar#calendarListEntry',
                                selected: true },
                            { description: 'Google 주소록에 등록된 사람들의 생일, 기념일, 기타 일정 날짜를 표시합니다.',
                                colorId: '13',
                                foregroundColor: '#000000',
                                backgroundColor: '#92e1c0',
                                id: 'addressbook#contacts@group.v.calendar.google.com',
                                accessRole: 'reader',
                                etag: '"1720435939916000"',
                                kind: 'calendar#calendarListEntry',
                                timeZone: 'Asia/Seoul',
                                defaultReminders: [],
                                summaryOverride: '생일',
                                summary: '생일',
                                conferenceProperties: [Object] } ],
                    kind: 'calendar#calendarList',
                    nextSyncToken: 'CMja8I-qnIcDEhJiYXJhbTIwNEBnbWFpbC5jb20=',
                    etag: '"p334dls4flae8e0o"' }

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
        const {ignoredTagFilter, cancelledTagFilter, notArchived, extFilter} = RULES.FILTER
        const url = NOTION_CREDENTIAL_OBJ.databaseUrl;
        const payload = {
            filter: {
                and: [
                    // 보관되지 않음
                    notArchived,
                    // 무시하거나 취소되지 않음
                    ignoredTagFilter(false),
                    cancelledTagFilter(),
                    extFilter
                ]
            }
        };

        return notionFetch(url, payload, "POST");
    }

    function getFilteredNotionPages() {
        const {
            ignoredTagFilter,
            cancelledTagFilter,
            extFilter,
            notArchived,
            shouldHaveDateStatsFilterArr
        } = RULES.FILTER
        const url = NOTION_CREDENTIAL_OBJ.databaseUrl;
        const payload = {
            sorts: [{timestamp: "last_edited_time", direction: "descending"}],
            filter: {
                and: [
                    notArchived,
                    ignoredTagFilter(false),
                    cancelledTagFilter(false),
                    extFilter
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

    function getAllGcalCalendar() {
        var calendarList = Calendar.CalendarList.list();
        var calendars = {};

        calendarList.items.forEach(calendar => {

            const writable = calendar.accessRole === 'owner' || calendar.accessRole === 'writer'

            calendars[calendar.summary] = {
                id: calendar.id,
                summary: calendar.summary,
                writable,
                description: calendar.description
            }
        })

        return calendars;
    }

    /** Delete event from Google calendar
     * @param {String} event_id - Event id to delete
     * @param {String} calendar_id - Calendar id to delete event from
     * @param {Object} calendarList -
     * @returns {Boolean} - True if event was deleted, false if not
     */
    function deleteGcalEvent(event_id, calendar_id, calendarList) {
        console.log("Deleting event %s from gCal %s", event_id, calendar_id)

        if (!calendar_id) {
            const beforeGCalEventList = API.GCAL.findGcalEventWithin(event_id, calendarList)
        }
        try {
            let calendar = CalendarApp.getCalendarById(calendar_id);
            calendar.getEventById(event_id).deleteGcalEvent();
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    // 배열 반환
    // @TODO 할 것
    function findGcalEventWithin(eventId, calendarList) {
        const calendarIdList = Object.keys(calendarList).map(calKey => {
            const cal = calendarList[calKey]
            return cal.writable && cal.id
        })
        const findResult = calendarIdList.map(calId => {
            const event = Calendar.Events.get(calId, eventId);
            return event
        })
    }

    // @Todo eventId 랑, calendarId 를 안 줘도 되는데?; 귀찮네.
    /** Update Google calendar event
     * @param {CommonEvent} commonEvent - Modified event object for gCal
     * @param {String} page_id - Page ID of Notion page to update
     * @param {String} calendar_id - Calendar ID of calendar to update event from
     * @return {Boolean} True if successful, false otherwise
     */
    function updateGcalEvent(commonEvent, event_id, calendar_id) {

        try {
            let calendar = CalendarApp.getCalendarById(calendar_id);
            let calEvent = calendar.getEventById(event_id);
            calEvent.setDescription(commonEvent.description);
            calEvent.setTitle(commonEvent.gCalSummary);
            calEvent.setLocation(commonEvent.location);

            if (commonEvent.end && commonEvent.allDay) {
                // all day, multi day
                let shifted_date = new Date(commonEvent.end);
                shifted_date.setDate(shifted_date.getDate() + 2);
                calEvent.setAllDayDates(new Date(commonEvent.start), shifted_date);
            } else if (commonEvent.allDay) {
                // all day, single day
                calEvent.setAllDayDate(new Date(commonEvent.start));
            } else {
                // not all day
                calEvent.setTime(new Date(commonEvent.start), new Date(commonEvent.end) || null);
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
        },
        GCAL: {
            findGcalEventWithin,
            getAllGcalCalendar,
            deleteGcalEvent,
            updateGcalEvent
        }
    }
})()

if (typeof module !== 'undefined') module.exports = API;

