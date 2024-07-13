if (typeof require !== 'undefined') {
  MockData = require ('./__tests__/min/MockData.js');
}

/* 노션 속성명 */
const CONFIG = (() => {
  'use strict';
  return {
    // 속성명
    NAME_PROP_NOTION : "이름",
    DATE_PROP_NOTION : "실행일",
    LOCATION_PROP_NOTION : "위치",
    DESCRIPTION_PROP_NOTION : "설명",
    CALENDAR_EVENT_ID_PROP_NOTION : "행사 ID",
    CALENDAR_NAME_PROP_NOTION : "달력",
    CALENDAR_ID_PROP_NOTION : "달력 ID",
    LAST_SYNC_PROP_NOTION : "마지막 동기화",
    SYNC_OPT_TAG_PROP_NOTION : "진행 상태",
    SYNC_OPT_CANCELLED_VALUE_NOTION : "무계획됨 5",
    SYNC_OPT_IGNORE_VALUE_NOTION : "완료 5 ☑",
    // 커스텀 추가 - 필터 좁히는데 사용되는 속성 값
    EXT_FILTER_PROP_NOTION : "우선순위",
    EXT_FILTER_VALUE_NOTION : "일정 1💼",
    /* 플래그  */
    // 노션 취소 값이면 달력에서 삭제
    REMOVE_GCAL_EVENTS_NOTION_CANCELLED : true,
    // 달력 삭제 후 노션도 삭제
    ARCHIVE_NOTION_EVENTS_GCAL_REMOVED : true,

    /*  */
    IGNORE_RECENTLY_PUSHED : true,
    SKIP_BAD_EVENTS : true,

    // Relative to the time of last full sync in days.
    RELATIVE_MAX_DAY : 1825, // 5 year
    RELATIVE_MIN_DAY : 30,
  }

})()




const Settings = (() => {
  return {
    apis: {
      sunset: {
        getUrl: function (lat, lon) {
          return '<https://api.sunrise-sunset.org/json?lat=99&lng=99>'
            .replace(/lat=\\d+/, `lat=${lat}`)
            .replace(/lng=\\d+/, `lng=${lon}`);
        }
      },
      weather: {
        getUrl: function (lat, lon) {
          return '<https://fcc-weather-api.glitch.me/api/current?lat=99&lon=99>'
            .replace(/lat=\\d+/, `lat=${lat}`)
            .replace(/lon=\\d+/, `lon=${lon}`);
        }
      }
    },
    sheets: {
      airports: {
        sheetId: '15MDlPLVH4IhnY2KJBWYGANoyyoUFaxeWVDOe-pupKxs',
        sheetName: 'large airports'
      },
      metres: {
        sheetId: '15MDlPLVH4IhnY2KJBWYGANoyyoUFaxeWVDOe-pupKxs',
        sheetName: 'high airports with metres',
        create: true
      }
    }
  };
})();

if (typeof module !== 'undefined') module.exports = CONFIG;