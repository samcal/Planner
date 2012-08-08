Planner.COURSE_SIGNUP = SC.State.design({ 
  
  enterState: function() {
    Planner.getPath('loginPage.loginPane').append();
  },

  exitState: function() {
    Planner.getPath('loginPage.loginPane').remove();
  }

});

; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');