/* 
const CALENDAR_IDS = {
  // Add calendars here. 
  // The key (string before ':') is what you name the calendar. 
  // The value (string after ':') is the calendar ID. 
  // e.g. ["My calendar name"]: "abcdefg1234@group.calendar.google.com",
  ["개인"]: "baram204@gmail.com",
  ["가족"]: "family04088495301278171384@group.calendar.google.com",
  ["생일"]: "addressbook#contacts@group.v.calendar.google.com"
};
*/

const CALENDAR_IDS = (()=> {
  return {
    ...API.GCAL.getAllCalendar()
    }
})()