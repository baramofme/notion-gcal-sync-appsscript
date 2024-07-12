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

    function getOnlyCancelledTaggedPagesNotion() {
        const {ignoredTagFilter, cancelledTagFilter} = RULES.FILTER
        const url = NOTION_CREDENTIAL_OBJ.databaseUrl;
        const payload = {
            filter: {
                and: [
                    // 무시하거나 취소되지 않음
                    ignoredTagFilter(false),
                    cancelledTagFilter()
                ]
            }
        };

        return notionFetch(url, payload, "POST");
    }

    function getOnlyAllowSyncPagesNotion() {
        const {ignoredTagFilter, cancelledTagFilter, shouldHaveDateStatsFilterArr} = RULES.FILTER
        const url = NOTION_CREDENTIAL_OBJ.databaseUrl;
        const payload = {
            sorts: [{timestamp: "last_edited_time", direction: "descending"}],
            filter: {
                and: [
                    ignoredTagFilter(false),
                    cancelledTagFilter(false),
                    {
                        property: CONFIG.EXT_FILTER_PROP_NOTION,
                        select: {
                            equals: CONFIG.EXT_FILTER_VALUE_NOTION
                        }
                    }
                ],
                or: [
                    ...shouldHaveDateStatsFilterArr
                ]
            }
        }
        const res = notionFetch(url, payload, "POST");
        Logger.log(res)
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
    function pushDatabaseUpdate(
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

    function getAllCalendar() {
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

        //Logger.log(calendars)
        return calendars;
    }

    /** Delete event from Google calendar
     * @param {String} event_id - Event id to delete
     * @param {String} calendar_id - Calendar id to delete event from
     * @param {Object} calendarList -
     * @returns {Boolean} - True if event was deleted, false if not
     */
    function deleteEvent(event_id, calendar_id, calendarList) {
        console.log("Deleting event %s from gCal %s", event_id, calendar_id)

        if (!calendar_id) {
            const beforeGCalEventList = API.GCAL.findEventWithinCalendars(event_id, calendarList)
            Logger.log(beforeGCalEventList)
        }
        try {
            let calendar = CalendarApp.getCalendarById(calendar_id);
            calendar.getEventById(event_id).deleteEvent();
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    // 배열 반환
    // @TODO 할 것
    function findEventWithinCalendars(eventId, calendarList) {
        const calendarIdList = Object.keys(calendarList).map(calKey => {
            const cal = calendarList[calKey]
            return cal.writable && cal.id
        })
        const findResult = calendarIdList.map(calId => {
            const event = Calendar.Events.get(calId, eventId);
            Logger.log(event)
            return event
        })
    }

    /** Update Google calendar event
     * @param {CalendarEvent} event - Modified event object for gCal
     * @param {String} page_id - Page ID of Notion page to update
     * @param {String} calendar_id - Calendar ID of calendar to update event from
     * @return {Boolean} True if successful, false otherwise
     */
    function pushEventUpdate(event, event_id, calendar_id) {
        event.summary = event.summary || "";
        event.description = event.description || "";
        event.location = event.location || "";
        try {
            let calendar = CalendarApp.getCalendarById(calendar_id);
            let cal_event = calendar.getEventById(event_id);
            cal_event.setDescription(event.description);
            cal_event.setTitle(event.summary);
            cal_event.setLocation(event.location);

            if (event.end && event.all_day) {
                // all day, multi day
                let shifted_date = new Date(event.end);
                shifted_date.setDate(shifted_date.getDate() + 2);
                cal_event.setAllDayDates(new Date(event.start), shifted_date);
            } else if (event.all_day) {
                // all day, single day
                cal_event.setAllDayDate(new Date(event.start));
            } else {
                // not all day
                cal_event.setTime(new Date(event.start), new Date(event.end) || null);
            }
            return true;
        } catch (e) {
            console.log("Failed to push event update to GCal. %s", e);
            return false;
        }
    }

    return {
        NOTION: {
            getOnlyCancelledTaggedPagesNotion,
            getOnlyAllowSyncPagesNotion,
            pushDatabaseUpdate,
        },
        GCAL: {
            findEventWithinCalendars,
            getAllCalendar,
            deleteEvent,
            pushEventUpdate
        }
    }
})()


