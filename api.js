/**
 * ========== 노션용 CRUD ==============
 */

function getOnlyCancelledTagedPagesNotion() {
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

function getOnlyAllowSyncPagesNotion(){
  const url = NOTION_CREDENTIAL_OBJ.databaseUrl;
  const payload = {
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    filter: {
      and: [
        ignoredTagFilter(false),
        cancelledTagFilter(false),
        schedulePriorityFilter
      ],
      or: [
          ...shouldHaveDateStatsFilterArr
      ]
    }
  }
  const res = notionFetch(url, payload, "POST");
  Logger.log(res)
  return res
};

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
 * ========== 노션용 필터 ==============
 */

// 노션 필터 - 취소된 작업
const cancelledTagFilter = (containsBool = true) => ({
  property: CONFIG.SYNC_OPT_TAG_PROP_NOTION,
  multi_select: {
    ...(containsBool 
      ? {contains: CONFIG.SYNC_OPT_CANCELLED_VALUE_NOTION}
      : {does_not_contain: CONFIG.SYNC_OPT_CANCELLED_VALUE_NOTION}
    )
  },
})
const ignoredTagFilter = (containsBool = true) => ({
  property: CONFIG.SYNC_OPT_TAG_PROP_NOTION,
  multi_select: {
    ...(containsBool 
      ? {contains: CONFIG.SYNC_OPT_IGNORE_VALUE_NOTION}
      : {does_not_contain: CONFIG.SYNC_OPT_IGNORE_VALUE_NOTION}
    )
  },
})

// 노션 필터 - 우선순위가 일정인 것만
const schedulePriorityFilter = {
  property: CONFIG.EXT_FILTER_PROP_NOTION,
  select: {
    equals: CONFIG.EXT_FILTER_VALUE_NOTION
  }
}

// 날짜를 가져야 하는 상태 필터 묶음
const shouldHaveDateStatsFilterArr =
// 진행상태가 실행 2주일 전과 실행중인 것만 포함한다.
[
  {
    "property": "진행 상태",
    "status": {
      "equals":"곧 1 ⛅"
    }
  },
  {
    "property": "진행 상태",
    "status": {
      "equals":"언젠가 1 🗓️"
    }
  },
  {
    "property": "진행 상태",
    "status": {
      "equals":"시작 전 2"
    }
  },
  {
    "property": "진행 상태",
    "status": {
      "equals":"진행 중 2"
    }
  },
  {
    "property": "진행 상태",
    "status": {
      "equals":"위임추적 3 ⚙️"
    }
  },
  {
    "property": "진행 상태",
    "status": {
      "equals":"막힘 3"
    }
  },
]

/**
 * ========== 구글용 ==============
 */

function getAllCalendar(){
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
 * @returns {Boolean} - True if event was deleted, false if not
 */
// function deleteEvent(event_id, calendar_id) {
//   console.log("Deleting event %s from gCal %s", event_id, calendar_id);
//   try {
//     let calendar = CalendarApp.getCalendarById(calendar_id);
//     calendar.getEventById(event_id).deleteEvent();
//     return true;
//   } catch (e) {
//     console.log(e);
//     return false;
//   }
// }