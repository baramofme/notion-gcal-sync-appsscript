if (typeof require !== 'undefined') {
  MockData = require ('./__tests__/min/MockData.js');
  PropertiesService = {
    getScriptProperties: () => {
      return {
        getProperty: () => {
          if ("DATABASE_PUBLIC_URL") return "https://api.notion.com/v1/databases/4c6e0dc9b84e45e08149ce42a709c885/query"
          if ("NOTION_TOKEN") return "secret_EPvwKyzPY0c1XF0z3Z99WhPG5RW23PHWeC3xYvyUVHg"
        },
      }
    },

  }
  //PropertiesService =
}
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

if (typeof module !== 'undefined') module.exports = NOTION_CREDENTIAL_OBJ;