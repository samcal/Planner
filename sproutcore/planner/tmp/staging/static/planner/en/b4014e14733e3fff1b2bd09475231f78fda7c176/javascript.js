/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// Project:   Planner
// Copyright: @2012 Nick Landolfi
// ==========================================================================
/*globals Planner */

/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Object
*/
Planner = SC.Application.create(
  /** @scope Planner.prototype */ {

  NAMESPACE: 'Planner',
  VERSION: '0.1.0',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.
  store: SC.Store.create({
    commitRecordsAutomatically: YES,
  }).from('Planner.DataSource')
  
  // TODO: Add global constants or singleton objects needed by your app here.

}) ;

/* >>>>>>>>>> BEGIN source/controllers/calendar.js */
sc_require('core');

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

Planner.Calendar = SC.Object.create({
	// Set the initial calendar values
	init: function() {
		arguments.callee.base.apply(this,arguments);
		this.set('monthnum', (new Date()).getMonth());
		this.set('yearnum', (new Date()).getFullYear());
		this.updateValues();
	},

	// Month index and year fields
	monthnum: 0,
	yearnum: 0,

	// Returns the name of the month, as defined above
	monthName: function(){return months[this.get('monthnum')]}.property(),

	// 2d array of date integers
	dayValues: [],

	// Updates the dayValues array, according to the month and year
	updateValues: function() {
		var today = new Date(this.get('yearnum'), this.get('monthnum'));
		while (today.getDay() > 0) {
			today.setDate(today.getDate() - 1);
		}

		var days = [];

		for (var i = 0; i < 5; i++) {
			var week = []
			for (var j = 0; j < 7; j++) {
				week[j] = today.getDate();
				today.setDate(today.getDate() + 1);
			}
			days[i] = week;
		}

		this.set('dayValues', days);
	}.observes('monthnum'),

	// Advances one month
	nextMonth: function() {
		var newFirst = new Date(this.get('yearnum'), this.get('monthnum')+1);
		this.set('yearnum', newFirst.getFullYear());
		this.set('monthnum', newFirst.getMonth());
	},

	// Regresses one month
	prevMonth: function() {
		var newFirst = new Date(this.get('yearnum'), this.get('monthnum')-1);
		this.set('yearnum', newFirst.getFullYear());
		this.set('monthnum', newFirst.getMonth());
	},

	retrieve: function(x,y){
		return this.get('dayValues')[x][y];
	}.property('dayValues'),

	month: function(){
		return months[this.get('monthnum')]
	}.property('monthnum'),

	numRows:5,
	numCols:5,
	topOffset: .1,
	colWidth: function(){1/this.get('numCols')}.property('numCols'),
	rowHeight: function(){(1-this.get('topOffset'))/this.get('numRows');}.property('topOffset', 'numRows'),

	create: function(){
		for(var r = 0; r < this.get('numRows'); r++){
			for(var c = 0; c < this.get('numCols'); c++){
				dateCell = Planner.DateCell.create({rowNum: r, dayNum: c});
				Planner.getPath('plannerPage.plannerPane.calendar').appendChild(dateCell);

			}
		}
	}
});
/* >>>>>>>>>> BEGIN source/controllers/currentUser.js */
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
			}
		}
	},

	// Sends the session logout to the server, goes to LOGGED_OUT state
	sendLogout: function() {
		SC.Request.getUrl('/logout/')
			.notify(this, 'didRecieveLogoutData')
			.send();
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
})
/* >>>>>>>>>> BEGIN source/controllers/week_controller.js */
Planner.WeekController = SC.Object.create({
	topOffset: .08,
	leftOffset:.015,
	numPeriods: function(){
		return this.get('courses').get('length');
	}.property('courses'),
	numDays: 5,
	headerHeight: function(){
		return this.get('topOffset')/2.5;
	}.property('topOffset'),
	headerTopSet: function(){
		return this.get('topOffset')-this.get('headerHeight');
	}.property('topOffset', 'headerHeight'),
	tabHeight: function(){
		return this.get('height')/4.5
	}.property('height'),
	tabWidth: function(){
		return this.get('leftOffset')*.9
	}.property('leftOffset'),
  width: function(){
  	return (1-this.get('leftOffset'))/this.get('numDays')-.0009
  }.property('numDays', 'leftOffset'),
  height: function(){
  	return (1-this.get('topOffset'))/this.get('numPeriods')-.0009
  }.property('numPeriods', 'topOffset'),
  hasZero: function(){
  	return this.get('numPeriods') === 7;
  }.property('numPeriods'),

  weeknum: 0,
  nextWeek: function(){this.set('weeknum', this.get('weeknum')+1)},
  prevWeek: function(){this.set('weeknum', this.get('weeknum')-1)},

  title: 'Week of the 1st of June',
  header0: 'Monday, June 1st',
	header1: 'Tuesday| 1',
  header2: 'Wednesday| 1',
  header3: 'Thursday| 1',
  header4: 'Friday| 1',

  coursesBinding: SC.Binding.from('Planner.courses'),

  create: function(){
  	title = SC.LabelView.create({textAlign: SC.ALIGN_CENTER, layout: {width: 500, centerX: 0}, classNames: ['title'], valueBinding: "Planner.WeekController.title"}),
  	Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(title);
  	for(var c = 0; c < this.get('numPeriods'); c++){
  		periodNumber = Planner.courses.objectAt(c).get('period');
  		periodTab = Planner.PeriodTab.create({periodNum: periodNumber});
  		Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(periodTab);
  		for(var d = 0; d < this.get('numDays'); d++){
  			if(c == 0){
  				bindingString = "Planner.WeekController.header" + d;
  				dayHeader = Planner.HeaderTab.create({dayNum: d, valueBinding: bindingString });
  				Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(dayHeader);
  			}
  			weekCell = Planner.WeekCell.create({dayNum: d, periodNum: periodNumber});
  			Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(weekCell);
  		}
  	}
  }.observes('weeknum'),
});

/* >>>>>>>>>> BEGIN source/models/course.js */
sc_require('core');

Planner.Course = SC.Record.extend({
	guid: SC.Record.attr(Number),
	period: SC.Record.attr(Number),
	name: SC.Record.attr(String),
	teacher: SC.Record.attr(String),

	assignments: SC.Record.toMany("Planner.Assignment", {
		inverse: "course",
		isMaster: YES,
	}),
	tests: SC.Record.toMany("Planner.Test", {
		inverse: "course",
		isMaster: YES,
	}),
	notes: SC.Record.toMany("Planner.Note", {
		inverse: "course",
		isMaster: YES,
	}),
	tasks: SC.Record.toMany("Planner.Task", {
		inverse: "course",
		isMaster: YES,
	}),

	sideCourseDisplay: function() {
		return "%@\n\twith %@".fmt(this.get('name'), this.get('teacher'));
	}.property(),
});
/* >>>>>>>>>> BEGIN source/models/event.js */
sc_require('core');

Planner.Event = SC.Record.extend({
	name: SC.Record.attr(String),
	date: SC.Record.attr(SC.DateTime, {format: '%Y-%m-%d', useIsoDate:YES}),
});

Planner.Note = Planner.Event.extend({
	file: SC.Record.attr(String),
	description: SC.Record.attr(String),
	course: SC.Record.toOne("Planner.Course", {
		inverse: "notes",
		isMaster: NO,
	}),
});

Planner.Test = Planner.Event.extend({
	description: SC.Record.attr(String),
	course: SC.Record.toOne("Planner.Course", {
		inverse: "tests",
		isMaster: NO,
	}),
});

Planner.Task = Planner.Event.extend({
	isComplete: SC.Record.attr(Boolean),
	course: SC.Record.toOne("Planner.Course", {
		inverse: "tasks",
		isMaster: NO,
	}),
});

Planner.Assignment = Planner.Task.extend({
	description: SC.Record.attr(String),
	dateAssigned: SC.Record.attr(SC.DateTime, {format: '%Y-%m-%d'}),
	dateDue: SC.Record.attr(SC.DateTime, {format: '%Y-%m-%d'}),
	course: SC.Record.toOne("Planner.Course", {
		inverse: "assignments",
		isMaster: NO,
	}),
});
/* >>>>>>>>>> BEGIN source/data_sources/data_source.js */
// ==========================================================================
// Project:   Planner.DataSource
// Copyright: @2012 My Company, Inc.
// ==========================================================================
/*globals Planner */

sc_require('models/course');
sc_require('models/event');

Planner.COURSE_QUERY = SC.Query.local(Planner.Course);
Planner.EVENT_QUERY = SC.Query.local(Planner.Event);


/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
Planner.DataSource = SC.DataSource.extend(
/** @scope Planner.CourseDataSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 

  fetch: function(store, query) {
    if (query == Planner.COURSE_QUERY) {
      SC.Request.getUrl('/courses/')
        .notify(this, 'didFetchCourses', store, query)
        .send();
        return YES;
    } else if (query == Planner.EVENT_QUERY) {
      SC.Request.getUrl('/events/')
        .notify(this, 'didFetchEvents', store, query)
        .send();
        return YES;
    }
    return NO;
  },

  didFetchCourses: function(response, store, query) {
    if (SC.ok(response)) {
      var data = JSON.parse(response.body());
      store.loadRecords(Planner.Course, data);
      store.dataSourceDidFetchQuery(query);
      Planner.WeekController.create();
    } else store.dataSourceDidErrorQuery(query, response);
  },

  didFetchEvents: function(response, store, query) {
    if (SC.ok(response)) {
      var data = JSON.parse(response.body());
      store.loadRecords(Planner.Assignment, data.assignments);
      store.loadRecords(Planner.Test, data.tests);
      store.loadRecords(Planner.Note, data.notes);
      store.loadRecords(Planner.Task, data.tasks);
      store.dataSourceDidFetchQuery(query);
    } else store.dataSourceDidErrorQuery(query, response);
  },
  
  retrieveRecord: function(store, storeKey) {
    if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Course)) {
      var url = '/course/' + store.idFor(storeKey);
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send();
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Assignment)) {
      var url = '/assignment/' + store.idFor(storeKey);
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Test)) {
      var url = '/test/' + store.idFor(storeKey);
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Note)) {
      var url = '/note/' + store.idFor(storeKey);
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Task)) {
      var url = '/task/' + store.idFor(storeKey);
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    }
    return NO;
  },

  didRetrieveData: function(response, store, storeKey) {
    if (SC.ok(response)) {
      var data = JSON.parse(response.body());
      store.dataSourceDidComplete(storeKey, data);
    } else store.dataSourceDidError(storeKey, response);
  },
  
  createRecord: function(store, storeKey) {
    /*if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Course) {
      SC.Request.postUrl('/course/create/')
        .notify(this, 'didCreateCourse', store, storeKey)
        .send(store.readDataHash(storeKey));

      return YES;
    }*/

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Assignment) {
      SC.Request.postUrl('/assignment/create/')
        .notify(this, 'didCreateAssignment', store, storeKey)
        .send(store.readDataHash(storeKey));
      return YES;
    }

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Test) {
      SC.Request.postUrl('/test/create/')
        .notify(this, 'didCreateTest')
        .send(store.readDataHash(storeKey));
      return YES;
    }

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Note) {
      SC.Request.postUrl('/note/create/')
        .notify(this, 'didCreateNote')
        .send(store.readDataHash(storeKey));
      return YES;
    }

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Task) {
      SC.Request.postUrl('/task/create/')
        .notify(this, 'didCreateTask')
        .send(store.readDataHash(storeKey));
      return YES;
    }å
    return NO;
  },

  didCreateCourse: function(response, store, storeKey) {
    /*if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);*/
  },

  didCreateAssignment: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);
  },

  didCreateTest: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);
  },

  didCreateNote: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);
  },

  didCreateTask: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);
  },
  
  updateRecord: function(store, storeKey) {
    
    // TODO: Add handlers to submit modified record to the data source
    // call store.dataSourceDidComplete(storeKey) when done.

    return NO; // return YES if you handled the storeKey
  },
  
  destroyRecord: function(store, storeKey) {
    
    // TODO: Add handlers to destroy records on the data source.
    // call store.dataSourceDidDestroy(storeKey) when done
    
    return NO; // return YES if you handled the storeKey
  }
  
}) ;

/* >>>>>>>>>> BEGIN source/models/user.js */
sc_require('core');

Planner.User = SC.Record.extend({
	firstName: SC.Record.attr(String),
	lastName: SC.Record.attr(String),
	fullName: function() {return "%@ %@".fmt(this.get('firstName'), this.get('lastName'));}.property(),
	courses: SC.Record.toMany("Planner.Course"),
	loginGreeting: function() {return "Hi, %@".fmt(this.get('firstName'));}.property()
});
/* >>>>>>>>>> BEGIN source/models/validators.js */

/* >>>>>>>>>> BEGIN source/resources/loginViewManager.js */
loginViewManager = SC.Object.create({
	date:							YES,
	bookMark:         YES,
	copyrightInfo:    YES,
	loginBin:         YES, 
	createAccountButton: YES,
	forgotAccountButton: YES,
	forgotPasswordBin: YES,
	createAccountBin:YES,
	loginHeader:YES,
	createAccountBin: YES,
	rememberedAccountButton: YES
});
/* >>>>>>>>>> BEGIN source/resources/views.js */
// Standard Objects necessary throughout the site
date = SC.DateTime.create();

// Custom Functions specfic to views management, eventually these should all be contained in a state file.
function getSup(day){if(day > 10 && day < 20) return "th";var temp = day%10; if(temp == 1) return "st"; else if(temp == 2) return "nd"; else if(temp == 3) return "rd"; else return "th";}


// Custom Views
Planner.BrownButton = SC.ButtonView.extend({
  classNames: ['brownButton'],
  textAlign: SC.ALIGN_CENTER,
}),

Planner.UtilItem = SC.ButtonView.extend({
	classNames: ['utilItem'],
	textAlign: SC.ALIGN_CENTER,
}),

Planner.Wrapper = SC.View.extend({
  backgroundColor: 'transparent'
}),

Planner.LoginView = SC.View.extend({
	// Keep width an even number!
  layout: {width: 326, height: 300, centerX: 0, centerY: 0, zIndex:100},
}),

Planner.LoginHeader = SC.LabelView.extend({
  //classNames: ['loginHeader'],
  textAlign: SC.ALIGN_CENTER,
  layout: {width: 200, height: 30, centerX: 0, centerY: -170},
}),

Planner.LoginError = SC.LabelView.extend({
	classNames: ['loginError'],
	textAlign: SC.ALIGN_CENTER,
}),

Planner.LoginStatus = SC.LabelView.extend({
	classNames: ['loginStatus'],
	textAlign: SC.ALIGN_CENTER
}),

Planner.LoginTextField = SC.TextFieldView.extend({
	classNames: ['login-text-field'],
  defaultTabbingEnabled: NO,
  spellCheckEnabled: NO,
  shouldRenderBorder: NO,
  // Capture the focus event, we use this to hide the error message
  fieldDidFocus: function(evt){
  	// If we are currently enabled, then send event
  	if(this.get('isEditable') == YES){
    	Planner.statechart.sendEvent('fieldFocused');
  	}
  },
  keyDown: function(evt){
  	arguments.callee.base.apply(this,arguments);
  	// If enter key, submit info
  	if(evt.keyCode === 13){
    	Planner.statechart.sendEvent('checkInfo');
  	}else{
  		// if enabled, send focus event
  		if(this.get('isEditable') === YES){
  			Planner.statechart.sendEvent('fieldFocused');
  		}
  	}
  }

}),

Planner.WeekCell = SC.View.extend({
  classNames: ['week-cell'],
  retrieve: function(property){
    //Just for convenience
    return Planner.WeekController.get(property);
  },
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.adjust({
      height: this.retrieve('height'),
      width: this.retrieve('width'),
      left: this.retrieve('leftOffset') + (this.get('dayNum') * this.retrieve('width')),
    });
    if(Planner.WeekController.get('hasZero')){
      this.adjust({
        top: this.retrieve('topOffset') + (this.get('periodNum') * this.retrieve('height')),
      });
    }else{
      this.adjust({
        top: this.retrieve('topOffset') + ((this.get('periodNum')-1) * this.retrieve('height')),
      });
    }
  }
}),

Planner.PeriodTab = SC.LabelView.extend({
  classNames: ['period-tab'],
  textAlign: SC.ALIGN_CENTER,
  retrieve: function(property){
    //Just for convenience
    return Planner.WeekController.get(property);
  },
  value: function(){return this.get('periodNum')}.property('periodNum'),
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.adjust({
      width: this.retrieve('tabWidth'),
      height: this.retrieve('tabHeight'),
    });
    if(Planner.WeekController.get('hasZero')){
      this.adjust({
        top: this.retrieve('topOffset') + (this.get('periodNum') * this.retrieve('height')),
      });
    }else{
      this.adjust({
        top: this.retrieve('topOffset') + ((this.get('periodNum')-1) * this.retrieve('height')),
      });
    }
  }
}),

Planner.HeaderTab = SC.LabelView.extend({
  classNames: ['header-tab'],
  retrieve: function(property){
    //Just for convenience
    return Planner.WeekController.get(property);
  },
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.adjust({
      width: this.retrieve('width'),
      height: this.retrieve('headerHeight'),
      top: this.retrieve('headerTopSet'),
      left: this.retrieve('leftOffset') + (this.get('dayNum') * this.retrieve('width')),
    });
  }
})

Planner.WeekView = Planner.Wrapper.extend({
  layout: {width: .98, height: .98, centerX: .00000000001, centerY: .00000000001},
});

Planner.DateCell = Planner.BrownButton.extend({
  retrieve: function(property){
    return Planner.Calendar.get(property);
  },
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.set('title', Planner.Calendar.retrieve(this.get('rowNum'), this.get('dayNum')));
    this.adjust({
      width: this.retrieve('colWidth'),
      height: this.retrieve('rowHeight'),
      top: this.retrieve('topOffset') + this.get('rowNum')*this.retrieve('rowHeight'),
      left: this.get('dayNum')*this.retrieve('colWidth'),
    });
  }
});

Planner.CalendarView = SC.View.extend({
  childViews: [
    'backArrow', 'monthName', 'nextArrow',
  ],
  backArrow: Planner.BrownButton.design({
    textAlign: SC.ALIGN_CENTER,
    title: '<',
    click: function(){Planner.Calendar.prevMonth();},
    layout: {width: .2, height: Planner.Calendar.get('topOffset')}
  }),
  monthName: SC.LabelView.design({
    textAlign: SC.ALIGN_CENTER,
    valueBinding: 'Planner.Calendar.monthName',
    layout: {width: .5, height: Planner.Calendar.get('topOffset'), centerX: .000000001},
    init: function(){
      arguments.callee.base.apply(this,arguments);
      $('#'+this.get('layerId')).css('font-size', (((Planner.Calendar.get('topOffset'))*450)+100) + '%')
    },
  }),
  nextArrow: Planner.BrownButton.design({
    textAlign: SC.ALIGN_CENTER,
    title: '>',
    click: function(){Planner.Calendar.nextMonth();},
    layout: {width: .2, height: Planner.Calendar.get('topOffset')}
  }),
  render: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Calendar.create();
  }
});
/* >>>>>>>>>> BEGIN source/statechart.js */

Planner.statechart = SC.Statechart.create({
  trace: YES,
	initialState: 'LOADED',
  
	LOADED: SC.State.design({ 
		// This state handles the original application load. Note ORIGINAL, login -> planner -> login is not original. This has nothing to do with 'firstLoad'.
	  enterState: function() {
	  	// CSS Adjustments
	  	current = SC.browser.current;
	  	if(current == 'firefox'){
	  		$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).addClass('firefox');
	  	}
	  	this.gotoState('LOGGED_OUT');
	  },

	  exitState: function() {
	    //Nothing needed here as of right now, we may need to implement some sort of loading thing in the future
	  }
	}),

	

	LOGGED_OUT: SC.State.plugin('Planner.LOGGED_OUT'),

  LOGGED_IN: SC.State.design({
  	firstLoad: true,
	  enterState: function() {
	  	// If we just came from login, then we have to do the login animations
	  	if(this.firstLoad == true){
		  	/* Close Animations for Login Page
					- Slide up bookmark
					- Hide forgotAccountBin and createAccountBin
					- Fade out the buttons and loginBin
					- Wait for all that to happen, then
						- Remove loginPage, append plannerPage
						- Reset the loginPage
							- Show forgotAccountBin, createAccountBin, forgotAccountButton,  createAccountButton and loginBin
							- Reset username and password fields
							- Fade out date, to prep for a fade in.
		  	*/
		  	$("#"+Planner.getPath('loginPage.loginPane.bookmark').get('layer').id).animate({translateY: '-=35'}, 500);
		  	Planner.Utility.hide([Planner.getPath('loginPage.loginPane.forgotAccountBin'), Planner.getPath('loginPage.loginPane.createAccountBin')]);
		  	$(Planner.getPath('loginPage.loginPane.createAccountButton').get('layer')).fadeToggle(300);
		  	$(Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer')).fadeToggle(300);
		  	$(Planner.getPath('loginPage.loginPane.loginBin').get('layer')).fadeToggle(500);
				SC.Timer.schedule({
						   action: function(){											   
						   						// Switch Pages
						   						Planner.getPath('loginPage.loginPane').remove();
		   		 								Planner.getPath('plannerPage.plannerPane').append();
											  	Planner.getPath('loginPage.loginPane.loginBin.username').set('value', '');
									  			Planner.getPath('loginPage.loginPane.loginBin.password').set('value', '');
									    		Planner.statechart.invokeStateMethod('startUp');
		   		 							},
		   		 		 interval: 500
				});
				// tell ourselves we did the login animations once, so not again
				this.set('firstLoad', false);
			}else{
				Planner.getPath('plannerPage.plannerPane').append();
	    	SC.Timer.schedule({
	    		action: function(){
						Planner.statechart.invokeStateMethod('startUp');
					},
					interval: 200
				});
    }
			
	  },

	  startUp: function(){
			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '+=35'}, 500);
			$(Planner.getPath('plannerPage.plannerPane.sideView').get('layer')).fadeIn(500);
			$(Planner.getPath('plannerPage.plannerPane.mainView').get('layer')).fadeIn(500);
	  },

	  logout: function(){
			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '-=90'}, 1000);
			$('#'+Planner.getPath('plannerPage.plannerPane.util').get('layer').id).animate({translateY: '-=55'}, 750);
			$(Planner.getPath('plannerPage.plannerPane.sideView').get('layer')).fadeOut(500);
			$(Planner.getPath('plannerPage.plannerPane.mainView').get('layer')).fadeOut(500);
			SC.Timer.schedule({
				action: function(){
					Planner.statechart.gotoState('LOGGED_OUT');
				},
				interval: 1000
			});
			this.set('firstLoad', true);
	  },

	  exitState: function(){
			Planner.getPath('plannerPage.plannerPane').remove();
	  },

    initialSubstate: 'VIEWING_PLANNER',
    VIEWING_PLANNER: SC.State.design({ 
			  substatesAreConcurrent: YES,
			  MAIN_VIEW: SC.State.design({
			  	initialSubstate: 'WEEK_PLANNER',
			  	DAY_PLANNER: SC.State.design({}),
			  	WEEK_PLANNER: SC.State.design({}),
			  	MONTH_PLANNER: SC.State.design({}),
			  }),
			  SIDE_VIEW: SC.State.design({
			  	initialSubstate: 'COURSES',
			  	COURSES: SC.State.design({}),
			  	ASSIGNMENTS: SC.State.design({}),
			  	TESTS: SC.State.design({}),
			  	NOTES: SC.State.design({}),
			  	ASSIGNMENT: SC.State.design({}),
			  	TEST: SC.State.design({}),
			  	NOTE: SC.State.design({}),
			  	FEEDBACK: SC.State.design({}),
			  	ABOUT: SC.State.design({})
			  }),
			  BOOKMARK: SC.State.design({
			  	initialSubstate: 'CLOSED',
			  	CLOSED: SC.State.design({
			  		toggleUtil: function(){
		    			Planner.Animation.oneUp(Planner.getPath('plannerPage.plannerPane.bookmark'), Planner.getPath('plannerPage.plannerPane.sideView'));
		    			Planner.Animation.oneUp(Planner.getPath('plannerPage.plannerPane.util'), Planner.getPath('plannerPage.plannerPane.bookmark'));
		    			Planner.Animation.oneUp(Planner.getPath('plannerPage.plannerPane.util.logout'), Planner.getPath('plannerPage.plannerPane.util'));
		    			Planner.Animation.oneUp(Planner.getPath('plannerPage.plannerPane.util.settings'), Planner.getPath('plannerPage.plannerPane.util'));
			  			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '+=60'}, 500);
			  			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '-=5'}, 100);
			  			$('#'+Planner.getPath('plannerPage.plannerPane.util').get('layer').id).animate({translateY: '+=60'}, 500);
			  			$('#'+Planner.getPath('plannerPage.plannerPane.util').get('layer').id).animate({translateY: '-=5'}, 100);
			  			this.gotoState('OPEN');
			  		}
			  	}),
			  	OPEN: SC.State.design({
			  		toggleUtil: function(){
			  			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '-=55'}, 500);
			  			$('#'+Planner.getPath('plannerPage.plannerPane.util').get('layer').id).animate({translateY: '-=55'}, 500);
			  			this.gotoState('CLOSED');
			  		},
			  		logoutPressed:function(){
				  		Planner.currentUser.sendLogout();
			  		}
			  	}),
			  })
		}),
		COURSE_SIGNUP: SC.State.design({})
	}),
});









/*-------------------------------------- Helpers --------------------------------------*/

Planner.Utility = SC.Object.create({
	// Takes the SproutCore object and returns a DOM Id, Used for animations.
	toId: function(object){
		return '#' + object.get('layer').id;
	},
	// Simple (redundant) value logic to see if a value exists
	isComplete: function(value){
		if (SC.none(value)) { return false; }
		if (! SC.none(value.length)) { return value.length > 0; }
		return YES;
	},
	// Simple (redundant) email validity check
	isEmail: function(value){
		return value.match(/.+@.+\..{2,4}/);
	},
	// Both hide() and show() deal with the 'display' property, items is an array
	hide: function(items){
		items.forEach(function(item){
			$(item.get('layer')).css('display', 'none');
		})
	},
	show: function(items){
		items.forEach(function(item){
			$(item.get('layer')).css('display', 'block');
		})
	},
	/* These two methods take a string for the page that they handle
		SUPPORTS: 'login', 'planner'
		Either enables or disables the field, also unfocuses them.
	*/
	enableFields: function(page){
		if(page === 'login'){
			this._getLoginFields().forEach(
	  			function(item){
	  				item.set('isEditable', YES);
						item.set('focused', NO);
	  			}
	  		)
		}
		if(page === 'planner'){
			this._getPlannerFields().forEach(
	  			function(item){
	  				item.set('isEditable', YES);
						item.set('focused', NO);
	  			}
	  		)
		}
	},
	disableFields: function(page){
		if(page === 'login'){
			this._getLoginFields().forEach(
	  			function(item){
	  				item.set('isEditable', NO);
						item.set('focused', NO)
	  			}
	  		)
		}
		if(page === 'planner'){
			this._getPlannerFields().forEach(
	  			function(item){
	  				item.set('isEditable', NO);
						item.set('focused', NO)
	  			}
	  		)
		}
	},
	// the _ means that this is a private helper method.
	_getLoginFields: function(){
		return [
		Planner.getPath('loginPage.loginPane.loginBin.username'),
		Planner.getPath('loginPage.loginPane.loginBin.password'),
		Planner.getPath('loginPage.loginPane.forgotAccountBin.email'),
		Planner.getPath('loginPage.loginPane.createAccountBin.username'),
		Planner.getPath('loginPage.loginPane.createAccountBin.password'),
		Planner.getPath('loginPage.loginPane.createAccountBin.passwordConfirmation'),
		Planner.getPath('loginPage.loginPane.createAccountBin.firstname'),
		Planner.getPath('loginPage.loginPane.createAccountBin.lastname'),
		Planner.getPath('loginPage.loginPane.createAccountBin.email')
		]
	},
	_getPlannerFields: function(){
		return [
			// Currently Empty!
		]
	},

})

Planner.Animation = SC.Object.create({
	// Basic Bookmark Animations:  Slide Up --> Changes the Text --> Slides back down (Handles Timing)
	SwitchBookmark: function(title, noHide){
		// If we passed this parameter, we do not need to slide up.
		if(!noHide){
			$('#'+Planner.getPath('loginPage.loginPane.bookmark').get('layer').id).animate({translateY: '-=35'}, 500);
		}
		// Set a timer to execute the value reset and slide down to occur in 300 milliseconds. 
		SC.Timer.schedule({
			target: this, 
			action: function(){	
				 $('#'+Planner.getPath('loginPage.loginPane.bookmark').get('layer').id).animate({translateY: '+=35'}, 500);
				 Planner.getPath('loginPage.loginPane.bookmark').set('value', title);}
			, interval: 300
		});
	},
	LoginCardSwitch: function(toSwitchTo){
		var a, b;
		switch(toSwitchTo){
			case 1 :
				a = Planner.getPath('loginPage.loginPane.loginBin');
				b = Planner.getPath('loginPage.loginPane.createAccountBin');
				break;
			case 2:
				b = Planner.getPath('loginPage.loginPane.loginBin');
				a = Planner.getPath('loginPage.loginPane.createAccountBin');
				break;
		}
		$(Planner.Utility.toId(a)).animate({translateX: '-=330'}, 500);
		$(Planner.Utility.toId(b)).animate({translateX: '+=20'}, 500);
		SC.Timer.schedule({
			action: function(){
				Planner.Animation.oneUp(a, b);
	  		$(Planner.Utility.toId(a)).animate({translateX: '+=330'}, 500);
	  		$(Planner.Utility.toId(b)).animate({translateX: '-=20'}, 500);
			}, 
			interval: 500
		});
		$('#'+Planner.getPath('loginPage.loginPane.loginHeader').get('layer').id).fadeToggle(700);
		$('#'+Planner.getPath('loginPage.loginPane.createAccountButton').get('layer').id).slideToggle(1000);
		$('#'+Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer').id).slideToggle(1000);
		$('#'+Planner.getPath('loginPage.loginPane.rememberedAccountButton').get('layer').id).slideToggle(1000);	
	},
	// Increase Z-Index by one, put 'over' over 'under'
	oneUp: function(over, under){
		newIndex = Number($(under.get('layer')).css('z-index')) + 1;
		$(over.get('layer')).css('z-index', newIndex)
	}
})

// TransformJS - Copyright (c) 2011 Strobe Inc. - For More Info, visit http://transformjs.strobeapp.com/
function Matrix(){}var Sylvester={version:"0.1.3",precision:1e-6};Matrix.prototype={e:function(a,b){return a<1||a>this.elements.length||b<1||b>this.elements[0].length?null:this.elements[a-1][b-1]},map:function(a){var b=[],c=this.elements.length,d=c,e,f,g=this.elements[0].length,h;do{e=d-c,f=g,b[e]=[];do h=g-f,b[e][h]=a(this.elements[e][h],e+1,h+1);while(--f)}while(--c);return Matrix.create(b)},multiply:function(a){if(!a.elements)return this.map(function(b){return b*a});var b=a.modulus?!0:!1,c=a.elements||a;typeof c[0][0]=="undefined"&&(c=Matrix.create(c).elements);if(!this.canMultiplyFromLeft(c))return null;var d=this.elements.length,e=d,f,g,h=c[0].length,i,j=this.elements[0].length,k=[],l,m,n;do{f=e-d,k[f]=[],g=h;do{i=h-g,l=0,m=j;do n=j-m,l+=this.elements[f][n]*c[n][i];while(--m);k[f][i]=l}while(--g)}while(--d);var c=Matrix.create(k);return b?c.col(1):c},x:function(a){return this.multiply(a)},canMultiplyFromLeft:function(a){var b=a.elements||a;return typeof b[0][0]=="undefined"&&(b=Matrix.create(b).elements),this.elements[0].length==b.length},setElements:function(a){var b,c=a.elements||a;if(typeof c[0][0]!="undefined"){var d=c.length,e=d,f,g,h;this.elements=[];do{b=e-d,f=c[b].length,g=f,this.elements[b]=[];do h=g-f,this.elements[b][h]=c[b][h];while(--f)}while(--d);return this}var i=c.length,j=i;this.elements=[];do b=j-i,this.elements.push([c[b]]);while(--i);return this}},Matrix.create=function(a){var b=new Matrix;return b.setElements(a)},$M=Matrix.create,function(a){if(!a.cssHooks)throw"jQuery 1.4.3+ is needed for this plugin to work";var b="transform",c,d,e,f,g,h=b.charAt(0).toUpperCase()+b.slice(1),i=["Moz","Webkit","O","MS"],j=document.createElement("div");if(b in j.style)d=b,e=j.style.perspective!==undefined;else for(var k=0;k<i.length;k++){c=i[k]+h;if(c in j.style){d=c,i[k]+"Perspective"in j.style?e=!0:f=!0;break}}d||(g="filter"in j.style,d="filter"),j=null,a.support[b]=d;var l=d,m={rotateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,Math.cos(a),Math.sin(-a),0],[0,Math.sin(a),Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateY:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),0,Math.sin(a),0],[0,1,0,0],[Math.sin(-a),0,Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateZ:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),Math.sin(-a),0,0],[Math.sin(a),Math.cos(a),0,0],[0,0,1,0],[0,0,0,1]]):$M([[Math.cos(a),Math.sin(-a),0],[Math.sin(a),Math.cos(a),0],[0,0,1]])}},scale:{defaultValue:1,matrix:function(a){return e?$M([[a,0,0,0],[0,a,0,0],[0,0,a,0],[0,0,0,1]]):$M([[a,0,0],[0,a,0],[0,0,1]])}},translateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[a,0,0,1]]):$M([[1,0,0],[0,1,0],[a,0,1]])}},translateY:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,a,0,1]]):$M([[1,0,0],[0,1,0],[0,a,1]])}},translateZ:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,a,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}}},n=function(b){var c=a(b).data("transforms"),d;e?d=$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]):d=$M([[1,0,0],[0,1,0],[0,0,1]]);for(var h in m)d=d.x(m[h].matrix(c[h]||m[h].defaultValue));e?(s="matrix3d(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+","+d.e(1,3).toFixed(10)+","+d.e(1,4).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+","+d.e(2,3).toFixed(10)+","+d.e(2,4).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+","+d.e(3,2).toFixed(10)+","+d.e(3,3).toFixed(10)+","+d.e(3,4).toFixed(10)+",",s+=d.e(4,1).toFixed(10)+","+d.e(4,2).toFixed(10)+","+d.e(4,3).toFixed(10)+","+d.e(4,4).toFixed(10),s+=")"):f?(s="matrix(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+"px,"+d.e(3,2).toFixed(10)+"px",s+=")"):g&&(s="progid:DXImageTransform.Microsoft.",s+="Matrix(",s+="M11="+d.e(1,1).toFixed(10)+",",s+="M12="+d.e(1,2).toFixed(10)+",",s+="M21="+d.e(2,1).toFixed(10)+",",s+="M22="+d.e(2,2).toFixed(10)+",",s+="SizingMethod='auto expand'",s+=")",b.style.top=d.e(3,1),b.style.left=d.e(3,2)),b.style[l]=s},o=function(b){return a.fx.step[b]=function(c){a.cssHooks[b].set(c.elem,c.now+c.unit)},{get:function(c,d,e){var f=a(c).data("transforms");return f===undefined&&(f={},a(c).data("transforms",f)),f[b]||m[b].defaultValue},set:function(c,d){var e=a(c).data("transforms");e===undefined&&(e={});var f=m[b];typeof f.apply=="function"?e[b]=f.apply(e[b]||f.defaultValue,d):e[b]=d,a(c).data("transforms",e),n(c)}}};if(l)for(var p in m)a.cssHooks[p]=o(p),a.cssNumber[p]=!0}(jQuery)

/* >>>>>>>>>> BEGIN source/states/logged_out.js */
sc_require('statechart');
Planner.LOGGED_OUT = SC.State.design({ 
	  enterState: function() {
	  	// If we are logged out, show the login screen
	    Planner.getPath('loginPage.loginPane').append();
	  },
	  firstLoad: true,
	  exitState: function(){
	  	// Let us know that we are leaving the state, and on the next entrance, to render originally
	  	this.set('firstLoad', true); 	
	  },
	  // When we enter the LOGGED_OUT state, automatically enter the LOGGING_IN substate
	  initialSubstate: 'LOGGING_IN',
	  LOGGING_IN: SC.State.design({
	  	initialSubstate: 'PROVIDING_CREDENTIALS',
	  	enterState: function(){
	  		// Not sure why we need == true, i think it may think true is a string?
	  		if(this.parentState.firstLoad == true){
  				Planner.Utility.show([
						Planner.getPath('loginPage.loginPane.forgotAccountBin'),
						Planner.getPath('loginPage.loginPane.createAccountBin'),
						Planner.getPath('loginPage.loginPane.createAccountButton'),
						Planner.getPath('loginPage.loginPane.forgotAccountButton'),
						Planner.getPath('loginPage.loginPane.loginBin')
					]);
					Planner.Utility.enableFields('login');
		  		// The things we dont need, we can hide
		  		Planner.Utility.hide([
		  			Planner.getPath('loginPage.loginPane.loginHeader'),
		  			Planner.getPath('loginPage.loginPane.rememberedAccountButton'),
		  		]);
		  		// Make sure that loginBin is on top of createAccountBin
		  		Planner.Animation.oneUp(Planner.getPath('loginPage.loginPane.loginBin'), Planner.getPath('loginPage.loginPane.createAccountBin'));
		  		// Fade in the date if we didnt just come from the planner (aka our last state was the login loader.)
			    if(this.historyState != 'LOGGED_OUT.LOGGING_IN.LOGIN_LOADING'){
			    	$(Planner.getPath('loginPage.loginPane.date').get('layer')).fadeToggle(1500);
			    }
			    // If this is the second time the user is viewing this page, we never faded in that sumbit button, we show it here.
			    Planner.Utility.show([Planner.getPath('loginPage.loginPane.loginBin.submit')]);
			    // Switch bookmark, second param true so its knows not to slide up, just down.
		  		Planner.Animation.SwitchBookmark('Planner Login', true);
		  		// Now we have loaded once, never again.
		  		this.parentState.set('firstLoad', 'false');
		  		return YES;
	  		}else{
		  		Planner.Animation.LoginCardSwitch(1);
					Planner.Animation.SwitchBookmark('Planner Login');
				}
	  	},
	  	fieldFocused: function(){
	  		this.gotoState('PROVIDING_CREDENTIALS');
	  	},
	  	PROVIDING_CREDENTIALS: SC.State.design({
		  	checkInfo: function() {
		  		// Get Values
		  		username = Planner.getPath('loginPage.loginPane.loginBin.username').value;
		  		password = Planner.getPath('loginPage.loginPane.loginBin.password').value;
		  		
		  		// Validity Checks
		  		isUsername = Planner.Utility.isComplete(username);
		  		isPassword = Planner.Utility.isComplete(password);
		  		// Error Statements
		  		neither = 'Please supply a Username & Password';
		  		noUsername = 'Please supply a Username';
		  		noPassword = 'Please supply a Password';

		  		if(!isUsername && !isPassword){
		  			this.showError(neither, 1, 2);
		  			return YES;	
		  		}

		  		if(!isUsername){
						this.showError(noUsername, 1);
		  			return YES;	
		  		}

		  		if(!isPassword){
		  			this.showError(noPassword, 2);
		  			return YES;	
		  		}

		  		if(isUsername && isPassword){
		  			Planner.Utility.disableFields('login');
			  		Planner.currentUser.sendLogin(username, password);
			  		return YES;
			  	}
			  	return YES;
		  	},
		  	createAccount: function(){
		  		this.gotoState('CREATING_ACCOUNT');
		  	},
		  	forgotPassword: function(){
		  		this.gotoState('FORGOT_PASSWORD');
		  	},
		  	// Switches the state and forwards the request
		  	showError: function(error, num){
		  		this.gotoState('LOGIN_ERROR');
		  		Planner.statechart.invokeStateMethod('showError', error, num)
		  	},
		  	showStatus: function(status){
		  		this.gotoState('LOGIN_STATUS');
		  		Planner.statechart.invokeStateMethod('showStatus', status)
		  	}
	  	}),
			LOGIN_ERROR: SC.State.design({
				showError: function(error, num, num2){
					// We Hite the CreateAccountBin so that when login shakes, it doesnt reveal the bin behind it.
					Planner.Utility.hide([Planner.getPath('loginPage.loginPane.createAccountBin')]);

					// Back and Forth shake -5 +10 -10 +10 -10 +5  == 0
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=5'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=10'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=10'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=10'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=10'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=5'}, 100);

					// If we were given the number of the invalid text field.
	  			if(num || num2 ){
	  				if(num == 1){
	  					$(Planner.getPath('loginPage.loginPane.loginBin.username').get('layer')).css('border-color', 'red');
	  				}
	  				if(num == 2){
	  					$(Planner.getPath('loginPage.loginPane.loginBin.password').get('layer')).css('border-color', 'red');
	  				}
	  			}
	  			// Set the value of the Error Bin to the error recieved, inside of runloop to force a controller update
	  			SC.RunLoop.begin();
	  			Planner.currentUser.set('loginError', error);
	  			SC.RunLoop.end()
	  			// Transitions, making use of jQuery
	  			$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.error').get('layer')).fadeIn();
	  			// Re-enable all the text fields 
	  			Planner.Utility.enableFields('login');
	  		},
	  		exitState: function(){
	  			/*
	  				- Reshow the Create Account Bin since we won't be doing any more shaking.
	  				- Hide the error
	  				- Reshow the login 'submit' button
	  				- Resets the border colors in case they are still red
	  			*/
	  			Planner.Utility.show([Planner.getPath('loginPage.loginPane.createAccountBin')]);
	  			$(Planner.getPath('loginPage.loginPane.loginBin.error').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeIn();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.username').get('layer')).css('border-color', 'maroon');
	  			$(Planner.getPath('loginPage.loginPane.loginBin.password').get('layer')).css('border-color', 'maroon');
	  		},
	  		// createAccount() and forgotPassword() simply forward those requests to the correct states.
	  		createAccount: function(){
		  		this.gotoState('CREATING_ACCOUNT');
		  	},
		  	forgotPassword: function(){
		  		this.gotoState('FORGOT_PASSWORD');
		  	},
			}),
			LOGIN_STATUS: SC.State.design({
				showStatus: function(status){
					// Set status, inside of runloop to force a controller update
					SC.RunLoop.begin();
	  			Planner.currentUser.set('loginStatus', status);
	  			SC.RunLoop.end()
	  			// Transitions, making use of jQuery
	  			$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.status').get('layer')).fadeIn();
	  			// Re-enable all the text fields 
	  			Planner.Utility.enableFields('login');
				},
				exitState: function(){
					// Fade out status, reshow login 'submit' button
					$(Planner.getPath('loginPage.loginPane.loginBin.status').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeIn();
				}
			}),
			// LOGIN LOADING NOT CURRENTLY IMPLEMENTED
	  	LOGIN_LOADING: SC.State.design({
				enterState: function(){
					// Fade out the login button, and fade in the spinner.
					$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeToggle();
					$(Planner.getPath('loginPage.loginPane.loginBin.spinner').get('layer')).fadeToggle();
				},
				exitState: function(){
					// Fade out the spinner, we don't fade back in the sumbit button because we know
					// that if the user is still viewing the page, they recieved an error.
					$(Planner.getPath('loginPage.loginPane.loginBin.spinner').get('layer')).fadeToggle();
				},
				// Simple forwarding method.
				showError: function(error, num){
		  		this.gotoState('LOGIN_ERROR');
		  		Planner.statechart.invokeStateMethod('showError', error, num)
		  	},
			}),
			FORGOT_PASSWORD: SC.State.design({
	  		enterState: function(){
	  			/*
	  				- Switch bookmark to Password Recovery title
	  				- Call enableFields() to unfocus all fields
	  				- Slide up the createAccount and forgotAccount buttons
	  				- Move the forgot account bin into place
	  				- Focus on the Email text field
	  				- Reset the action of the submit button to have it call loginInfo
	  			*/
	  			Planner.Animation.SwitchBookmark("Password Recovery");
	  			Planner.Utility.enableFields('login');
	  			$(Planner.getPath('loginPage.loginPane.createAccountButton').get('layer')).slideToggle(1000);
	  			$(Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer')).slideToggle(1000);
	  			$('#'+Planner.getPath('loginPage.loginPane.forgotAccountBin').get('layer').id).animate({translateY: '+=45'}, 1000);
	  			Planner.getPath('loginPage.loginPane.forgotAccountBin.email').$input()[0].focus();
	  			Planner.getPath('loginPage.loginPane.loginBin.submit').set('action', 'loginInfo');
	  		},
	  		exitState: function(){
	  			/*
	  				- Switch bookmark to Planner Login title
	  				- Enable fields to unfocus
	  				- Slide back down the createAccount and forgotAccountButtons
	  				- Slide the forgotAccountBin back to its hidden position
	  				- Set a timer to, after passwordBin is out of site, reset its values to the default hints and buttons
	  				- Reset the action of the submit button to have it call the normal checkInfo()
	  			*/
	  			Planner.Animation.SwitchBookmark('Planner Login');
	  			Planner.Utility.enableFields('login');
	  			$(Planner.getPath('loginPage.loginPane.createAccountButton').get('layer')).slideToggle(1000);
	  			$(Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer')).slideToggle(1000);
	  			$('#'+Planner.getPath('loginPage.loginPane.forgotAccountBin').get('layer').id).animate({translateY: '-=45'}, 1000);
	  			SC.Timer.schedule({
	  				action:function(){
	  								Planner.getPath('loginPage.loginPane.forgotAccountBin.email').set('hint', 'Your Email');
	  								Planner.getPath('loginPage.loginPane.forgotAccountBin.send').set('title', 'Send Email');
	  							},
	  			  interval: 700});
	  			Planner.getPath('loginPage.loginPane.loginBin.submit').set('action', 'checkInfo');
	  		},
	  		checkInfo: function(){
	  			// If they got here from the try again button.
	  			Planner.getPath('loginPage.loginPane.forgotAccountBin.send').set('title', 'Send Email');

	  			// Get the email value
	  			email = Planner.getPath('loginPage.loginPane.forgotAccountBin.email').value;

	  			// Errors Responses
	  			noEmail = 'Please provide an email...'
	  			notEmail = 'Please provide a valid email'

	  			// Validity Checks
	  			// Perform this first to throw if no value was given
	  			if(!Planner.Utility.isComplete(email)){
	  				this.showError(noEmail, true);
	  				return YES;
	  			}
	  			isEmail = Planner.Utility.isEmail(email);
	  			if(!isEmail){
	  				this.showError(notEmail, true);
	  				return YES;
	  			}

	  			Planner.Utility.disableFields('login');
	  			Planner.getPath('loginPage.loginPane.forgotAccountBin.send').set('title', 'Loading...');
	  			Planner.currentUser.sendForgotPassword(email);

	  		},
	  		showError: function(error, local){
	  			/*
	  				If this state internally sent us the error local == true. 
	  				In that case we never sent the request and therefore we don't need to 'Try Again'
	  				Otherwise, if local is emtpy, !local equals true and we display the 'Try Again'
	  			*/
	  			if(!local){
	  				Planner.getPath('loginPage.loginPane.forgotAccountBin.send').set('title', 'Try Again');
	  			}
	  			/* 
	  				- Unfocus fields with enable()
	  				- Clear field value and set hint
	  			*/ 
	  			Planner.Utility.enableFields('login');
  				Planner.getPath('loginPage.loginPane.forgotAccountBin.email').set('value', '');
  				Planner.getPath('loginPage.loginPane.forgotAccountBin.email').set('hint', error);
	  		},
	  		// Forwards a login function call. Rememeber how we reset the login button's action. Here we handle it.
	  		loginInfo: function(){
	  			this.gotoState('PROVIDING_CREDENTIALS');
	  			Planner.statechart.invokeStateMethod('checkInfo');
	  		}
	  	}),
	  }),
	  CREATING_ACCOUNT: SC.State.design({
	  	enterState: function(){
	  		Planner.Animation.LoginCardSwitch(2)
	  		Planner.Animation.SwitchBookmark('Planner Registration');	  		
	  	},
	  	exitState: function(){
	  		// Changing any red borders back to maroon
	  		// This breaks a rule too, _getLoginFields is private, but fuck it.
	  		Planner.Utility._getLoginFields().forEach(
	  			function(item){
	  				$(item.get('layer')).css('border-color', 'maroon');
	  			});
	  	},
	  	alreadyHaveAccount: function(){
	  		this.gotoState('LOGGING_IN')
	  	},
	  	fieldFocused: function(){
	  		this.gotoState('REGISTERING')
	  	},
	  	initialSubstate: 'REGISTERING',
	  	REGISTERING: SC.State.design({
		  	checkInfo: function(){
		  		// Collect values
		  		username = Planner.getPath('loginPage.loginPane.createAccountBin.username').value;
		  		password = Planner.getPath('loginPage.loginPane.createAccountBin.password').value;
		  		passwordConfirmation = Planner.getPath('loginPage.loginPane.createAccountBin.passwordConfirmation').value;
		  		firstname = Planner.getPath('loginPage.loginPane.createAccountBin.firstname').value;
		  		lastname = Planner.getPath('loginPage.loginPane.createAccountBin.lastname').value;
		  		email = Planner.getPath('loginPage.loginPane.createAccountBin.email').value;
		  		
		  		// First, check to see if all elements of the form are filled
		  		// Error Strings
		  		noFName = 'Please provide a First Name';
		  		noLName = 'Please provide a Last Name';
		  		noEmail = 'Please provide an Email';
		  		noUsername = 'Please provide a Username';
		  		noPassword = 'Please provide a Password';
		  		noPasswordConfirmation = 'Please confirm your Password';

		  		if(!Planner.Utility.isComplete(firstname)){
		  			this.showError(noFName, 1);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(lastname)){
		  			this.showError(noLName, 2);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(email)){
		  			this.showError(noEmail, 3);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(username)){
		  			this.showError(noUsername, 4);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(password)){
		  			this.showError(noPassword, 5);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(passwordConfirmation)){
		  			this.showError(noPasswordConfirmation, 6);
		  			return YES;
		  		}

		  		/*
		  			If we made it here, then we can assume that all fields have real values
		  			So now we:
		  				Perform all of our specific validations
		  				Then:
		  					Send the Request or Send a specific error respsonse
		  		*/

		  		/* Specific Validations: (In this Order)
		  			- Username is over 3 characters and under 10 characters
		  		  - Password is over 5 characters and under 10 characters
						- Passwords match
						- Email is legitimate
		  		*/
		  		usernameCheck = (username.length >= 3 && username.length <= 10);
		  		passwordCheck = (password.length >= 5 && password.length <= 10);
		  		passwords = (password === passwordConfirmation);
		  		isEmail = email.match(/.+@.+\..{2,4}/);

		  		// If we are good, create the account
		  		if(usernameCheck && passwordCheck && passwords && isEmail){
		  			Planner.currentUser.sendNewAccount(username, password, firstname, lastname, email);
		  			this.gotoState('CREATION_LOADING');
		  			Planner.Utility.disableFields('login');
		  			return YES;
		  		}

		  		// Otherwise prepare to send detailed feedback
		  		// Error Strings
		  		badEmail = 'Please provide a valid email';
					usernameShort = 'Username must be 3 characters or more';
		  		usernameLong = 'Username must be 10 characters or less';
		  		passwordShort = 'Password must be 5 characters or more';
		  		passwordLong = 'Password must be 10 characters or less';
		  		passwordsDif = 'Passwords do not match';

		  		/* Format
						showError(<errorString, <number of the error box>)
						Always return YES to break the function
		  		*/

		  		// Email
		  		if(!isEmail){
		  			this.showError(badEmail, 3);
		  			return YES;
		  		}

		  		// Username Feedback
		  		if(!usernameCheck){
		  			if(username.length < 3){
		  				this.showError(usernameShort, 4);
		  				return YES;
		  			}else if (username.length > 10){
		  				this.showError(usernameLong), 4;
		  				return YES;
		  			}
		  		}

		  		// Password Feedback
		  		if(!passwordCheck || !passwords){
		  			if(password.length < 5){
		  				this.showError(passwordShort, 5);
		  				return YES;
		  			}else if(password.length > 10){
		  				this.showError(passwordLong, 5);
		  				return YES;
		  			}else if(!passwords){
		  				this.showError(passwordsDif, 6);
		  				return YES;
		  			}
		  		}
		  	},
		  	// Switches the state and forwards the request
		  	showError: function(error, num){
		  		this.gotoState('CREATION_ERROR');
		  		Planner.statechart.invokeStateMethod('showError', error, num)
		  	}
	  	}),
	  	CREATION_ERROR: SC.State.design({
	  		showError: function(error, num){
	  			if(num){
	  				if(num == 1){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.firstname').get('layer')).css('border-color', 'red');
	  				}else if(num == 2){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.lastname').get('layer')).css('border-color', 'red');
	  				}else if(num == 3){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.email').get('layer')).css('border-color', 'red');
	  				}else if(num == 4){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.username').get('layer')).css('border-color', 'red');
	  				}else if(num == 5){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.password').get('layer')).css('border-color', 'red');
	  				}else if(num == 6){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.passwordConfirmation').get('layer')).css('border-color', 'red');
	  				}
	  			}
	  			// Set the value of the Error Bin to the error recieved, inside of runloop to force a controller update
	  			SC.RunLoop.begin();
	  			Planner.currentUser.set('accountCreationError', error);
	  			SC.RunLoop.end()
	  			// Transitions, making use of jQuery
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.submit').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.error').get('layer')).fadeIn();
	  			// Re-enable all the text fields 
	  			Planner.Utility.enableFields('login');
	  		},
	  		exitState: function(){
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.error').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.submit').get('layer')).fadeIn();
	  		},
	  	}),
  		CREATION_LOADING: SC.State.design({
				enterState: function(){
					// Fade out the create button, and fade in the spinner.
					$(Planner.getPath('loginPage.loginPane.createAccountBin.submit').get('layer')).fadeToggle();
					$(Planner.getPath('loginPage.loginPane.createAccountBin.spinner').get('layer')).fadeToggle();
				},
				exitState: function(){
					$(Planner.getPath('loginPage.loginPane.createAccountBin.spinner').get('layer')).fadeToggle();
				},
				// Simple forwarding method.
				showError: function(error, num){
		  		this.gotoState('CREATION_ERROR');
		  		Planner.statechart.invokeStateMethod('showError', error, num)
		  	},
		  	// We have this method so that we can more in depth deal with the 
		  	// successful account creation
		  	showStatus: function(status){
		  		// Call the Registration Reset Function, on a timer, so after the card switch animation
		  		SC.Timer.schedule({action:this.reset(), interval: 700});
		  		Planner.statechart.gotoState('LOGGING_IN');
		  		Planner.statechart.invokeStateMethod('showStatus', status)
		  	},
		  	reset: function(){
		  		$(Planner.getPath('loginPage.loginPane.createAccountBin.submit').get('layer')).fadeToggle();
		  		Planner.Utility._getLoginFields().forEach(
		  			function(item){
		  				item.set('value', '');
		  			});
		  		Planner.Utility.enableFields();
		  	}
			}),
	  }),
	});
/* >>>>>>>>>> BEGIN source/theme.js */
// ==========================================================================
// Project:   Planner
// Copyright: @2012 My Company, Inc.
// ==========================================================================
/*globals Planner */

// This is the theme that defines how your app renders.
//
// Your app is given its own theme so it is easier and less
// messy for you to override specific things just for your
// app.
//
// You don't have to create the whole theme on your own, though:
// your app's theme is based on SproutCore's Ace theme.
//
// NOTE: if you want to change the theme this one is based on, don't
// forget to change the :css_theme property in your buildfile.
Planner.Theme = SC.BaseTheme.create({
  name: 'planner'
});

// SproutCore needs to know that your app's theme exists
SC.Theme.addTheme(Planner.Theme);

// Setting it as the default theme makes every pane SproutCore
// creates default to this theme unless otherwise specified.
SC.defaultTheme = 'planner';

/* >>>>>>>>>> BEGIN source/resources/login_page.js */
// ==========================================================================
// Project:   Planner - Login Page
// Copyright: @2012 Nick Landolfi, Sam Calvert
// ==========================================================================


Planner.loginPage = SC.Page.design({
  loginPane: SC.MainPane.design({
    classNames: ['loginPane'],
    childViews: ['date',
                 'bookmark',
                 'copyrightInfo',
                 'loginHeader', 
                 'loginBin', 
                 'createAccountBin',
                 'forgotAccountBin', 
                 'forgotAccountButton',
                 'createAccountButton', 
                 'rememberedAccountButton', 
                  ],
    date: SC.LabelView.design({
      classNames: ['date'],
      layout: {width: .2, height: 40, top: 4, left: 16},
      value: date.toFormattedString('%A, %B %D') + getSup(date.get('day'))
    }),
    bookmark: SC.LabelView.design({
      classNames: ['bookmark'],
      textAlign: SC.ALIGN_CENTER,
      layout: { width: .125,  height: 35, top: -45, right: 20 },
      value: "Planner Login",
    }),
    copyrightInfo : SC.LabelView.design({
      classNames: ['copyrightInfo'],
      layout: { width: .25, height: 12, bottom: 5, left: 5},
      value: 'Planner Software © Nick Landolfi and Sam Calvert; 2012-2013'
    }),
    loginBin: Planner.LoginView.design({
      classNames: ['loginBin'],
      childViews: ['bearImage', 'username', 'password', 'submit', 'error', 'status', 'spinner'],   
      bearImage: SC.ImageView.design({
        layout: {height: 160, width: 160, centerX: 0},
        canLoadInBackground: NO,
        value: '/static/planner/en/b4014e14733e3fff1b2bd09475231f78fda7c176/source/resources/img/banner.png',
      }),
      username: Planner.LoginTextField.design({
        textAlign: SC.ALIGN_CENTER,
        hint: 'Username',
        textAlign: SC.ALIGN_CENTER,
        layout: {height: 35, width: 175, centerX: 0, centerY: 25},
      }),
      password: Planner.LoginTextField.design({
        hint: 'Password',
        textAlign: SC.ALIGN_CENTER,
        type: 'password',
        layout: {height: 35, width: 175, centerX: 0, centerY: 68},
      }),
      submit: SC.ButtonView.design({
        classNames: ['submit'],
        textAlign: SC.ALIGN_CENTER,
        layout: {height: 35, width: 90, centerX: 0, centerY: 115},
        title: 'Login',
        action: 'checkInfo',
      }),
      error: Planner.LoginError.design({
        layout: {width: 275, height: 30, centerX: 0, centerY: 120},
        valueBinding: 'Planner.currentUser.loginError',
      }),
      status: Planner.LoginStatus.design({
        layout: {width: 275, height: 30, centerX: 0, centerY: 120},
        valueBinding: 'Planner.currentUser.loginStatus',
      }),
      spinner: SC.ImageView.design({
        classNames: ['spinner'],
        layout: {height: 30, width: 30, centerX: 0, centerY: 117},
        useCanvas: NO,
        value: '/static/planner/en/b4014e14733e3fff1b2bd09475231f78fda7c176/source/resources/img/ajax-loader.gif',
      })
    }),
    createAccountBin: Planner.LoginView.design({
      classNames: ['createAccountBin'],
      childViews: ['firstname', 'lastname', 'email', 'username', 'password', 'passwordConfirmation', 'submit', 'error', 'spinner' ],
      firstname: Planner.LoginTextField.design({
        hint: 'First Name',
        layout: {height: 30, width: 250, centerX: 0,centerY: -120},
      }),
      lastname: Planner.LoginTextField.design({
        hint: 'Last Name',
        layout: {height: 30, width: 250, centerX: 0, centerY: -80},
      }),
      email: Planner.LoginTextField.design({
        hint: 'Email',
        layout: {height: 30, width: 250, centerX: 0, centerY: -40},
      }),
      username: Planner.LoginTextField.design({
        hint: 'Username',
        layout: {height: 30, width: 250, centerX: 0, centerY: 0},
      }),
      password: Planner.LoginTextField.design({
        hint: 'Password',
        isPassword: YES,
        layout: {height: 30, width: 250, centerX: 0, centerY: 40},
      }),
      passwordConfirmation: Planner.LoginTextField.design({
        hint: 'Confirm Password',
        isPassword: YES,
        layout: {height: 30, width: 250, centerX: 0, centerY: 80},
      }),
      submit: SC.ButtonView.design({
        classNames: ['submit'],
        textAlign: SC.ALIGN_CENTER,
        layout: {height: 30, width: 150, centerX: 0, centerY: 122},
        title: 'Create Account',
        action: 'checkInfo',
      }),
      error: Planner.LoginError.design({
        layout: {width: 275, height: 30, centerX: 0, centerY: 125},
        valueBinding: 'Planner.currentUser.accountCreationError' ,
      }),
      spinner: SC.ImageView.design({
        classNames: ['spinner'],
        layout: {height: 30, width: 30, centerX: 0, centerY: 125},
        useCanvas: NO,
        value: '/static/planner/en/b4014e14733e3fff1b2bd09475231f78fda7c176/source/resources/img/ajax-loader.gif',
      })
    }),
    forgotAccountBin: Planner.Wrapper.design({
      classNames: ['forgotPasswordBin'],
      childViews: ['email', 'send'],
      layout: {width:300, height:30, centerY: 130, centerX: 0},
      email: SC.TextFieldView.design({
        classNames: ['emailInput'], 
        hint: 'Your Email',
        spellCheckEnabled: NO,
        shouldRenderBorder: NO,
        layout: {height: 24, width: 200, centerX: -49},
        keyDown: function(evt){
          arguments.callee.base.apply(this,arguments);
          // If enter key, submit info
          if(evt.keyCode === 13){
            Planner.statechart.sendEvent('checkInfo');
          }
        }
      }),
      send: Planner.BrownButton.design({
        classNames: ['sendEmailButton'],
        layout: {width: 90, height: 24, centerX: 97},
        title: 'Send Email',
        action: 'checkInfo'
      }),
    }),
    loginHeader: Planner.Wrapper.design({
      childViews: ['loginTitle', 'rule'],
      loginTitle: Planner.LoginHeader.design({
              classNames: ['loginHeader'],

        value: 'Registration'
      }),
      rule: SC.LabelView.design({
        classNames: ['loginRule'],
        textAlign: SC.ALIGN_CENTER,
        layout: {width: 500, height: 50, centerX: 0, centerY: -170},
        value: '________________'
      }),
    }),
    createAccountButton: Planner.BrownButton.design({
      layout: {width: 150, height: 20, centerX: -80, centerY: 170, zIndex: 2},
      title: 'Create an Account',
      action: 'createAccount',
    }),
    forgotAccountButton: Planner.BrownButton.design({
      layout: {width: 150, height: 20, centerX: 80, centerY: 170, zIndex: 2},
      title: 'Forgot Password?',
      action: 'forgotPassword'
    }),
    rememberedAccountButton: Planner.BrownButton.design({
      layout: {width: 250, height: 20, centerX: 0, centerY: 170, zIndex: 1},
      title: 'Already have an Account?',
      action: 'alreadyHaveAccount',
    }), 
  }),
});
/* >>>>>>>>>> BEGIN source/resources/planner_page.js */
Planner.plannerPage = SC.Page.design({
  plannerPane: SC.MainPane.design({
    classNames: ['plannerPane'],
    childViews: ['date', 'bookmark', 'util', 'sideView', 'mainView', 'calendar'],
    date: SC.LabelView.design({
      classNames: ['date'],
      layout: {width: 260, height: 40, top: 4, left: 16, zIndex: 1},
      tagName: "h1", 
      value: date.toFormattedString('%A, %B %D') + getSup(date.get('day'))
    }),

    sideView: SC.View.design({
      layout: {width: .25, height: .45, right: .015, top: .1, zIndex: 0},
      classNames: ['sideView'],
      childViews: ['sideBin'],
      sideBin: SC.ScrollView.design({
        childViews: ['contentView'],
        contentView: SC.ListView.extend({
          classNames: ['my-list-view'],
          isSelectable: NO,
          rowHeight: 35,
          contentBinding: SC.Binding.oneWay('Planner.courses'),
          exampleView: SC.ListItemView.extend({
            contentValueKey: 'sideCourseDisplay'
          }),
        })
      })
    }),
   
    mainView: SC.View.design({
      classNames: ['mainView'],
      layout: {width: .7, height: .92, left: .015, top:.065},
      childViews: ['WeekView'],
    
      WeekView: Planner.WeekView.design({
        
      }),
    }),

    calendar: Planner.CalendarView.create({
      layout: {width: .21, height: .33, right:.036, top: .64}
    }),

    bookmark: SC.LabelView.design({
      classNames: ['bookmark'],
      layout: { width: .125,  height: 35, top: -45, right: 20, zIndex: 1 },
      mouseDown: function(){Planner.statechart.invokeStateMethod('toggleUtil')},
      textAlign: SC.ALIGN_CENTER,
      valueBinding: SC.Binding.from('Planner.currentUser.loginGreeting'),
    }),

    util: SC.View.design({
      layout: { width: .125,  height: 100, top: -100, right: 20, zIndex: 100 },
      classNames: ['util'],
      childViews: ['logout', 'settings'],
      logout: Planner.UtilItem.design({
        layout: {width: .999, height: 25, centerY: 35},
        title: 'Logout',
        action: 'logoutPressed',
      }),
      settings: Planner.UtilItem.design({
        layout: {width: .999, height: 25, centerY: 10},
        title: 'Settings'
      })
    })
  })
});
/* >>>>>>>>>> BEGIN source/main.js */
// ==========================================================================
// Project:   Planner
// Copyright: @2012 My Company, Inc.
// ==========================================================================
/*globals Planner */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
Planner.main = function main() {

  // Step 1: Tell your app it will load via states
  var statechart = Planner.statechart;
  SC.RootResponder.responder.set('defaultResponder', statechart); 
  statechart.initStatechart();


  // Step 2. Set the content property on your primary controller.
  // This will make your app come alive!

  // TODO: Set the content property on your primary controller
  // ex: MyApp.contactsController.set('content', MyApp.contacts);

} ;

function main() { Planner.main(); }
