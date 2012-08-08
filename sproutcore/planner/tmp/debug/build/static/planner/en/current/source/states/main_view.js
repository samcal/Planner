Planner.MAIN_VIEW = SC.State.design({ 

  enterState: function() {
  	alert("Entered MAIN_VIEW");
  	this.gotoState('SIDE_VIEW');
  },

  exitState: function() {
  },


  COURSES: SC.State.plugin('Planner.COURSES'),
  ASSIGNMENTS: SC.State.plugin('Planner.ASSIGNMENTS'),
  TESTS: SC.State.plugin('Planner.TESTS'),
  NOTES: SC.State.plugin('Planner.NOTES'),
  ASSIGNMENT: SC.State.plugin('Planner.ASSIGNMENT'),
  TEST: SC.State.plugin('Planner.TEST'),
  NOTE: SC.State.plugin('Planner.NOTE'),
  ABOUT: SC.State.plugin('Planner.ABOUT'),
  FEEDBACK: SC.State.plugin('Planner.FEEDBACK')
  
  


});

; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');