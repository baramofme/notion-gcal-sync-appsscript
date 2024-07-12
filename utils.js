const UTIL = (()=> {

  // 후처리 - 노션 정보 추출 시 rich text
  /**
   * Flattens rich text properties into a singular string.
   * @param {Object} rich_text_result - Rich text property to flatten
   * @return {String} - Flattened rich text
   * */
  function flattenRichText(rich_text_result) {
    let plain_text = "";

    plain_text = rich_text_result.map((result)=>{
      return result.rich_text
          ? result.rich_text.plain_text
          : result.plain_text;
    }).join()

    return plain_text;
  }

  function convertPageToCommonEvent(notionDbPage, rulesObj, calendarList, utils){
    const commonEventObj = new CommonEvent(rulesObj,calendarList)
    return commonEventObj.importFromNotion(notionDbPage,utils)
  }

  // 후처리 - 노션 정보 추출 시 날짜
  // https://developers.notion.com/changelog/dates-with-times-and-timezones-are-now-supported-on-database-date-filters
  // "2021-10-15T12:00:00-07:00"
  function processDate(startOrEndTypeStr, datePropObj) {

    const isCurntTurnEnd = startOrEndTypeStr === "end"

    let curntProcValue = datePropObj[startOrEndTypeStr]
    let startValue = datePropObj["start"]
    let endValue = datePropObj["end"]

    const noTime = curntProcValue?.search(/([A-Z])/g) === -1
    const startHasTime = startValue && !noTime

    // time should be added
    if(curntProcValue && noTime) curntProcValue += "T00:00:00"

    // if start has time withoud end,
    // make end with time +30m
    if(isCurntTurnEnd  && !endValue && startHasTime) {
      let default_end = new Date(datePropObj.start);
      default_end.setMinutes(default_end.getMinutes() + 30);
      curntProcValue = default_end.toISOString();
    }

    return curntProcValue

  }

  function isEmptyObject(param) {
    return Object.keys(param).length === 0 && param.constructor === Object;
  }

  // function getRelativeDate(daysOffset, hour) {
  //   let date = new Date();
  //   date.setDate(date.getDate() + daysOffset);
  //   date.setHours(hour);
  //   date.setMinutes(0);
  //   date.setSeconds(0);
  //   date.setMilliseconds(0);
  //   return date;
  // }

  /**
   * Return notion JSON property object based on event data
   * @param {CalendarEvent} event modified GCal event object
   * @param {String[]} existing_tags - existing tags to add to event
   * @returns {Object} notion property object
   */
// function convertToNotionProperty(event, existing_tags = []) {
//   let properties = getBaseNotionProperties(event.id, event.c_name);

//   properties[CONFIG.DESCRIPTION_PROP_NOTION] = {
//     type: "rich_text",
//     rich_text: [
//       {
//         text: {
//           content: event.description || "",
//         },
//       },
//     ],
//   };

//   properties[CONFIG.LOCATION_PROP_NOTION] = {
//     type: "rich_text",
//     rich_text: [
//       {
//         text: {
//           content: event.location || "",
//         },
//       },
//     ],
//   };

//   if (event.start) {
//     let start_time;
//     let end_time;

//     if (event.start.date) {
//       // All-day event.
//       start_time = new Date(event.start.date);
//       end_time = new Date(event.end.date);

//       // Offset timezone
//       start_time.setTime(
//         start_time.getTime() + start_time.getTimezoneOffset() * 60 * 1000
//       );
//       end_time.setTime(
//         end_time.getTime() + end_time.getTimezoneOffset() * 60 * 1000
//       );

//       // Offset by 1 day to get end date.
//       end_time.setDate(end_time.getDate() - 1);

//       start_time = start_time.toISOString().split("T")[0];
//       end_time = end_time.toISOString().split("T")[0];

//       end_time = start_time == end_time ? null : end_time;
//     } else {
//       // Events that don't last all day; they have defined start times.
//       start_time = event.start.dateTime;
//       end_time = event.end.dateTime;
//     }

//     properties[CONFIG.DATE_PROP_NOTION] = {
//       type: "date",
//       date: {
//         start: start_time,
//         end: end_time,
//       },
//     };

//     properties[NAME_NOTION] = {
//       type: "title",
//       title: [
//         {
//           type: "text",
//           text: {
//             content: event.summary || "",
//           },
//         },
//       ],
//     };
//   }

//   if (event.status === "cancelled") {
//     properties[CONFIG.SYNC_OPT_TAG_PROP_NOTION] = { multi_select: existing_tags };

//     properties[CONFIG.SYNC_OPT_TAG_PROP_NOTION].multi_select.push({
//       name: CONFIG.SYNC_OPT_CANCELLED_VALUE_NOTION,
//     });
//   }

//   return properties;
// }

  /**
   * Return base notion JSON property object including generation time
   * @param {String} event_id - event id
   * @param {String} calendar_name - calendar key name
   * @returns {Object} - base notion property object
   *  */
// function getBaseNotionProperties(event_id, calendar_name) {
//   return {
//     [CONFIG.LAST_SYNC_PROP_NOTION]: {
//       type: "date",
//       date: {
//         start: new Date().toISOString(),
//       },
//     },
//     [CONFIG.CALENDAR_EVENT_ID_PROP_NOTION]: {
//       type: "rich_text",
//       rich_text: [
//         {
//           text: {
//             content: event_id, //use ICal uid?
//           },
//         },
//       ],
//     },
//     [CONFIG.CALENDAR_ID_PROP_NOTION]: {
//       select: {
//         name: CALENDAR_IDS[calendar_name],
//       },
//     },
//     [CALENDAR_CONFIG.NAME_PROP_NOTION]: {
//       select: {
//         name: calendar_name,
//       },
//     },
//   };
// }





  /**
   * 속성이 노션에 유효한 지 확인
   *
   * @param {*} properties Properties object to check
   * @returns false if invalid, true if valid
   */
// function checkNotionProperty(properties) {
//   // Check if description is too long
//   if (properties[CONFIG.DESCRIPTION_PROP_NOTION].rich_text[0].text.content.length > 2000) {
//     console.log("Event description is too long.");
//     return false;
//   }

//   return true;
// }



  /**
   * Error thrown when an event is invalid and cannot be
   * pushed to either Google Calendar or Notion.
   */
// class InvalidEventError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = "InvalidEventError";
//   }
// }

  /**
   * Get notion page ID of corresponding gCal event. Returns null if no page found.
   * @param {CalendarEvent} event - Modiffied gCal event object
   */
// function getPageId(event) {
//   const url = NOTION_CREDENTIAL_OBJ.databaseUrl();
//   const payload = {
//     filter: {
//       and: [
//         { property: CONFIG.CALENDAR_EVENT_ID_PROP_NOTION, rich_text: { equals: event.id } },
//         {
//           property: CONFIG.SYNC_OPT_TAG_PROP_NOTION,
//           multi_select: {
//             does_not_contain: CONFIG.SYNC_OPT_IGNORE_VALUE_NOTION,
//           },
//         },
//       ],
//     },
//   };

//   const response_data = notionFetch(url, payload, "POST");

//   if (response_data.results.length > 0) {
//     if (response_data.results.length > 1) {
//       console.log(
//         "Found multiple entries with event id %s. This should not happen. Only processing index zero entry.",
//         event.id
//       );
//     }

//     return response_data.results[0].id;
//   }
//   return null;
// }

  /**
   * Sync to google calendar from Notion
   * @returns {Set[String]} - Array of event IDs that were modified through event creation
   */

  /**
   * Determine if gcal events need to be updated, removed, or added to the database
   * @param {CalendarEvent[]} events Google calendar events
   * @param {Set[String]} ignored_eIds Event IDs to not act on.
   */
// function parseEvents(events, ignored_eIds) {
//   let requests = [];
//   for (let i = 0; i < events.items.length; i++) {
//     let event = events.items[i];
//     event["c_name"] = events["c_name"];
//     if (ignored_eIds.has(event.id)) {
//       console.log("[+ND] Ignoring event %s", event.id);
//       continue;
//     }
//     if (event.status === "cancelled") {
//       console.log("[+ND] Event %s was cancelled.", event.id);
//       // Remove the event from the database
//       handleEventCancelled(event);
//       continue;
//     }
//     let start;
//     let end;

//     if (event.start.date) {
//       // All-day event.
//       start = new Date(event.start.date);
//       end = new Date(event.end.date);
//       console.log(
//         "[+ND] Event found %s %s (%s -- %s)",
//         event.id,
//         event.summary,
//         start.toLocaleDateString(),
//         end.toLocaleDateString()
//       );
//     } else {
//       // Events that don't last all day; they have defined start times.
//       start = event.start.dateTime;
//       end = event.end.dateTime;
//       console.log(
//         "[+ND] Event found %s %s (%s)",
//         event.id,
//         event.summary,
//         start.toLocaleString()
//       );
//     }
//     let page_response = getPageFromEvent(event);

//     if (page_response) {
//       console.log(
//         "[+ND] Event %s database page %s exists already. Attempting update.",
//         event.id,
//         page_response.id
//       );
//       let tags = page_response.properties[CONFIG.SYNC_OPT_TAG_PROP_NOTION].multi_select;
//       requests.push(
//         updateDatabaseEntry(event, page_response.id, tags || [])
//       );

//       continue;
//     }
//     console.log("[+ND] Creating database entry.");

//     try {
//       requests.push(createDatabaseEntry(event));
//     } catch (err) {
//       if ((err instanceof InvalidEventError) && CONFIG.SKIP_BAD_EVENTS) {
//         console.log(
//           "[+ND] Skipping creation of event %s due to invalid properties.",
//           event.id
//         );

//         continue;
//       }

//       throw err;
//     }
//   }
//   console.log("[+ND] Finished parsing page. Sending batch request.");

//   const responses = UrlFetchApp.fetchAll(requests);

//   for (let i = 0; i < responses.length; i++) {
//     let response = responses[i];
//     if (response.getResponseCode() === 401) {
//       throw new Error("[+ND] Notion token is invalid.");
//     } else if (response.getResponseCode() === 404) {
//       throw new Error("[+ND] Notion page not found.");
//     } else if (response.getResponseCode() === 403) {
//       throw new Error("[+ND] Notion page is private.");
//     } else if (response.getResponseCode() !== 200) {
//       throw new Error(response.getContentText());
//     }
//   }
// }

  /**
   * Deals with event cancelled from gCal side
   * @param {CalendarEvent} event - Modiffied gCal event object
   */
// function handleEventCancelled(event) {
//   const page_id = getPageId(event);

//   if (page_id) {
//     updateDatabaseEntry(event, page_id, [], false);
//   } else {
//     console.log("Event %s not found in Notion database. Skipping.", event.id);
//   }
// }

  return {
    isEmptyObject, // 안 쓰이는 거 같음
    flattenRichText,
    processDate,
    convertPageToCommonEvent,
  }
})()