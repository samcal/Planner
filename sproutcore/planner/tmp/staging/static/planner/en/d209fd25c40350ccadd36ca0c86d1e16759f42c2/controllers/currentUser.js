sc_require('core');

Planner.currentUser = SC.ObjectController.create({
	// Basic user info fields
	username: "",
	firstName: "",
	lastName: "",

	// Computed properties for bindings
	fullName: function(){return "%@ %@".fmt(this.get('firstName'), this.get('lastName'))}.property(),
	loginGreeting: function(){return "Hi, %@".fmt(this.get('firstName'))}.observes('firstName').property(),

	// Error Controllers for various login views
	loginError: "Base Error",
	loginStatus: "Base Status",
	accountCreationError: "Base Error",

	// Checks whether or not the user is logged in
	checkLoginStatus: function() {
		SC.Request.getUrl('/isLoggedIn/')
			.notify(this, 'didRecieveLoginStatus')
			.send()
	},

	didRecieveLoginStatus: function(response) {
		if (SC.ok(response)) {
			data = JSON.parse(response.body());
			/*
				If we get a good status from the server, we go to the function to process the login data
				Else, we go to the LOGGED_OUT state
			*/
			if (data.status === 1)
				this.didRecieveLoginData(response);
			else
				Planner.statechart.gotoState('LOGGED_OUT')
		}
	},

	// Sends the login data to the server
	sendLogin: function(username, password) {
		var body = 'username=' + username + '&password=' + password;
		SC.Request.postUrl('/login/', body)
			.notify(this, 'didRecieveLoginData')
			.send();
		Planner.statechart.gotoState('LOGIN_LOADING');
	},

	didRecieveLoginData: function(response){
		if (SC.ok(response)) {
			var data = JSON.parse(response.body());
			if (data.error !== undefined) {
				Planner.statechart.invokeStateMethod('showError', data.error);
			} else if (data.status == 1) {
				/*
					- Go to the LOGGED_IN state
					- Get the list of courses from the server
					- set the fields for Planner.currentUser
				*/
				Planner.statechart.gotoState('LOGGED_IN');
				Planner.store.find(Planner.EVENT_QUERY);
				this.set('username', data.username);
				this.set('firstName', data.firstName);
				this.set('lastName', data.lastName);
				Planner.courses.set('content', Planner.store.find(Planner.COURSE_QUERY));
				Planner.pollManager.start()
			}
		}
	},

	// Sends the session logout to the server, goes to LOGGED_OUT state
	sendLogout: function() {
		SC.Request.getUrl('/logout/')
			.notify(this, 'didRecieveLogoutData')
			.send();
		Planner.pollManager.stop()
		Planner.statechart.invokeStateMethod('logout');
	},

	// Reset all of the fields
	didRecieveLogoutData: function(response) {
		this.set('username', '');
		this.set('firstName', '');
		this.set('lastName', '');
		Planner.courses.set('content', []);
	},

	// Sends the account creation data to the server, goes to CREATION_LOADING state
	sendNewAccount: function(username, password, firstname, lastname, email) {
		var body = 'username=%@&password=%@&firstname=%@&lastname=%@&email=%@'.fmt(username, password, firstname, lastname, email);
		SC.Request.postUrl('/register/', body)
			.notify(this, 'didRecieveAccountCreationStatus')
			.send();
	},

	didRecieveAccountCreationStatus: function(response) {
		if (SC.ok(response)) {
			var data = JSON.parse(response.body());
			if (data.status !== undefined) {
				// the account was created successfully
				Planner.statechart.invokeStateMethod('showStatus', data.status);
			} else if (data.error !== undefined) {
				// there was an error in account creation
				Planner.statechart.invokeStateMethod('showError', data.error);
			}
		}
	},

	// Sends the forgot password request to the server
	sendForgotPassword: function(email) {
		var body = 'email=%@'.fmt(email);
		SC.Request.postUrl('/forgotPassword/', body)
			.notify(this, 'didRecieveForgotPasswordStatus')
			.send();
	},

	didRecieveForgotPasswordStatus: function(response) {
		if (SC.ok(response)) {
			var data = JSON.parse(response.body());
			if(data.error){
				Planner.statechart.invokeStateMethod('showError', data.error);
			}else if(data.status){
				Planner.statechart.gotoState('PROVIDING_CREDENTIALS');
				Planner.statechart.invokeStateMethod('showStatus', data.status);
			}
			return YES;
		}
	}
});

Planner.courses = SC.ArrayController.create({
	content: [],
});