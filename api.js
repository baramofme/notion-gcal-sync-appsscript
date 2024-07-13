if (typeof require !== 'undefined') {
    MockData = require('./__tests__/min/MockData.js');
    Calendar = {
        CalendarList: {
            list: () => {
                return {
                    items:
                        [{
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
                                id: '11111@group.calendar.google.com',
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
                                id: 'family111111@group.calendar.google.com',
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

