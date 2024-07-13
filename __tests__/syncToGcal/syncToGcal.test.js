// jshint esversion: 8
if (typeof require !== 'undefined') {
    UnitTestingApp = require('../min/UnitTestingApp.js');
    MockData = require('../min/MockData.js');
    UTIL = require('../../utils.js');
    RULES = require('../../rules.js');
    NOTION_CREDENTIAL_OBJ = require('../../notionCredentials.js')
    CONFIG = require('../../config.js')
    CALENDAR_IDS = require('../../calendarIds.js')
}

/*****************
 * TESTS
 *****************/

/**
 * Runs the tests; insert online and offline tests where specified by comments
 * @returns {void}
 */
function runTests() {
    const test = new UnitTestingApp();
    test.enable();
    test.clearConsole();
    test.levelInfo = 2;

    test.runInGas(false);
    test.printHeader('LOCAL TESTS');
    /************************
     * Run Local Tests Here
     ************************/

    const data = new MockData();
    // 별도의 파일로 빼고, 테스트 때 위에서 require 하는 것도 좋을듯. 일단은 이렇게 쓰고
    const cancelledEvent = {
        "object": "list",
        "results": [
            {
                "object": "page",
                "id": "d05dc0a8-6d42-4cfd-98e1-22265a21c11d",
                "created_time": "2024-07-05T14:47:00.000Z",
                "last_edited_time": "2024-07-12T14:31:00.000Z",
                "created_by": {
                    "object": "user",
                    "id": "99fce45e-8259-4a98-9f90-dd4e25061970"
                },
                "last_edited_by": {
                    "object": "user",
                    "id": "99fce45e-8259-4a98-9f90-dd4e25061970"
                },
                "cover": null,
                "icon": null,
                "parent": {
                    "type": "database_id",
                    "database_id": "4c6e0dc9-b84e-45e0-8149-ce42a709c885"
                },
                "archived": false,
                "in_trash": false,
                "properties": {
                    "정리 인큐베이팅 그룹화": {
                        "id": "%3A%3EyS",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "누락-분류"
                        }
                    },
                    "웹 연결": {
                        "id": "%3AU%7DJ",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "플젝목표일지목록": {
                        "id": "%3B%5EmO",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": null
                        }
                    },
                    "마감일": {
                        "id": "%3BfdL",
                        "type": "date",
                        "date": null
                    },
                    "구매 목록": {
                        "id": "%3Cn%3Dt",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "명료화 일정 그룹화": {
                        "id": "%3D%3BN%3F",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "누락 분류"
                        }
                    },
                    "반복 단위": {
                        "id": "%3DOuV",
                        "type": "select",
                        "select": {
                            "id": "427eb4eb-8e10-4b38-b6a1-40f373d8995e",
                            "name": "일마다",
                            "color": "yellow"
                        }
                    },
                    "핵심 결과": {
                        "id": "%3D_B%7C",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "달력": {
                        "id": "%3Dxh%60",
                        "type": "select",
                        "select": {
                            "id": "d4261ef7-0c4e-4db4-9fe6-6d195deb7131",
                            "name": "개인",
                            "color": "gray"
                        }
                    },
                    "읽기": {
                        "id": "%3D%7DN%3F",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "복습 시스템": {
                        "id": "%3Ev%40x",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "강좌 금고": {
                        "id": "%3F%3EJF",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "시작 전 반복증거": {
                        "id": "%3FgfK",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": ""
                        }
                    },
                    "단순화된 반복유형": {
                        "id": "A%3CAv",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "days"
                        }
                    },
                    "상위선행 플젝결과": {
                        "id": "Bd%7C%5B",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": null
                        }
                    },
                    "분류의분류": {
                        "id": "Bk%3Fp",
                        "type": "formula",
                        "formula": {
                            "type": "boolean",
                            "boolean": null
                        }
                    },
                    "셀프할당": {
                        "id": "B%7Dj%5B",
                        "type": "button",
                        "button": {}
                    },
                    "용어집": {
                        "id": "CGdw",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "수집변경": {
                        "id": "CjVO",
                        "type": "button",
                        "button": {}
                    },
                    "# 검토": {
                        "id": "C%7B%3EA",
                        "type": "rich_text",
                        "rich_text": []
                    },
                    "셀프 참조": {
                        "id": "DfWe",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "후속 작업 뉴": {
                        "id": "DtAb",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "# 하위 작업들": {
                        "id": "EtVA",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": ""
                        }
                    },
                    "마감지남상태-숫자": {
                        "id": "FIXg",
                        "type": "formula",
                        "formula": {
                            "type": "number",
                            "number": 0
                        }
                    },
                    "일일 강조": {
                        "id": "HYlD",
                        "type": "checkbox",
                        "checkbox": false
                    },
                    "마감지남상태 - 아이콘": {
                        "id": "HhN%7D",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "⚪️"
                        }
                    },
                    "약속시간": {
                        "id": "Hhyy",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": ""
                        }
                    },
                    "------": {
                        "id": "Inj%7C",
                        "type": "rich_text",
                        "rich_text": []
                    },
                    "컨텐츠 송관": {
                        "id": "K%3Dot",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "달력 ID": {
                        "id": "Ld%3AJ",
                        "type": "select",
                        "select": {
                            "id": "bf6dcf9d-f859-434c-9ff7-9bd6c8a989fd",
                            "name": "baram204@gmail.com",
                            "color": "purple"
                        }
                    },
                    "종합 기록 문서함": {
                        "id": "Lhoy",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "계획 일지": {
                        "id": "LoFp",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "다음행동 변경": {
                        "id": "MRib",
                        "type": "button",
                        "button": {}
                    },
                    "다음 반복일": {
                        "id": "NAcf",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "07/13/2024"
                        }
                    },
                    "--- 동기화 수정불가끝": {
                        "id": "NAdn",
                        "type": "rich_text",
                        "rich_text": []
                    },
                    "하위 작업": {
                        "id": "NU%7Bc",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "행사 ID": {
                        "id": "O%3E%7D%3E",
                        "type": "rich_text",
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "ip492v7t168cu5uct0elmt4pqs",
                                    "link": null
                                },
                                "annotations": {
                                    "bold": false,
                                    "italic": false,
                                    "strikethrough": false,
                                    "underline": false,
                                    "code": false,
                                    "color": "default"
                                },
                                "plain_text": "ip492v7t168cu5uct0elmt4pqs",
                                "href": null
                            }
                        ]
                    },
                    "하위 작업 뉴": {
                        "id": "RJbj",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "영역활성중": {
                        "id": "R%7DO%5C",
                        "type": "formula",
                        "formula": {
                            "type": "boolean",
                            "boolean": false
                        }
                    },
                    "오늘로실행일": {
                        "id": "Umfo",
                        "type": "button",
                        "button": {}
                    },
                    "요일마다 (1 일마다 설정때만)": {
                        "id": "VbKd",
                        "type": "multi_select",
                        "multi_select": []
                    },
                    "시간구획": {
                        "id": "Vj%7DB",
                        "type": "select",
                        "select": {
                            "id": "v;[S",
                            "name": "24",
                            "color": "purple"
                        }
                    },
                    "소모시간??": {
                        "id": "WvYA",
                        "type": "select",
                        "select": null
                    },
                    "순위변동": {
                        "id": "X%3FYJ",
                        "type": "select",
                        "select": null
                    },
                    "반복유형-숫자": {
                        "id": "XeAN",
                        "type": "formula",
                        "formula": {
                            "type": "number",
                            "number": 1
                        }
                    },
                    "정리 일정 그룹화": {
                        "id": "YevZ",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "누락 분류"
                        }
                    },
                    "대표날짜지남": {
                        "id": "Yhjl",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": ""
                        }
                    },
                    "마지막 날 기초 날짜": {
                        "id": "ZOWY",
                        "type": "formula",
                        "formula": {
                            "type": "date",
                            "date": {
                                "start": "1998-09-28T17:00:00.000+00:00",
                                "end": null,
                                "time_zone": null
                            }
                        }
                    },
                    "오늘시작실행": {
                        "id": "%5CuHt",
                        "type": "button",
                        "button": {}
                    },
                    "상위 작업": {
                        "id": "%5DcOx",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "완료 일지": {
                        "id": "%5Dxi%5C",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "명료화 행동 그룹화": {
                        "id": "_%3FuM",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "누락 분류"
                        }
                    },
                    "프로젝트 활성중": {
                        "id": "aNN%5B",
                        "type": "formula",
                        "formula": {
                            "type": "boolean",
                            "boolean": false
                        }
                    },
                    "아마도변경 ": {
                        "id": "aUZg",
                        "type": "button",
                        "button": {}
                    },
                    "보관불가": {
                        "id": "bA%3Em",
                        "type": "formula",
                        "formula": {
                            "type": "boolean",
                            "boolean": true
                        }
                    },
                    "증거활성중": {
                        "id": "bdui",
                        "type": "formula",
                        "formula": {
                            "type": "boolean",
                            "boolean": false
                        }
                    },
                    "실행일": {
                        "id": "bg%5Eb",
                        "type": "date",
                        "date": {
                            "start": "2024-07-12",
                            "end": null,
                            "time_zone": null
                        }
                    },
                    "반영 작업 그룹화": {
                        "id": "b%7Dke",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "2 누락 분류1 일정"
                        }
                    },
                    "보관됨": {
                        "id": "cib%3B",
                        "type": "checkbox",
                        "checkbox": false
                    },
                    "태그": {
                        "id": "dAQZ",
                        "type": "multi_select",
                        "multi_select": []
                    },
                    "흥미우선(Kano)": {
                        "id": "d%7C%3EU",
                        "type": "select",
                        "select": null
                    },
                    "증거 영역 롤업": {
                        "id": "eSuc",
                        "type": "rollup",
                        "rollup": {
                            "type": "array",
                            "array": [],
                            "function": "show_original"
                        }
                    },
                    "집 재고 물품": {
                        "id": "epiI",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "영역": {
                        "id": "evnX",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "대표 날짜": {
                        "id": "f%5E%3AM",
                        "type": "formula",
                        "formula": {
                            "type": "date",
                            "date": {
                                "start": "2024-07-12",
                                "end": null,
                                "time_zone": null
                            }
                        }
                    },
                    "$ 분류 ": {
                        "id": "fpsK",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "0 분류 없음"
                        }
                    },
                    "반복유형-아이콘": {
                        "id": "fxm~",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "🔄"
                        }
                    },
                    "UTC Offset": {
                        "id": "gaiO",
                        "type": "formula",
                        "formula": {
                            "type": "number",
                            "number": 0
                        }
                    },
                    "진척율": {
                        "id": "gb%7B%40",
                        "type": "formula",
                        "formula": {
                            "type": "number",
                            "number": 0
                        }
                    },
                    "상위 작업 뉴": {
                        "id": "h%5CGU",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "선행 작업 뉴": {
                        "id": "iDYz",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "$ 빵부스러기": {
                        "id": "ism%3C",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": ""
                        }
                    },
                    "분류": {
                        "id": "j%3FSc",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": null
                        }
                    },
                    "반복 주기": {
                        "id": "jlEW",
                        "type": "number",
                        "number": 1
                    },
                    "언젠가변경": {
                        "id": "k%40g%3C",
                        "type": "button",
                        "button": {}
                    },
                    "하위행동완료 %": {
                        "id": "kRrl",
                        "type": "rollup",
                        "rollup": {
                            "type": "number",
                            "number": null,
                            "function": "percent_per_group"
                        }
                    },
                    "정리 성역일정 그룹화": {
                        "id": "lBDQ",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "0 일정"
                        }
                    },
                    "실행일 설정 필요": {
                        "id": "lD%3EV",
                        "type": "formula",
                        "formula": {
                            "type": "boolean",
                            "boolean": null
                        }
                    },
                    "기력": {
                        "id": "l%60h%3D",
                        "type": "select",
                        "select": null
                    },
                    "다음 날 기초 날짜": {
                        "id": "mDRh",
                        "type": "formula",
                        "formula": {
                            "type": "date",
                            "date": {
                                "start": "1998-09-28T17:00:00.000+00:00",
                                "end": null,
                                "time_zone": null
                            }
                        }
                    },
                    "위치": {
                        "id": "mW%7C%7D",
                        "type": "rich_text",
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "",
                                    "link": null
                                },
                                "annotations": {
                                    "bold": false,
                                    "italic": false,
                                    "strikethrough": false,
                                    "underline": false,
                                    "code": false,
                                    "color": "default"
                                },
                                "plain_text": "",
                                "href": null
                            }
                        ]
                    },
                    "--- 동기화수정불가시작": {
                        "id": "mswI",
                        "type": "rich_text",
                        "rich_text": []
                    },
                    "마지막 평일 기초 날짜": {
                        "id": "oCkF",
                        "type": "formula",
                        "formula": {
                            "type": "date",
                            "date": {
                                "start": "1998-09-28T17:00:00.000+00:00",
                                "end": null,
                                "time_zone": null
                            }
                        }
                    },
                    "정황": {
                        "id": "pEEu",
                        "type": "multi_select",
                        "multi_select": []
                    },
                    "생성 일시": {
                        "id": "t%3B%5E%7B",
                        "type": "created_time",
                        "created_time": "2024-07-05T14:47:00.000Z"
                    },
                    "분류의영역": {
                        "id": "tBmr",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "영역 부여 안됨"
                        }
                    },
                    "증거 영역": {
                        "id": "t%5EXg",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": null
                        }
                    },
                    "URL": {
                        "id": "trrp",
                        "type": "url",
                        "url": null
                    },
                    "마지막 동기화": {
                        "id": "u%5CVF",
                        "type": "date",
                        "date": {
                            "start": "2024-07-10T11:06:00.000+00:00",
                            "end": null,
                            "time_zone": null
                        }
                    },
                    "마감 지남 - 메시지": {
                        "id": "uoWy",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": ""
                        }
                    },
                    "실행 못지킴": {
                        "id": "v%5EiZ",
                        "type": "formula",
                        "formula": {
                            "type": "boolean",
                            "boolean": false
                        }
                    },
                    "첫 평일 기초 날짜": {
                        "id": "ztxL",
                        "type": "formula",
                        "formula": {
                            "type": "date",
                            "date": {
                                "start": "1998-09-28T17:00:00.000+00:00",
                                "end": null,
                                "time_zone": null
                            }
                        }
                    },
                    "곧(Soon) 변경": {
                        "id": "z%7BzS",
                        "type": "button",
                        "button": {}
                    },
                    "정리 행동 그룹화": {
                        "id": "%7CIbc",
                        "type": "formula",
                        "formula": {
                            "type": "string",
                            "string": "누락-분류"
                        }
                    },
                    "Last Edited Time": {
                        "id": "%7DJxs",
                        "type": "last_edited_time",
                        "last_edited_time": "2024-07-12T14:31:00.000Z"
                    },
                    "이름": {
                        "id": "title",
                        "type": "title",
                        "title": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "11시 취침 시도 #4",
                                    "link": null
                                },
                                "annotations": {
                                    "bold": false,
                                    "italic": false,
                                    "strikethrough": false,
                                    "underline": false,
                                    "code": false,
                                    "color": "default"
                                },
                                "plain_text": "11시 취침 시도 #4",
                                "href": null
                            }
                        ]
                    },
                    "업무태그": {
                        "id": "notion%3A%2F%2Ftasks%2Ftags_property",
                        "type": "multi_select",
                        "multi_select": []
                    },
                    "담당자": {
                        "id": "notion%3A%2F%2Ftasks%2Fassign_property",
                        "type": "people",
                        "people": []
                    },
                    "진행 상태": {
                        "id": "notion%3A%2F%2Ftasks%2Fstatus_property",
                        "type": "status",
                        "status": {
                            "id": "Yl_`",
                            "name": "무계획됨 5",
                            "color": "default"
                        }
                    },
                    "시작일": {
                        "id": "notion%3A%2F%2Ftasks%2Fdue_date_property",
                        "type": "date",
                        "date": {
                            "start": "2024-07-07",
                            "end": null,
                            "time_zone": null
                        }
                    },
                    "우선순위": {
                        "id": "notion%3A%2F%2Ftasks%2Fpriority_property",
                        "type": "select",
                        "select": {
                            "id": "d05415f8-f9f4-4938-b13a-2db9a7462e69",
                            "name": "일정 1💼",
                            "color": "blue"
                        }
                    },
                    "검토": {
                        "id": "notion%3A%2F%2Ftasks%2Fdescription_property",
                        "type": "rich_text",
                        "rich_text": []
                    },
                    "스프린트": {
                        "id": "notion%3A%2F%2Ftasks%2Ftask_sprint_relation",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    },
                    "설명": {
                        "id": "1e98790f-0388-4874-aecd-e38305aac8b4",
                        "type": "rich_text",
                        "rich_text": [
                            {
                                "type": "text",
                                "text": {
                                    "content": "",
                                    "link": null
                                },
                                "annotations": {
                                    "bold": false,
                                    "italic": false,
                                    "strikethrough": false,
                                    "underline": false,
                                    "code": false,
                                    "color": "default"
                                },
                                "plain_text": "",
                                "href": null
                            }
                        ]
                    },
                    "프로젝트": {
                        "id": "notion%3A%2F%2Ftasks%2Ftask_to_project_relation",
                        "type": "relation",
                        "relation": [],
                        "has_more": false
                    }
                },
                "url": "https://www.notion.so/11-4-d05dc0a86d424cfd98e122265a21c11d",
                "public_url": null
            }
        ],
        "next_cursor": null,
        "has_more": false,
        "type": "page_or_database",
        "page_or_database": {},
        "request_id": "3a18d593-673c-4aea-8cd8-9aa4a7f4e46e"
    };
    data.addData('cancelledEvent', cancelledEvent);

    // helper function to print before converted values with given key
    const getBeforeVal = (key) => RULES.CONVERT.eventPropertyExtractionRules[key](UTIL).extFunc(notionDbPage)

    test.printHeader("Testing Convert Notion Page to Common Event")
    const notionDbPage = data.getData('cancelledEvent').results[0]
    let proxyObj = new CommonEvent(RULES.CONVERT.eventPropertyExtractionRules, CALENDAR_IDS)
    let commonEvent = proxyObj.importFromNotion(notionDbPage, UTIL)

    // console.log(notionDbPage.properties)
    console.log(proxyObj.data)

    test.printSubHeader("Proxy Getter and Setters");
    test.assert(() => {
        return proxyObj === commonEvent
    }, "Proxy Events Object should be identical")
    test.assert(() => {
        return commonEvent["gCalCalId"]
            && commonEvent.gCalCalId
    }, "Proxy getter working")

    test.printSubHeader("Convert Processing");
    test.assert(() => {
        return getBeforeVal("gCalCalId")
        === proxyObj.gCalCalId
    }, "before and after props value matched")
    test.assert(() => {
        // allday value should be boolean type
         const alldaypass = commonEvent.allDay === false
        // lastSyncDate value sould be string type.
        const lassyncdatapass = commonEvent.lastSyncDate === '2024-07-10T11:06:00.000+00:00'
        // hasGcalInfo value sould be boolean type.
        const hasgcalinfopass = commonEvent.hasGcalInfo === true
        const recentlyupdatedpass = commonEvent.recentlyUpdated === true
        const calendarmatchedpass = commonEvent.calendarMatched === true

        return alldaypass && lassyncdatapass && hasgcalinfopass && recentlyupdatedpass && calendarmatchedpass
    }, "extra props processed properly")


//    test.assert(() => {
//            const commonEvent = data.getData('cancelledEvent').results.map(page => {
//                return UTIL.convertPageToCommonEvent(page, RULES.CONVERT.eventPropertyExtractionRules, CALENDAR_IDS, UTIL)
//            })
//            return true
//        }
//        , 'Names array successfully registered in MockData');


    data.deleteData('cancelledEvent');

    test.runInGas(true);
    test.printHeader('ONLINE TESTS');
    /************************
     * Run Online Tests Here
     ************************/
}

/**
 * If we're running locally, execute the tests. In GAS environment, runTests() needs to be executed manually
 */
(function () {
    /*
     * @param {Boolean} - if true, were're in the GAS environment, otherwise we're running locally
     */
    const IS_GAS_ENV = typeof ScriptApp !== 'undefined';
    if (!IS_GAS_ENV) runTests();
})();