Planner.VIEWING_PLANNER = SC.State.design( SC.StateChartManager, { 
  
  substatesAreConcurrent: YES,

  enterState: function() {
  	alert("Entered VIEWING_PLANNER");
  },

  exitState: function() {
  },

  MAIN_VIEW: SC.State.plugin('Planner.MAIN_VIEW'),
  SIDE_VIEW: SC.State.plugin('Planner.SIDE_VIEW'),


});

; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');