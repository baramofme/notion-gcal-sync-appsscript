function main() {
  
  processCancelledEvents();

  let modified_eIds = syncToGCal();

  modified_eIds = CONFIG.IGNORE_RECENTLY_PUSHED ? modified_eIds : new Set();

  for (var c_name of Object.keys(CALENDAR_IDS)) {
    console.log("main - syncFromGCal", c_name )
    syncFromGCal(c_name, false, modified_eIds);
  }
}
