const SERVICE = (() => {
    return {
        syncableToGcal,
        //getPageFromEvent,
        //createDatabaseEntry
        //updateDatabaseEntry,
    }
})()

//@Todo 네이밍이 SyncToGcal 컨트롤러랑 겹치는데??
function syncableToGcal(result, syncableList, calendarList) {

    const {needUpdateList, needRecreateList, needCreateList} = syncableList

    needRecreateList.data.forEach(commonEvent => {
        API.GCAL.deleteGcalEvent(commonEvent.gCalEId, commonEvent.gCalCalId, calendarList)
        return
        API.GCAL.createGcalEvent(result, commonEvent, commonEvent.gCalCalName)
        console.log(
            "[+GC] Event %s moved to %s.",
            commonEvent.gCalEId, commonEvent.gCalCalName
        );
    })
    needUpdateList?.data.forEach(commonEvent => {
        // Update commonEvent in original calendar.
        API.GCAL.updateGcalEvent(commonEvent);
        console.log("[+GC] Updating commonEvent %s in %s.",
            commonEvent.gCalEId, commonEvent.gCalCalId);
    })
    needCreateList?.data.forEach(commonEvent => {
        API.GCAL.createGcalEvent(result, commonEvent, commonEvent.gCalCalName)
        console.log("[+GC] Event created in %s.", commonEvent.gCalCalName);
    })
}



/**
 * 이벤트를 위한 페이지가 있는 지 그리고 갱신이 필요한 지 판단. 발견되면 페이지 정보 반환ㄴ
 * @param {CalendarEvent} event
 * @param {string|undefined} on_before_date Max value of last sync date to consider. If Null or not provided, will not restrict. Default is null.
 * @returns {*} Page response if found.
 */
// function getPageFromEvent(event, on_before_date = null) {
//   const url = NOTION_CREDENTIAL_OBJ.databaseUrl();
//   let payload = {
//     filter: {
//       and: [{ property: CONFIG.CALENDAR_EVENT_ID_PROP_NOTION, rich_text: { equals: event.id } }],
//     },
//   };
//   if (on_before_date) {
//     payload["filter"]["and"].push({
//       property: CONFIG.LAST_SYNC_PROP_NOTION,
//       date: { on_or_before: new Date().toISOString(on_before_date) },
//     });
//   }
//   const response_data = notionFetch(url, payload, "POST");
//   if (response_data.results.length > 0) {
//     if (response_data.results.length > 1) {
//       console.log(
//         "Found multiple entries with event id %s. This should not happen. Only considering index zero entry.",
//         event.id
//       );
//     }
//     return response_data.results[0];
//   }
//   return false;
// }


/**
 * Update database entry with new event information
 * @param {CalendarEvent} event Modified Google calendar event
 * @param {String} page_id Page ID of database entry
 * @param {String[]} existing_tags Existing tags of the page to keep.
 * @param {Boolean} multi Whenever or not the update is meant for a multi-fetch
 * @returns {*} request object if multi is true, fetch response if multi is false
 */
// function updateDatabaseEntry(event, page_id, existing_tags = [], multi = true) {
//   let properties = convertToNotionProperty(event, existing_tags);
//   let archive = CONFIG.ARCHIVE_NOTION_EVENTS_GCAL_REMOVED && event.status === "cancelled";
//   return API.updateNotionPage(properties, page_id, archive, multi);
// }


/**
 * 이벤트로부터 새 데이터베이스 엔트리를 생성
 * @param {CalendarEvent} event modified GCal event object
 * @returns {*} request object
 */
// function createDatabaseEntry(event) {
//   const url = "https://api.notion.com/v1/pages";
//   let payload = {};
//   payload["parent"] = {
//     type: "database_id",
//     database_id: DATABASE_ID,
//   };
//   payload["properties"] = convertToNotionProperty(event);
//   if (!checkNotionProperty(payload["properties"])) {
//     throw new InvalidEventError("Invalid Notion property structure");
//   }
//   let options = {
//     url: url,
//     method: "POST",
//     headers: NOTION_CREDENTIAL_OBJ.headers,
//     muteHttpExceptions: true,
//     payload: JSON.stringify(payload),
//   };
//   return options;
// }









