function main() {
  
  CONTROLLER.processCancelledEvents();

  let modified_eIds = CONTROLLER.syncToGCal();

  modified_eIds = CONFIG.IGNORE_RECENTLY_PUSHED ? modified_eIds : new Set();

  for (var c_name of Object.keys(CALENDAR_IDS)) {
    CONTROLLER.syncFromGCal(c_name, false, modified_eIds);
  }
}
