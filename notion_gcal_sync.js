function main() {
  
  CONTROLLER.processCancelledEvents();

  //@Todo 타입이 Set 이어야만 Utils.parseEvents 에서 오류가 안 난다.
  // 이게 맞는 거야? 이게 중복될 수도 있는 건가?
  // 그럼 차라리 syncToGcal 에서 목록 생성할때부터 Set 으로 해야겠네.
  let modifiedGCalEIds = new Set(CONTROLLER.syncToGCal()) ;

  // console.log('modifiedGCalEIds', modifiedGCalEIds)
  modifiedGCalEIds = CONFIG.IGNORE_RECENTLY_PUSHED ? modifiedGCalEIds : new Set();
  // console.log('modifiedGCalEIds', modifiedGCalEIds)

  for (const c_name of Object.keys(CALENDAR_IDS)) {
    CONTROLLER.syncFromGCal(c_name, false, modifiedGCalEIds);
  }
}
