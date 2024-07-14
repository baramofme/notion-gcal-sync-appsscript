const SERVICE = (() => {
    return {
        syncableToGcal,
        getPageFromEvent,
        createDatabaseEntry,
        updateDatabaseEntry,
    }
})()

//@Todo 네이밍이 SyncToGcal 컨트롤러랑 겹치는데??
function syncableToGcal(result, syncableList, calendarList) {

    const {needUpdateList, needRecreateList, needCreateList} = syncableList

    function updateNotionPageLastSyncDate(pageId) {
        const now = new Date()
        now.setMinutes(now.getMinutes())

        let properties = {
            [CONFIG.LAST_SYNC_PROP_NOTION]: {
                type: "date",
                date: {
                    // start: new Date().toISOString(),
                    start: now.toISOString(),
                },
            },
        }
        API.NOTION.updateNotionPage(properties, pageId);
    }

    // @Todo 나중에 아래 세 뭉치 추상화 하기
    // @Todo 없으면 실행 안하도록.
    // @try-catch 적용 필요
    for (const commonEvent of needRecreateList.data) {

        // @Todo 삭제는 되었는데 생성이 안된 경우가 발생하면 롤백을 할 수 있나? 다시 생성 시도?
        const deletedCcalEid = API.GCAL.deleteGcalEvent(commonEvent.gCalEId, commonEvent.gCalCalId, calendarList)
        const newGcalEId = API.GCAL.createGcalEvent(commonEvent)

        if (!!deletedCcalEid && !!newGcalEId) {
            updateNotionPageLastSyncDate(commonEvent.nPageId)
            needRecreateList.synced.push(newGcalEId)
            console.log(
                "[+GC] Event %s %s moved to %s.",
                commonEvent.nTitle, commonEvent.gCalEId, commonEvent.gCalCalName
            );
        }

    }
    for (const commonEvent of needUpdateList.data) {
        // Update commonEvent in original calendar.
        const isSuccess = API.GCAL.updateGcalEvent(commonEvent);
        // console.log(commonEvent)
        if (isSuccess) {
            // console.log(result)
            // console.log(result.properties[CONFIG.LAST_SYNC_PROP_NOTION])
            updateNotionPageLastSyncDate(commonEvent.nPageId)
            needCreateList.synced.push(commonEvent.gCalEId)
            console.log("[+GC] Event %s Updated %s in %s.",
                commonEvent.nTitle, commonEvent.gCalEId, commonEvent.gCalCalId);
        }
    }
    for (const commonEvent of needCreateList.data) {
        const newGcalEId = API.GCAL.createGcalEvent(commonEvent)
        if (!!newGcalEId) {
            updateNotionPageLastSyncDate(commonEvent.nPageId)
            needCreateList.synced.push(newGcalEId)
            console.log("[+GC] Event %s %s created in %s ", commonEvent.nTitle,newGcalEId,commonEvent.gCalCalName);
        }
    }

    // console.log(needCreateList.synced)
    let allSyncedList = [].concat(needRecreateList.synced,needUpdateList.synced, needCreateList.synced)
    return allSyncedList

}


/**
 * 이벤트를 위한 페이지가 있는 지 그리고 갱신이 필요한 지 판단. 발견되면 페이지 정보 반환ㄴ
 * @param {CalendarEvent} event
 * @param {string|undefined} on_before_date Max value of last sync date to consider. If Null or not provided, will not restrict. Default is null.
 * @returns {*} Page response if found.
 */
 function getPageFromEvent(event, on_before_date = null) {
   const url = NOTION_CREDENTIAL_OBJ.databaseUrl;
   let payload = {
     filter: {
       and: [{ property: CONFIG.CALENDAR_EVENT_ID_PROP_NOTION, rich_text: { equals: event.id } }],
     },
   };
   if (on_before_date) {
     payload["filter"]["and"].push({
       property: CONFIG.LAST_SYNC_PROP_NOTION,
       date: { on_or_before: new Date().toISOString(on_before_date) },
     });
   }
   const response_data = API.NOTION.notionFetch(url, payload, "POST");
   if (response_data.results.length > 0) {
     if (response_data.results.length > 1) {
       console.log(
         "Found multiple entries with event id %s. This should not happen. Only considering index zero entry.",
         event.id
       );
     }
     return response_data.results[0];
   }
   return false;
 }


/**
 * Update database entry with new event information
 * @param {CalendarEvent} event Modified Google calendar event
 * @param {String} page_id Page ID of database entry
 * @param {String[]} existing_tags Existing tags of the page to keep.
 * @param {Boolean} multi Whenever or not the update is meant for a multi-fetch
 * @returns {*} request object if multi is true, fetch response if multi is false
 */
 function updateDatabaseEntry(event, page_id, existing_tags = [], multi = true) {
   let properties = UTIL.convertToNotionProperty(event, existing_tags);
   let archive = CONFIG.ARCHIVE_NOTION_EVENTS_GCAL_REMOVED && event.status === "cancelled";
   return API.NOTION.updateNotionPage(properties, page_id, archive, multi);
 }


/**
 * 이벤트로부터 새 데이터베이스 엔트리를 생성
 * @param {CalendarEvent} event modified GCal event object
 * @returns {*} request object
 */
 function createDatabaseEntry(event) {
   const url = "https://api.notion.com/v1/pages";
   let payload = {};
   payload["parent"] = {
     type: "database_id",
     database_id: NOTION_CREDENTIAL_OBJ.databaseId,
   };
   payload["properties"] = UTIL.convertToNotionProperty(event);
   if (!UTIL.checkNotionProperty(payload["properties"])) {
     throw new UTIL.InvalidEventError("Invalid Notion property structure");
   }
   let options = {
     url: url,
     method: "POST",
     headers: NOTION_CREDENTIAL_OBJ.headers,
     muteHttpExceptions: true,
     payload: JSON.stringify(payload),
   };
   return options;
 }









