const CONTROLLER = (()=>{
  return {
    processCancelledEvents,
    syncToGCal,
    syncFromGCal,
    //fullSync,
  }
})()

/** Delete events marked as cancelled in gcal */
function processCancelledEvents() {

  if (!CONFIG.REMOVE_GCAL_EVENTS_NOTION_CANCELLED) return

  console.log("[-GCal] Deleting cancel tagged events from GCal");

  const response_data = API.NOTION.getOnlyCancelledTaggedPagesNotion()

  const updatedRecentlyPages = response_data.results.filter(page => UTIL.isPageUpdatedRecently(page))


  const updateEventInfoForGcal  = updatedRecentlyPages.map(page => UTIL.convertPageToCommonEvent(page, RULES.convertPageToCommonEvent, CALENDAR_IDS))

  const deletedIds = tryDeleteGcalEvent(updateEventInfoForGcal)

  if(CONFIG.ARCHIVE_NOTION_EVENTS_GCAL_REMOVED) {
    deletedIds.forEach(pageId => API.NOTION.pushDatabaseUpdate([], arr.pageId, true))
  }

  function extractEventAndCalendarIdObj(page){
    const {flattenRichText} = UTIL
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
        API.GCAL.deleteEvent(obj.eventId, obj.gCalEId);
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

function syncToGCal() {
  console.log("[+GC] Syncing to Google Calendar.");
  // Get 100 pages in order of when they were last edited.

  const response_data = API.NOTION.getOnlyAllowSyncPagesNotion();
  const updatedRecentlyPages = response_data.results.filter(page => UTIL.isPageUpdatedRecently(page))
  const updateEventInfoForGcal = updatedRecentlyPages.map(page =>{
    const props = page.properties
    return UTIL.convertPageToCommonEvent(props, RULES.CONVERT.eventPropertyExtractionRules, CALENDAR_IDS)
  })

  let modified_eIds = new Set();
  let noDateEIds = new Set();

  updateEventInfoForGcal.forEach((event)=> {

    const syncable = event.hasDate && event.writable

    const needUpdate = event.hasGcalInfo && event.calendarMatched
    const needRecreate = event.hasGcalInfo && !event.calendarMatched
    const needCreate = !event.hasGcalInfo && event.calendarMatched

    const gCalEId = event.gCalEId
    const gCalCalId = event.gCalCalId
    const gCalName = event.gCalName

    if(syncable){
      if(needUpdate){
        // Update event in original calendar.
        console.log("[+GC] Updating event %s in %s.", gCalEId, gCalCalId);
        API.GCAL.pushEventUpdate(event, gCalEId, gCalCalId);
        }
      // @TODO 진행 중
      if(needRecreate){
        API.GCAL.deleteEvent(gCalEId, undefined, CALENDAR_IDS)
        const modified_eId = SERVICE.createEvent(result, event, gCalName)

        modified_eIds.add(modified_eId);
        console.log(
          "[+GC] Event %s failed to move to %s.",
          gCalEId,
          gCalName
        );
      }
      if(needCreate){
        const modified_eId = SERVICE.createEvent(result, event, gCalName)
        console.log("[+GC] Event created in %s.", gCalName);
        modified_eIds.add(modified_eId);
      }
    }else {
      noDateEIds.add(gCalEId)
    }
    
    // Calendar name not found in dictonary. Abort.
    console.log(
      "[+GC] Calendar name %s not found in dictionary. Aborting sync.",
        gCalName
    );
    // return modified_eIds;
  })

  /*
  if (!event) {
  console.log(
    "[+GC] Skipping page %s because it is not in the correct format and or is missing required information.",
    result.id
  );
  continue;
  }
  */
}

/**
 * Syncs from google calendar to Notion
 * @param {String} c_name Calendar name
 * @param {Boolean} fullSync Whenever or not to discard the old page token
 * @param {Set[String]} ignored_eIds Event IDs to not act on.
 */
function syncFromGCal(c_name, fullSync, ignored_eIds) {
  console.log("[+ND] Syncing from Google Calendar: %s", c_name);
  let properties = PropertiesService.getUserProperties();
  let options = {
    maxResults: 100,
    singleEvents: true, // allow recurring events
  };
  let syncToken = properties.getProperty("syncToken");
  if (syncToken && !fullSync) {
    options.syncToken = syncToken;
  } else {
    // Sync events up to thirty days in the past.
    options.timeMin = getRelativeDate(-CONFIG.RELATIVE_MIN_DAY, 0).toISOString();
    // Sync events up to x days in the future.
    options.timeMax = getRelativeDate(CONFIG.RELATIVE_MAX_DAY, 0).toISOString();
  }
  // Retrieve events one page at a time.
  let events;
  let pageToken;
  do {
    try {
      options.pageToken = pageToken;
      console.log("syncFromGCal do-try")
      console.log("options", options)
      //["가족"]: "family04088495301278171384@group.calendar.google.com",
      //["생일"]: "addressbook#contacts@group.v.calendar.google.com"
      events = Calendar.Events.list(CALENDAR_IDS[c_name], options);
      console.log(events)
      // events1 = Calendar.Events.list("family04088495301278171384@group.calendar.google.com", options);
      // console.log(events1)
      // events2 = Calendar.Events.list("addressbook#contacts@group.v.calendar.google.com", options);
      // console.log(events2)
    } catch (e) {
      // Check to see if the sync token was invalidated by the server;
      // if so, perform a full sync instead.
      if (
        e.message === "Sync token is no longer valid, a full sync is required." || e.message === "API call to calendar.events.list failed with error: Sync token is no longer valid, a full sync is required."
      ) {
        console.log("syncFromGCal - do -try-catch", c_name )
        properties.deleteProperty("syncToken");
        syncFromGCal(c_name, true, ignored_eIds);
        //syncFromGCal(CALENDAR_IDS[c_name], true, ignored_eIds);
        return;
      } else {
        throw new Error(e.message);
      }
    }
    events["c_name"] = c_name;
    if (events.items && events.items.length === 0) {
      console.log("[+ND] No events found. %s", c_name);
      return;
    }
    console.log("[+ND] Parsing new events. %s", c_name);
    parseEvents(events, ignored_eIds);
    pageToken = events.nextPageToken;
  } while (pageToken);
  properties.setProperty("syncToken", events.nextSyncToken);
}


/**
 * Syncs all calendars from google calendar to Notion using a full sync.
 *
 * -- Will discard the old page token and generate a new one. --
 * -- Will reset time min and time max to use the the current time as origin time --
 **/
// function fullSync() {
//   getNotionCredentialInfo();
//   console.log(
//     "Preforming full sync. Page token, time min, and time max will be reset."
//   );
//   for (var c_name of Object.keys(CALENDAR_IDS)) {
//     syncFromGCal(c_name, true, new Set());
//   }
// }

