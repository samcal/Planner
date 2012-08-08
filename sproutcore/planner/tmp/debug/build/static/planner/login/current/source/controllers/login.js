sc_require('core');
sc_require('models/user');

Planner.loginPageController = SC.Object.create({
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
			Planner.currentUser = Planner.User.create({
				firstName: data.firstName,
				lastName: data.lastName,
				courses: Planner.store.find(Planner.COURSE_QUERY),
			});
			alert(Planner.currentUser.get('courses'));
		}
	},
});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');