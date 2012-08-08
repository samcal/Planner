Planner.CREATING_ACCOUNT = SC.State.extend({ 
  
  enterState: function() {
    Planner.getPath('loginPage.loginPane').append();
  },

  exitState: function() {
    Planner.getPath('loginPage.loginPane').remove();
  }

});

; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');