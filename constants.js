/* 통신 필요정보 - 노션과 */
const NOTION_CREDENTIAL_OBJ = (()=> {
  return {
    ...getNotionCredentialInfo()
  }

  /**
 * Notion API를 위한 인증 정보를 가져오는 함수입니다.
 * 스크립트 속성 서비스를 사용하여 데이터베이스 URL과 토큰을 가져온 후,
 * 필요한 헤더와 데이터베이스 ID, 데이터베이스 URL을 포함하는 객체를 반환합니다.
 *
 * @returns {Object} Notion 인증 정보 객체
 * @returns {string} .token - Notion API 토큰
 * @returns {string} .databaseId - Notion 데이터베이스 ID
 * @returns {Object} .headers - Notion API 요청에 사용될 헤더
 * @returns {string} .databaseUrl - Notion 데이터베이스 URL
 */
function getNotionCredentialInfo() {
  // 스크립트 속성에서 데이터베이스 공개 URL과 토큰을 가져옵니다.
  let properties = PropertiesService.getScriptProperties();
  const databasePublicUrl = properties.getProperty("DATABASE_PUBLIC_URL");

  const token = properties.getProperty("NOTION_TOKEN");
  const headers = getNotionHeaders(token);
  const databaseId = getNotionDatabaseId(databasePublicUrl);
  const databaseUrl = getNotionDatabaseUrl(databaseId);

  // 인증 정보를 포함하는 객체를 반환합니다.
  return {
    token, 
    databaseId, 
    headers, 
    databaseUrl
  };

  function getNotionDatabaseId(databasePublicUrl) {

    const reURLInformation =
    /^(([^@:\/\s]+):\/?)?\/?(([^@:\/\s]+)(:([^@:\/\s]+))?@)?([^@:\/\s]+)(:(\d+))?(((\/\w+)*\/)([\w\-\.]+[^#?\s]*)?(.*)?(#[\w\-]+)?)?$/;
    
    return databasePublicUrl.match(reURLInformation)[13];
  }

  function getNotionHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    };
  }

  function getNotionDatabaseUrl(databaseId) {
    return `https://api.notion.com/v1/databases/${databaseId}/query`;
  }
}
})()

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
    SYNC_OPT_IGNORE_VALUE_NOTION : "보관 5",
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