Planner.SIDE_VIEW = SC.State.design( SC.StateChartManager, { 
  
  substatesAreConcurrent: YES,

  enterState: function() {
  	alert("Entered VIEWING_PLANNER");
  	this.gotoState('MAIN_VIEW');
  	this.gotoState('SIDE_VIEW');
  },

  exitState: function() {
  },

  MAIN_VIEW: SC.State.plugin('Planner.MAIN_VIEW'),
  SIDE_VIEW: SC.State.plugin('Planner.SIDE_VIEW'),


});

; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');