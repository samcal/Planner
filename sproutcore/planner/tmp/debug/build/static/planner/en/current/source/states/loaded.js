sc_require('core');

Planner.LOADED = SC.State.design({ 
  
  enterState: function() {
  	alert('Entered LOADED')
    this.checkLoginStatus();
  },

  checkLoginStatus: function() {
		SC.Request.getUrl("/isLoggedIn/")
					.notify(this, 'didRecieveLoginStatus')
					.send();
  },

  didRecieveLoginStatus: function(response) {
		var data = JSON.parse(response.body());
		if (data.isLoggedIn) {
			this.gotoState('LOGGED_IN')
		} else {
			this.gotoState('LOGGED_OUT')
		}
	},

  exitState: function() {
    //Nothing needed here as of right now, we may need to implement some sort of loading thing in the future
  }
});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');