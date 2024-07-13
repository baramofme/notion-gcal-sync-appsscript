if (typeof require !== 'undefined') {
    MockData = require ('./__tests__/min/MockData.js');
    CONFIG = require("./config")
}
const RULES = (() => {


    //속성추출규칙모음
    const eventPropertyExtractionRules = {
        nPageId: (util) => ({
            required: true,
            extFunc: (notionDbPage) => notionDbPage.id,
            convFunc: (a) => a
        }),
        // Gcal Info
        // @TODO 추상화. 공통 함수를 뽑아서, util 의 기본 값은 그냥 받아서 전달하는 거고, 함수가 들어오면 그걸 쓰도록 하는게 더 좋을듯.
        gCalCalId: (util) => ({
            required: true,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.CALENDAR_ID_PROP_NOTION].select?.name,
            convFunc: (a) => a
        }),
        gCalName: (util) => ({
            required: true,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.CALENDAR_NAME_PROP_NOTION].select?.name,
            convFunc: (a) => a
        }),
        // Notion Info
        gCalEId: (util) => ({
            required: false,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.CALENDAR_EVENT_ID_PROP_NOTION].rich_text,
            convFunc: util.flattenRichText
        }),
        gCalSummary: (util) => ({
            required: false,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.NAME_PROP_NOTION].title,
            convFunc: util.flattenRichText
        }),
        description: (util) => ({
            required: false,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.DESCRIPTION_PROP_NOTION].rich_text,
            convFunc: util.flattenRichText
        }),
        location: (util) => ({
            required: false,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.LOCATION_PROP_NOTION].rich_text,
            convFunc: util.flattenRichText
        }),
        // Common Info
        hasDate: (util) => ({
            required: true,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.DATE_PROP_NOTION].date,
            convFunc: (obj) => util.hasDate(obj, 'start')
        }),
        start: (util) => ({
            required: true,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.DATE_PROP_NOTION].date,
            convFunc: (obj) => util.processDate(obj,"start")
        }),
        end: (util) => ({
            required: false,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.DATE_PROP_NOTION].date,
            convFunc: (obj) => util.processDate( obj, "end")
        }),
        // Gcal Info
        allDay: (util) => ({
            required: false,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.DATE_PROP_NOTION].date,
            convFunc: (obj) => util.allDay(obj)
        }),
        lastSyncDate: (util) => ({
            required: false,
            extFunc: (notionDbPage) => notionDbPage.properties[CONFIG.LAST_SYNC_PROP_NOTION].date?.start || 0,
            convFunc: (obj) => obj
        }),
        lastEditedTime: (util) => ({
            required: false,
            extFunc: (notionDbPage) => notionDbPage.last_edited_time,
            convFunc: (obj) => obj
        }),
        recentlyUpdated: (util) => ({
            required: false,
            extFunc: (notionDbPage) => ({
                lastSyncDate: notionDbPage.properties[CONFIG.LAST_SYNC_PROP_NOTION].date?.start || 0,
                lastEditedTime: notionDbPage.last_edited_time
            }),
            convFunc: ({lastSyncDate, lastEditedTime}) => new Date(lastSyncDate) < new Date(lastEditedTime)
        }),
    }

    // 노션 쿼리 API 필터 정보
    // https://developers.notion.com/reference/post-database-query-filter#date

    // 노션 필더 - 보관 안 됨
    const notArchived = {
        "property": "보관됨",
        "checkbox": {
            "does_not_equal": true
        }
    }

    const doDateNotEmpty = {
        "property": "실행일",
        "date": {
            "is_not_empty": true
        }
    }
    // 노션 필터 - 우선순위가 일정인 것만
    const priorityIsSchedule = {
        property: CONFIG.EXT_FILTER_PROP_NOTION,
        select: {
            equals: CONFIG.EXT_FILTER_VALUE_NOTION
        }
    }

    // 노션 필터 - 취소된 작업
    const cancelledTagFilter = (containsBool = true) => {
        return {
            property: CONFIG.SYNC_OPT_TAG_PROP_NOTION,
            status: {
                ...(containsBool
                        ? {equals: CONFIG.SYNC_OPT_CANCELLED_VALUE_NOTION}
                        : {does_not_equal: CONFIG.SYNC_OPT_CANCELLED_VALUE_NOTION}
                )
            },
        }
    }

    const ignoredTagFilter = (containsBool = true) => ({
        property: CONFIG.SYNC_OPT_TAG_PROP_NOTION,
        status: {
            ...(containsBool
                    ? {equals: CONFIG.SYNC_OPT_IGNORE_VALUE_NOTION}
                    : {does_not_equal: CONFIG.SYNC_OPT_IGNORE_VALUE_NOTION}
            )
        },
    })


    // 날짜를 가져야 하는 상태 필터 묶음
    // 진행상태가 실행 2주일 전과 실행중인 것만 포함한다.
    const shouldHaveDateStatsFilterArr = [
        {
            "property": "진행 상태",
            "status": {
                "equals": "곧 1 ⛅"
            }
        },
        {
            "property": "진행 상태",
            "status": {
                "equals": "언젠가 1 🗓️"
            }
        },
        {
            "property": "진행 상태",
            "status": {
                "equals": "시작 전 2"
            }
        },
        {
            "property": "진행 상태",
            "status": {
                "equals": "진행 중 2"
            }
        },
        {
            "property": "진행 상태",
            "status": {
                "equals": "위임추적 3 ⚙️"
            }
        },
        {
            "property": "진행 상태",
            "status": {
                "equals": "막힘 3"
            }
        },
    ]

    //  @TODO 정리 필요. 아직 스타일을 명확히 하지 못했음
    return {
        CONVERT: {
            eventPropertyExtractionRules,
        },
        FILTER: {
            doDateNotEmpty,
            notArchived,
            priorityIsSchedule,
            cancelledTagFilter,
            ignoredTagFilter,
            shouldHaveDateStatsFilterArr
        }
    }
})()

if (typeof module !== 'undefined') module.exports = RULES;