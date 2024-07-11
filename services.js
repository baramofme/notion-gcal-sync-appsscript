/** Delete events marked as cancelled in gcal */
function processCancelledEvents() {
  
  if (!CONFIG.REMOVE_GCAL_EVENTS_NOTION_CANCELLED) return

  console.log("[-GCal] Deleting cancel tagged events from GCal");

  const response_data = getOnlyCancelledTagedPagesNotion()

  const updatedRecentlyPages = response_data.results.filter(page => isPageUpdatedRecently(page))


  const updateEventInfoForGcal  = updatedRecentlyPages.map(page => convertPageToCommonEvent(page, eventPropertyExtractioinRules, CALENDAR_IDS))
  
  const deletedIds = tryDeleteGcalEvent(updateEventInfoForGcal)

  if(CONFIG.ARCHIVE_NOTION_EVENTS_GCAL_REMOVED) {
    deletedIds.forEach(pageId => pushDatabaseUpdate([], arr.pageId, true))
  }
  
  function extractEventAndCalendarIdObj(page){
    return {
        pageId: page.id,
        eventId : flattenRichText(page.properties[CONFIG.EVENT_ID_PROP_NOTION].rich_text),
        calendarId : page.properties[CONFIG.CALENDAR_ID_PROP_NOTION].select.name
    }
  }

  function tryDeleteGcalEvent(arr){
    const deletedPageIds = []
    arr.forEach(obj => {
      try {
        deletedPageIds.push(obj.id)
        deleteEvent(obj.eventId, obj.gCalId);
      } catch (e) {
        if (e instanceof TypeError) {
          console.log("[-GCal] Error. Page missing calendar id or event ID");
        } else {
          throw e;
        }
      } finally {
      }
    })
    return deletedPageIds
  }
}


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

//   return pushDatabaseUpdate(properties, page_id, archive, multi);
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
//       and: [{ property: CONFIG.EVENT_ID_PROP_NOTION, rich_text: { equals: event.id } }],
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







/** Create event to Google calendar. Return event ID if successful
 * @param {Object} page - Page object from Notion database
 * @param {Object} event - Event object for gCal
 * @param {String} calendar_name - name of calendar to push event to
 * @return {String} - Event ID if successful, false otherwise
 */
// function createEvent(page, event, calendar_name) {
//   event.summary = event.summary || "";
//   event.description = event.description || "";
//   event.location = event.location || "";

//   let calendar_id = CALENDAR_IDS[calendar_name];
//   let options = [event.summary, new Date(event.start)];

//   if (event.end && event.all_day) {
//     // add and shift
//     let shifted_date = new Date(event.end);
//     shifted_date.setDate(shifted_date.getDate() + 1);
//     options.push(shifted_date);
//   } else if (event.end) {
//     options.push(new Date(event.end));
//   }

//   options.push({ description: event.description, location: event.location });

//   let calendar = CalendarApp.getCalendarById(calendar_id);
//   try {
//     let new_event = event.all_day
//       ? calendar.createAllDayEvent(...options)
//       : calendar.createEvent(...options);

//     new_event_id = new_event.getId().split("@")[0];
//   } catch (e) {
//     console.log("Failed to push new event to GCal. %s", e);
//     return false;
//   }

//   if (!new_event_id) {
//     console.log("Event %s not created in gCal.", event.summary);
//     return false;
//   }

//   let properties = getBaseNotionProperties(new_event_id, calendar_name);
//   pushDatabaseUpdate(properties, page.id);
//   return new_event_id;
// }

/** Update Google calendar event
 * @param {CalendarEvent} event - Modified event object for gCal
 * @param {String} page_id - Page ID of Notion page to update
 * @param {String} calendar_id - Calendar ID of calendar to update event from
 * @return {Boolean} True if successful, false otherwise
 */
// function pushEventUpdate(event, event_id, calendar_id) {
//   event.summary = event.summary || "";
//   event.description = event.description || "";
//   event.location = event.location || "";

//   try {
//     let calendar = CalendarApp.getCalendarById(calendar_id);
//     let cal_event = calendar.getEventById(event_id);

//     cal_event.setDescription(event.description);
//     cal_event.setTitle(event.summary);
//     cal_event.setLocation(event.location);

//     if (event.end && event.all_day) {
//       // all day, multi day
//       let shifted_date = new Date(event.end);
//       shifted_date.setDate(shifted_date.getDate() + 2);
//       cal_event.setAllDayDates(new Date(event.start), shifted_date);
//     } else if (event.all_day) {
//       // all day, single day
//       cal_event.setAllDayDate(new Date(event.start));
//     } else {
//       // not all day
//       cal_event.setTime(new Date(event.start), new Date(event.end) || null);
//     }
//     return true;
//   } catch (e) {
//     console.log("Failed to push event update to GCal. %s", e);
//     return false;
//   }
// }