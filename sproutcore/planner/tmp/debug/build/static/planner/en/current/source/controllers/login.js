sc_require('core');
sc_require('models/user');

Planner.loginPageController = SC.ObjectController.create({
	login: function(username, password) {
		var body = 'username=' + username + '&password=' + password;
		SC.Request.postUrl('/login/', body)
			.notify(this, 'didRecieveLoginData')
			.send();
	},

	didRecieveLoginData: function(response){
		data = JSON.parse(response.body());
		if (data.status == 0) {
			SC.info('Login Failed!')
		} else if (data.status == 1) {
			Planner.getPath('loginPage.loginPane').remove();
	    Planner.getPath('plannerPage.plannerPane').append();
			currentUser.set('firstName', data.firstName);
			currentUser.set('lastName', data.lastName);
			currentUser.set('courses', data.courses);
			Planner.store.find(Planner.EVENT_QUERY)
		}
	},

});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');