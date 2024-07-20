const CONTROLLER = (()=>{

  /** Delete events marked as cancelled in gcal */
  function processCancelledEvents() {

    if (!CONFIG.REMOVE_GCAL_EVENTS_NOTION_CANCELLED) return

    console.log("[-GCal] Deleting cancel tagged events from GCal");

    const response_data = API.NOTION.getCancelledTaggedNotionPages()

    //Logger.log(response_data.results[0].properties["이름"].title[0].plain_text);
    //Logger.log(response_data.results.length);
    return

    const commonEvents = response_data.results.map(page => {
      return UTIL.convertPageToCommonEvent(page, RULES.CONVERT.eventPropertyExtractionRules, CALENDAR_IDS, UTIL)
    })
    const needUpdateEvents = commonEvents.filter(event => event.recentlyUpdated)

    const deletedIds = tryDeleteGcalEvent(needUpdateEvents)

    if(CONFIG.ARCHIVE_NOTION_EVENTS_GCAL_REMOVED) {
      deletedIds.forEach(pageId => API.NOTION.updateNotionPage([], arr.pageId, true))
    }


    function tryDeleteGcalEvent(arr){
      const deletedPageIds = []
      arr.forEach(obj => {
        try {
          deletedPageIds.push(obj.id)
          API.GCAL.deleteGcalEvent(obj.eventId, obj.gCalEId);
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

    const response_data = API.NOTION.getFilteredNotionPages();
    // console.log('노션 필터 조회', response_data)

    const commonEvents = response_data.results.map(page => {
      const converted = UTIL.convertPageToCommonEvent(page, RULES.CONVERT.eventPropertyExtractionRules, CALENDAR_IDS, UTIL)
      const targetPageId = page.id
       // if(targetPageId === ''){
        // console.log(UTIL.getBeforeVal(page, "start", RULES))
        // console.log('start',converted.data.start)
       // }

      return converted
    })

    // commonEvents.forEach(event => {
    //   console.log("title", event.nTitle)
    //   console.log("recentup",event.recentlyUpdated)
    // })

    const needUpdateEvents = commonEvents.filter(event => event.recentlyUpdated)
    // console.log("needUpdateEvents")
    // console.log(needUpdateEvents)
    // needUpdateEvents.forEach(event => {
    //   if(event.recentlyUpdated) console.log(event.nTitle)
    // })

    const splitList = UTIL.splitEventFoUpdate(needUpdateEvents)

    const syncedIds = SERVICE.syncableToGcal(response_data.results, splitList.syncableList, CALENDAR_IDS)


    function getIdsNames (ids) {
      return ids.map(id => `[${id.gCalCalName}] ${id.nTitle} (${id.gCalEId})`)
    }

    console.log("[+GC] Skipping pages because it no authorized to write to calendar.")
    console.log(getIdsNames(splitList.unSyncableList.noAuthorizedList.ids));
    console.log("[+GC] Skipping pages because it has no dates.")
    console.log(getIdsNames(splitList.unSyncableList.noDateList.ids));
    console.log("[+GC] Skipping pages  because it is not in the correct format and or is missing required information.")
    console.log(getIdsNames(splitList.unSyncableList.unknowReasonList.ids));

    return syncedIds
  }

  /**
   * Syncs from google calendar to Notion
   * @param {String} c_name Calendar name
   * @param {Boolean} fullSync Whenever or not to discard the old page token
   * @param {Set[String]} ignoredEIds Event IDs to not act on.
   */
  function syncFromGCal(c_name, fullSync, ignoredEIds) {
    console.log("[+ND] Syncing from Google Calendar: %s", c_name);
    let properties = PropertiesService.getUserProperties();
    let options = {
      maxResults: 100,
      singleEvents: true, // allow recurring events
    };
    let syncToken = properties.getProperty("syncToken");
    // @Todo else 블록이 syncToke 이 없거나 fullSync 일때 실행됨.
    // SyncToken  이 없을 때 options.timeMin 같은 게 설정되어봈자
    // 무슨 소용일까. 오류가 날텐데 ;; 무조건 syncToken 이 있다고 가정하고
    // 작성한 코드인데.. 여튼 이건 수정할까 말까.
    if (syncToken && !fullSync) {
      options.syncToken = syncToken;
    } else {
      // Sync events up to thirty days in the past.
      options.timeMin = UTIL.getRelativeDate(-CONFIG.RELATIVE_MIN_DAY, 0).toISOString();
      // Sync events up to x days in the future.
      options.timeMax = UTIL.getRelativeDate(CONFIG.RELATIVE_MAX_DAY, 0).toISOString();
    }
    // Retrieve events one page at a time.
    let events;
    let pageToken;
    do {
      try {
        options.pageToken = pageToken;
        events = Calendar.Events.list(CALENDAR_IDS[c_name].id, options);
        // events1 = Calendar.Events.list("family04088495301278171384@group.calendar.google.com", options);
        // console.log(events1)
        // events2 = Calendar.Events.list("addressbook#contacts@group.v.calendar.google.com", options);
        // console.log(events2)
        // console.log(CALENDAR_IDS[c_name], options)
      } catch (e) {
        // @Todo 재시도 좋은데, 무한정 할 수는 없고 횟수가 필요해.
        // Check to see if the sync token was invalidated by the server;
        // if so, perform a full sync instead.
        if (
            e.message === "Sync token is no longer valid, a full sync is required."
            || e.message === "API call to calendar.events.list failed with error: Sync token is no longer valid, a full sync is required."
        ) {
          console.log("달력 %s 는 full sync 필요 합니다. 시작", c_name )
          properties.deleteProperty("syncToken");
          syncFromGCal(c_name, true, ignoredEIds);

          return;
        }else if(
            e.message === "API call to calendar.events.list failed with error: Not Found"
        ){
          console.log("달력으로부터 이벤트 목록 조회 실패")
          // console.log( c_name )
          // console.log( options )
          return
        } else {
          throw new Error(e.message);
        }
      }
      // @Todo events 객체에 왜 직접 값을 할당하는 걸가? 실제로는 events.items 를 사용하잖아.
      events["c_name"] = c_name;
      if (events.items && events.items.length === 0) {
        console.log("[+ND] No events found. %s", c_name);
        return;
      }
      console.log("[+ND] Parsing new events. %s", c_name);
      // console.log("before pasrEvents")
      // console.log(events[0])
      UTIL.parseEvents(events, ignoredEIds);
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
function fullSync() {
  // getNotionCredentialInfo();
  console.log(
    "Preforming full sync. Page token, time min, and time max will be reset."
  );
  for (var c_name of Object.keys(CALENDAR_IDS)) {
    syncFromGCal(c_name, true, new Set());
  }
}


  return {
    processCancelledEvents,
    syncToGCal,
    syncFromGCal,
    fullSync,
  }
})()


