sc_require('core');


Planner.LOGGED_IN = SC.State.design({ 
  
  enterState: function() {
  	alert("Entered LOGGED_IN")
		Planner.getPath('plannerPage.plannerPane').append();
  },

  exitState: function() {
  },

  initialSubstate: 'Planner.VIEWING_PLANNER',


  COURSE_SIGNUP: SC.State.plugin('Planner.COURSE_SIGNUP'),
  VIEWING_PLANNER: SC.State.plugin('Planner.VIEWING_PLANNER'),




});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');