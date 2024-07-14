/* 
const CALENDAR_IDS = {

};
*/
if (typeof require !== 'undefined') {
    MockData = require('./__tests__/min/MockData.js');
    API = require('./api.js');
}

const CALENDAR_IDS = (() => {
    const onlyIncludesList = ["개인","생일","가족"];
    return {
        // @Todo 쓰기 권한이 있는 것만?
        //  대한민국의 휴일이 주루룩 동기화 대상이 되는 거 보고 화들짝 놀람
        ...API.GCAL.getAllGcalCalendar(),

    }
})()

if (typeof module !== 'undefined') module.exports = CALENDAR_IDS;