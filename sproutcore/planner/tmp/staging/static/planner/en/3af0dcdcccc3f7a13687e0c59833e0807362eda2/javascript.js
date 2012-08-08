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

/* >>>>>>>>>> BEGIN source/utility.js */
Planner.Utility = SC.Object.create({
	verbose: function(view, properties){
		SC.info('Verbose does not work, fix it or dont use it.');
		for(var i = 0; i < properties.length; i++){
			if(view.get(properties[i]) == undefined){ SC.warn(properties[i] + ' does not exist')}
			else if(view.get(properties[i]) == null){ SC.warn('You forgot to define the required ' + properties[i]);}
			else{ SC.info(properties[i] + ' = ' + view.get(properties[i]));}
		}
	},


	toId: function(arg){
		SC.info('toId is Deprecated, please use Planner.Utility.id() instead');
		SC.info(arg);
	},


	// Simple (redundant) value logic to see if a value exists
	isComplete: function(value){
		if (SC.none(value)) { return false; }
		if (! SC.none(value.length)) { return value.length > 0; }
		return YES;
	},


	datesAreEqual: function(x, y) {
		if (x != null && y != null)
			return x.get('year') == y.get('year') && x.get('month') == y.get('month') && x.get('day') == y.get('day');
	},


	// Takes an event object and returns its type
	type: function(item){
		if(SC.kindOf(item, Planner.Assignment)) return 'assignment'
    if(SC.kindOf(item, Planner.Test)) return 'test'
    if(SC.kindOf(item, Planner.Note)) return 'note'
    if(SC.kindOf(item, Planner.Task)) return 'task'
	},

	getType: function(){
		SC.error('Use type() instead of getType()');
	},


	// Takes the SproutCore object and returns a DOM Id, Used for animations.
	id: function(item){
		return '#' + item.get('layerId');
	},


	// Simple (redundant) email validity check
	isEmail: function(value){
		return value.match(/.+@.+\..+/);
	},

	// Deprecated
	hide: function(items){
		SC.error('Location: ' + items + '   Show is now in animation');
	},

	//Deprecated
	show: function(items){
		SC.error('Location: ' + items + '   Hide is now in animation');
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

	resetFields: function(items){
		items.forEach(function(item){
			item.set('value', '');
		});
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
/* >>>>>>>>>> BEGIN source/animation.js */
sc_require('utility');
Planner.Animation = SC.Object.create({
	// Basic Bookmark Animations:  Slide Up --> Changes the Text --> Slides back down (Handles Timing)
	SwitchBookmark: function(title, noHide){
		b = Planner.getPath('loginPage.loginPane.bookmark');
		// If we passed this parameter, we do not need to slide up.
		if(!noHide) $(Planner.Utility.id(b)).animate({translateY: '-=35'}, 500);
		// Set a timer to execute the value reset and slide down to occur in 300 milliseconds. 
		SC.Timer.schedule({
			action: function(){	
				$(Planner.Utility.id(b)).animate({translateY: '+=35'}, 500);
				b.set('value', title);
			},
			interval: 300
		});
		return YES;
	},
	LoginCardSwitch: function(toSwitchTo, directionEmerging){
		var a, b;
		switch(toSwitchTo){
			case 1 :
				a = Planner.getPath('loginPage.loginPane.loginBin');
				b = Planner.getPath('loginPage.loginPane.createAccountBin');
				$(Planner.Utility.id(a)).animate({translateX: '-=330'}, 500);
				$(Planner.Utility.id(b)).animate({translateX: '+=20'}, 500);
				SC.Timer.schedule({
					action: function(){
						Planner.Animation.oneUp(a, b);
			  		$(Planner.Utility.id(a)).animate({translateX: '+=330'}, 500);
			  		$(Planner.Utility.id(b)).animate({translateX: '-=20'}, 500);
					}, 
					interval: 500
				});
				break;
			case 2:
				b = Planner.getPath('loginPage.loginPane.loginBin');
				a = Planner.getPath('loginPage.loginPane.createAccountBin');
				$(Planner.Utility.id(a)).animate({translateX: '+=330'}, 500);
				$(Planner.Utility.id(b)).animate({translateX: '-=20'}, 500);
				SC.Timer.schedule({
					action: function(){
						Planner.Animation.oneUp(a, b);
			  		$(Planner.Utility.id(a)).animate({translateX: '-=330'}, 500);
			  		$(Planner.Utility.id(b)).animate({translateX: '+=20'}, 500);
					}, 
					interval: 500
				});
				break;
		}
 		$('#'+Planner.getPath('loginPage.loginPane.loginHeader').get('layer').id).fadeToggle(700);
		$('#'+Planner.getPath('loginPage.loginPane.createAccountButton').get('layer').id).slideToggle(1000);
		$('#'+Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer').id).slideToggle(1000);
		$('#'+Planner.getPath('loginPage.loginPane.rememberedAccountButton').get('layer').id).slideToggle(1000);	
		return YES;
	},

	// Shakes the bin; -5 +10 -10 +10 -10 +5  == 0
	shake: function(view){
		id = Planner.Utility.id(view);
		$(id).animate({translateX: '-=5'}, 100);
		$(id).animate({translateX: '+=10'}, 100);
		$(id).animate({translateX: '-=10'}, 100);
		$(id).animate({translateX: '+=10'}, 100);
		$(id).animate({translateX: '-=10'}, 100);
		$(id).animate({translateX: '+=5'}, 100);
		return YES;
	},


	// Both hide() and show() deal with the 'display' property, items is an array or single object
	hide: function(views){
		if(!(views instanceof Array)) views = [views];
			views.forEach(function(view){
			$(Planner.Utility.id(view)).css('display', 'none');
		})
		return YES;
	},


	show: function(views){
		if(!(views instanceof Array)) views = [views];
		views.forEach(function(view){
			$(Planner.Utility.id(view)).css('display', 'block');
		})
		return YES;
	},

	// Increase Z-Index by one, put 'over' over 'under'
	oneUp: function(over, under){
		newIndex = Number($(under.get('layer')).css('z-index')) + 1;
		$(over.get('layer')).css('z-index', newIndex);
		return YES;
	},

	fadeIn: function(views, time){
		if (!time) var time = 700;
		if(!(views instanceof Array)) views = [views];
		views.forEach( function(view){
			$(Planner.Utility.id(view)).fadeIn(time);
		});
		return YES;
	},
	fadeOut: function(views, time){
		if(!time) time = 700;
		if(!(views instanceof Array)) views = [views];
		views.forEach( function(view){
			$(Planner.Utility.id(view)).fadeOut(time);
		});
		return YES;
	},

	fadeToggle: function(views, time){
		if(!time) time = 700;
		if(!(views instanceof Array)) views = [views];
		views.forEach(function(view){
			$(Planner.Utility.id(view)).fadeToggle(time);
		})
		return YES;
	},

	slideToggle: function(views, time){
		if(!time) time = 700;
		if(!(views instanceof Array)) views = [views];
		views.forEach(function(view){
			$(Planner.Utility.id(view)).slideToggle(time);
		});
		return YES;
	},

	css: function(views, property, value){
		if(!(views instanceof Array)) views = [views];
		views.forEach(function(view){
			$(Planner.Utility.id(view)).css(property, value);
		});
		return YES;
	}

})
/* >>>>>>>>>> BEGIN source/controllers/calendar.js */
sc_require('core');

Planner.Calendar = SC.Object.create({
	// Set the initial calendar values
	init: function() {
		arguments.callee.base.apply(this,arguments);
		this.set('monthnum', (new Date()).getMonth());
		this.set('yearnum', (new Date()).getFullYear());
		this.updateValues();
	},

	// Month (0-indexed) and year fields
	monthnum: 0,
	yearnum: 0,

	// Returns the name of the month and year, in the form "June 2011"
	monthName: function(){return SC.DateTime.monthNames[this.get('monthnum')] + ' ' + this.get('yearnum')}.property(),

	// 2d array of date integers
	dayValues: [],

	// Updates the dayValues array, according to the month and year
	updateValues: function() {
		var today = new Date(this.get('yearnum'), this.get('monthnum'));
		if(today.getDay() == 0 || today.getDay() == 6) {
			while(today.getDay() != 1) {
				today.setDate(today.getDate() + 1);
			}
		} else {
			while (today.getDay() != 1) {
				today.setDate(today.getDate() - 1);
			}
		}

		var days = [];

		for (var i = 0; i < 6; i++) {
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
		return SC.DateTime.monthNames[this.get('monthnum')]
	}.property('monthnum'),
	numCols: function(){return this.get('dayValues')[0].length}.property('dayValues'),
	numRows: function(){return this.get('dayValues').length;}.property('dayValues'),
	topOffset: .25,
	colWidth: function(){return 1/this.get('numCols')}.property('numCols'),
	rowHeight: function(){return (1-this.get('topOffset'))/this.get('numRows');}.property('topOffset', 'numRows'),
});
/* >>>>>>>>>> BEGIN source/controllers/course_view_controller.js */
Planner.Courses = SC.ArrayController.create({
	content: [],
});
/* >>>>>>>>>> BEGIN source/controllers/currentUser.js */
sc_require('core');

Planner.currentUser = SC.ObjectController.create({
	// Basic user info fields
	username: "",
	firstName: "",
	lastName: "",
	isStudent: true,

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
			if (data.status/100 === 1)
				this.didRecieveLoginData(response);
			else
				Planner.statechart.gotoState('LOGGED_OUT');
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
			if (data.status == 101)  {
				/*
					- Go to the LOGGED_IN state
					- Get the list of courses from the server
					- set the fields for Planner.currentUser
				*/
				this.set('username', data.username);
				this.set('firstName', data.firstName);
				this.set('lastName', data.lastName);
				this.set('isStudent', true);
				Planner.Courses.set('content', Planner.store.find(Planner.COURSE_QUERY));
			}
			else if(data.status == 102){
				//implementaion for a teacher login
				this.set('isStudent', false);
			}else if (data.status == 301){
				Planner.statechart.invokeStateMethod('showError', 'Invalid Username', 1, 2);
			}else if(data.status == 302){
				Planner.statechart.invokeStateMethod('showError', 'Invalid Password', 2);
			}
		}
		return YES;
	},

	// Sends the session logout to the server, goes to LOGGED_OUT state
	sendLogout: function() {
		SC.Request.getUrl('/logout/')
			.notify(this, 'didRecieveLogoutData')
			.send();
		Planner.pollManager.stop();
		Planner.statechart.invokeStateMethod('logout');
	},

	// Reset all of the fields
	didRecieveLogoutData: function(response) {
		this.set('username', '');
		this.set('firstName', '');
		this.set('lastName', '');
		Planner.Courses.set('content', []);
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


/* >>>>>>>>>> BEGIN source/controllers/event_list_controller.js */
Planner.EventListController = SC.Object.create ({
	currentType: null,
	currentCourse: null,
	events: function(){
		if(this.get('currentCourse') != null) return this.get('currentCourse').get(this.get('currentType')+'s');
	}.property('currentCourse', 'currentType')
})
/* >>>>>>>>>> BEGIN source/controllers/month_controller.js */
sc_require('core');

Planner.MonthController = SC.Object.create({
	monthBinding: 'Planner.Calendar.monthnum',
	yearBinding: 'Planner.Calendar.yearnum'
});
/* >>>>>>>>>> BEGIN source/controllers/poll_manager.js */
/*
	Initiates long poll request every 5 seconds, or when the
	previous request returns, whichever comes first. Call
	start() to begin the process, stop() to cancel it.
*/
Planner.pollManager = SC.Object.create({
	start: function() {
		if(!this.running){
			this.running = YES;
			this.poll();
		}
	},

	// starts a new poll, cancels the outstanding request
	poll: function() {
		// cancel outstanding
		if(this.request) this.request.cancel();
		if(this.timer) this.timer.invalidate();

		// start a new request
		this.request = Planner.pollRequest.send();

		// set timout to restart the poll in 5 seconds
		this.timer = this.invokeLater(this.poll, 5000);
	},

	stop: function() {
		if(this.running) {
			this.running = NO;

			// about the XHR and clear the timer
			if(this.request) this.request.cancel();
			if(this.timer) this.timer.invalidate();

			this.timer = this.request = null;
		}
	},

	pollDidRespond: function(response) {
		if(SC.ok(response)) {
			var data = response.get('body');
			if(data.assignments){
				var assignment_ids = Planner.store.loadRecords(Planner.Assignment, data.assignments);
				for(var i = 0; i < assignment_ids.length; i++) {
					var assignment = Planner.store.find(Planner.Assignment, Planner.store.idFor(assignment_ids[i]));
					assignment.get('course').get('assignments').addInverseRecord(assignment);
				}
			}
			if(data.tests){
				var test_ids = Planner.store.loadRecords(Planner.Test, data.tests);
				for(var i = 0; i < test_ids.length; i++) {
					var test = Planner.store.find(Planner.Test, Planner.store.idFor(test_ids[i]));
					test.get('course').get('tests').addInverseRecord(test);
				}
			}
			if(data.notes){
				var note_ids = Planner.store.loadRecords(Planner.Note, data.notes);
				for(var i = 0; i < note_ids.length; i++) {
					var note = Planner.store.find(Planner.Note, Planner.store.idFor(note_ids[i]));
					note.get('course').get('notes').addInverseRecord(note);
				}
			}
			if(data.tasks){
				var task_ids = Planner.store.loadRecords(Planner.Task, data.tasks);
				for(var i = 0; i < task_ids.length; i++) {
					var task = Planner.store.find(Planner.Task, Planner.store.idfor(task_ids[i]));
					task.get('course').get('tasks').addInverseRecord(task);
				}
			}
			if(assignment_ids || test_ids || note_ids || task_ids) Planner.WeekController.updateAllCells();
		}
	}
});

Planner.pollRequest = SC.Request.getUrl('/poll/').json().notify(Planner.pollManager, 'pollDidRespond');
/* >>>>>>>>>> BEGIN source/controllers/week_controller.js */
sc_require('core');

Planner.WeekCellController = SC.Object.extend({
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.set('view', Planner.WeekCell.create({dayNum: this.get('date').get('dayOfWeek')-1, periodNum: this.get('period'), controller: this, events:[], eventsCreated: [], eventViews: []}));
    this.set('course', Planner.Courses.objectAt(this.get('period')-1));
    Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(this.get('view'));
    this.updateEvents();
  },
  period: 0,
  date: SC.DateTime.create(),
  view: SC.View.design(),
  course: '',
  events: [],
  updateEvents: function() {
    var allEvents = this.get('course').get('events');
    var todayEvents = [];
    for (var i = 0; i < allEvents.length; i++) {
      if (Planner.Utility.datesAreEqual(allEvents[i].get('date'), this.get('date')))
        todayEvents.push(allEvents[i]);
    }
    this.set('events', todayEvents);
  },
  updateView: function() {
    this.get('view').set('events', this.get('events'))
  }.observes('events'),
});

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

  cells: [],
  getController: function(x,y){
    return this.get('cells')[x][y]
  }.property(),

  updateAllCells: function() {
    for (var i = 0; i < this.get('cells').get('length'); i++) {
      for (var j = 0; j < this.get('cells').objectAt(i).get('length'); j++) {
        this.get('cells')[i][j].updateEvents()
      }
    }
    return YES;
  },

  title: '',
  header0: '',
	header1: '',
  header2: '',
  header3: '',
  header4: '',

  coursesBinding: SC.Binding.from('Planner.Courses'),

  create: function(){
    var firstDay = SC.DateTime.create();
    firstDay = firstDay.adjust({day:firstDay.get('day')+(this.get('weeknum')*7)});
    if (firstDay.get('dayOfWeek') === 0) {
      firstDay = firstDay.adjust({day:firstDay.get('day')+1})
    } else {
      while (firstDay.get('dayOfWeek') > 1) {
        firstDay = firstDay.adjust({day:firstDay.get('day')-1})
      }
    }

  	title = SC.LabelView.create({textAlign: SC.ALIGN_CENTER, layout: {width: .5, left:.25, height: .2}, classNames: ['title'], valueBinding: "Planner.WeekController.title"}),
  	Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(title);
    var periods = [];
  	for(var c = 0; c < this.get('numPeriods'); c++){
  		periodNumber = Planner.Courses.objectAt(c).get('period');
  		periodTab = Planner.PeriodTab.create({periodNum: periodNumber});
  		Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(periodTab);
      var days = []
  		for(var d = 0; d < this.get('numDays'); d++){
  			if(c == 0){
  				bindingString = "Planner.WeekController.header" + d;
  				dayHeader = Planner.HeaderTab.create({dayNum: d, valueBinding: bindingString });
  				Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(dayHeader);
  			}
        controller = Planner.WeekCellController.create({date: firstDay.adjust({day: firstDay.get('day')+d}), period: periodNumber});
        days[d] = controller;
  		}
      periods[c] = days;
  	}
    this.set('cells', periods);
    var first = this.get('cells')[0][0].get('date');
    this.set('title', 'Week of %@/%@'.fmt(first.get('month'), first.get('day')));
    for (var i = 0; i <= 4; i++) {
      var day = first.adjust({day:first.get('day')+i})
      this.set('header'+i, '%@ %@'.fmt(SC.DateTime.dayNames[day.get('dayOfWeek')], day.get('day')));
    }
    this.updateAllCells();
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
		isMaster: NO,
	}),
	tests: SC.Record.toMany("Planner.Test", {
		inverse: "course",
		isMaster: NO,
	}),
	notes: SC.Record.toMany("Planner.Note", {
		inverse: "course",
		isMaster: NO,
	}),
	tasks: SC.Record.toMany("Planner.Task", {
		inverse: "course",
		isMaster: NO,
	}),

	events: function() {
		return this.get('assignments').toArray().concat(this.get('tests').toArray()).concat(this.get('notes').toArray()).concat(this.get('tasks').toArray());
	}.property(),

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
		isMaster: YES,
	}),
});

Planner.Test = Planner.Event.extend({
	description: SC.Record.attr(String),
	course: SC.Record.toOne("Planner.Course", {
		inverse: "tests",
		isMaster: YES,
	}),
});

Planner.Task = Planner.Event.extend({
	isComplete: SC.Record.attr(Boolean, {defaultValue:NO}),
	course: SC.Record.toOne("Planner.Course", {
		inverse: "tasks",
		isMaster: YES,
	}),
});

Planner.Assignment = Planner.Task.extend({
	date: function(){return this.get('dateAssigned')}.property(),
	description: SC.Record.attr(String),
	dateAssigned: SC.Record.attr(SC.DateTime, {format: '%Y-%m-%d'}),
	dateDue: SC.Record.attr(SC.DateTime, {format: '%Y-%m-%d'}),
	course: SC.Record.toOne("Planner.Course", {
		inverse: "assignments",
		isMaster: YES,
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
      if(data) store.loadRecords(Planner.Course, data);
      store.dataSourceDidFetchQuery(query);
      Planner.WeekController.create();
      Planner.store.find(Planner.EVENT_QUERY);
    } else store.dataSourceDidErrorQuery(query, response);
  },

  didFetchEvents: function(response, store, query) {
    if (SC.ok(response)) {
      var data = JSON.parse(response.body());
      if(data.assignments) store.loadRecords(Planner.Assignment, data.assignments);
      if(data.tests) store.loadRecords(Planner.Test, data.tests);
      if(data.notes) store.loadRecords(Planner.Note, data.notes);
      if(data.tasks) store.loadRecords(Planner.Task, data.tasks);
      store.dataSourceDidFetchQuery(query);
      Planner.statechart.gotoState('LOGGED_IN');
      Planner.pollManager.start();
    } else store.dataSourceDidErrorQuery(query, response);
  },
  
  retrieveRecord: function(store, storeKey) {
    if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Course)) {
      var url = '/course/' + store.idFor(storeKey) + '/';
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send();
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Assignment)) {
      var url = '/assignment/' + store.idFor(storeKey) + '/';
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Test)) {
      var url = '/test/' + store.idFor(storeKey) + '/';
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Note)) {
      var url = '/note/' + store.idFor(storeKey) + '/';
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Task)) {
      var url = '/task/' + store.idFor(storeKey) + '/';
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
      if(data) store.loadRecord(store.recordTypeFor(storeKey), data);
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
      var data = store.readDataHash(storeKey);
      SC.Request.postUrl('/assignment/create/')
        .notify(this, 'didCreateAssignment', store, storeKey)
        .send('data=' + SC.json.encode(data));
      return YES;
    }

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Test) {
      SC.Request.postUrl('/test/create/', store, storeKey)
        .notify(this, 'didCreateTest')
        .send(store.readDataHash(storeKey));
      return YES;
    }

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Note) {
      SC.Request.postUrl('/note/create/', store, storeKey)
        .notify(this, 'didCreateNote')
        .send(store.readDataHash(storeKey));
      return YES;
    }

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Task) {
      SC.Request.postUrl('/task/create/', store, storeKey)
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
    if(Planner.currentUser.get('isStudent')) {
      if(SC.kindOf(store.recordTypeFor(storeKey), Planner.Assignment)) {
        var assignment = store.find(Planner.Assignment, store.idFor(storeKey));
        var body = 'isComplete=' + assignment.get('isComplete');
        SC.Request.postUrl('/assignment/' + store.idFor(storeKey) + '/update/', body)
          .notify(this, 'didUpdateEvent', store, storeKey)
          .send();
        store.dataSourceDidComplete(storeKey, null);
        return YES;
      } else if(SC.kindOf(store.recordTypeFor(storeKey), Planner.Task)) {
        var body = 'isComplete=' + store.find(Planner.Task, store.idFor(storeKey)).get('isComplete');
        SC.Request.postUrl('/task/' + store.idFor(storeKey) + '/update/', body)
          .notify(this, 'didUpdateEvent', store, storeKey)
          .send();
        return YES;
      }
    }

    return NO; // return YES if you handled the storeKey
  },

  didUpdateEvent: function(response, store, storeKey) {
    if (SC.ok(response) && JSON.parse(response.get('body')).status == 400) {
      store.dataSourceDidError(storeKey, 'We had an error with updating an event.');
    }
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

/* >>>>>>>>>> BEGIN source/models/weekcell.js */
sc_require('core')

Planner.WeekCell = SC.Record.extend({
	period: SC.Record.attr(Number),
	date: SC.Record.attr(SC.DateTime),
	events: SC.Record.toMany('Planner.Event', {
		inverse: 'course',
		isMaster: YES
	})
});
/* >>>>>>>>>> BEGIN source/resources/calendar_view.js */
Planner.DateCell = SC.ButtonView.extend({
  classNames: ['date-cell'],
  textAlign: SC.ALIGN_CENTER,  
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
  backArrow: SC.LabelView.design({
    textAlign: SC.ALIGN_CENTER,
    title: '<',
    mouseUp: function(){Planner.Calendar.prevMonth();},
    layout: {width: .2, height: Planner.Calendar.get('topOffset')}
  }),
  monthName: SC.LabelView.design({
    classNames: ['month-name'],
    textAlign: SC.ALIGN_CENTER,
    valueBinding: 'Planner.Calendar.monthName',
    layout: {width: .5, height: Planner.Calendar.get('topOffset'), centerX: .000000001},
    init: function(){
      arguments.callee.base.apply(this,arguments);
      $('#'+this.get('layerId')).css('font-size', (((Planner.Calendar.get('topOffset'))*450)+100) + '%')
    },
  }),
  nextArrow: SC.LabelView.design({
    textAlign: SC.ALIGN_CENTER,
    title: '>',
    mouseUp: function(){Planner.Calendar.nextMonth();},
    layout: {width: .2, height: Planner.Calendar.get('topOffset'), right: 10}
  }),
 

  datesBinding: 'Planner.Calendar.dayValues',
  currentDates: [],
  build: function() {
    // Take care of the old dates, if of course, there are any
    this.get('currentDates').forEach(function(item){item.destroy();});
    for(var r = 0; r < this.get('dates').get('length'); r++){
      for(var c = 0; c < this.get('dates').objectAt(0).get('length'); c++){
        dateCell = Planner.DateCell.create({rowNum: r, dayNum: c});
        this.appendChild(dateCell);
        this.get('currentDates').push(dateCell);
      }
    }
  }.observes('dates'),
});
/* >>>>>>>>>> BEGIN source/resources/views.js */
sc_require('utility');


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







Planner.CourseNumTab = SC.LabelView.extend({
  layout: {width: .125, left: 0},
  classNames: ['course-num-tab'],
  render: function(){
    arguments.callee.base.apply(this,arguments);
    // var x = $('#'+this.get('layerId')).css('height');
    // var textHeight = x.substring(0, x.length-2);
    // textHeight = textHeight-(textHeight *.2);
    // textHeight = textHeight + 'px'
    // $('#'+this.get('layerId')).css('font-size', textHeight);
  },
  value: function(){
    return this.get('parentView').get('course').get('period')
  }.property(),
});

Planner.CourseView = SC.View.extend({
  classNames: ['course-view'],
  layout: {width: .96, centerX: .0000000001},
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.adjust({
      height: (.90/ this.get('numCourses')),
      top: .025 + (.90/ this.get('numCourses'))*(this.get('num')) + (.01)*this.get('num')
    })
  },
  childViews: ['numTab', 'descBin'],
  
  numTab: Planner.CourseNumTab.design({}),
  descBin: SC.View.design({
    layout:{width:.86, left: .13},
    classNames: ['course-desc-view'],
    childViews: ['courseName', 'teacherName'],
    courseName: SC.LabelView.design({
      classNames: ['course-name'],
      layout: {left: .05, top: .15},
      value: function(){
        return this.get('parentView').get('parentView').get('course').get('name');
      }.property(),
      click: function(){
        Planner.statechart.invokeStateMethod('showAssignments', this.get('parentView').get('parentView').get('course'));
      },
    }),
    teacherName: SC.LabelView.design({
      classNames: ['teacher-name'],
      layout: {left:.15, top: .6},
       value: function(){
        return 'with ' + this.get('parentView').get('parentView').get('course').get('teacher');
      }.property(),
      click: function(){
        Planner.statechart.invokeStateMethod('showAssignments', this.get('parentView').get('parentView').get('course'));
      },
    }),
    click: function(){
        Planner.statechart.invokeStateMethod('showAssignments', this.get('parentView').get('course'));
      },

  }),
  click: function(){
    Planner.statechart.invokeStateMethod('showAssignments', this.get('course'));
  },
});

/* >>>>>>>>>> BEGIN source/resources/day_view.js */
sc_require('resources/views');

Planner.Today = Planner.Wrapper.extend({
	classNames: ['today'],
	layout: {width: .5}
});

Planner.Tomorrow = Planner.Wrapper.extend({
	classNames: ['tomorrow'],
	layout: {width: .5, left: .5}
});

Planner.DayView = Planner.Wrapper.extend({
  classNames: ['day-view'],
  childViews: ['today', 'tomorrow'],
  today: Planner.Today.create({}),
  tomorrow: Planner.Tomorrow.create({}),
});
/* >>>>>>>>>> BEGIN source/resources/week_view.js */
sc_require('utility');
Planner.WeekCheckImage = SC.ImageView.extend({
  layout: {width: .07, height: .8, left: .02, top: .13},
  classNames: ['pointer'],
  useCanvas: NO,
  render: function(){
    arguments.callee.base.apply(this,arguments);     
    if(this.get('parentView').get('content').get('isComplete')) {
      this.set('value', '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/check.png')
    }else{
      this.set('value', '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/uncheck.png')
    }
  },
  mouseDown: function(){
    var task =  this.get('parentView').get('content')
    var isComplete = task.get('isComplete');
    task.set('isComplete', !isComplete);
    this.switchComplete(isComplete);
  },
  switchComplete: function(isComplete){
    if(isComplete) this.set('value', '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/uncheck.png');
    if(!isComplete) this.set('value', '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/check.png');
  }
})

Planner.WeekEventView = Planner.Wrapper.extend({
  layout: {width: .95, height: .17, top: .05, left: .025},
  classNames: ['event-wrapper'],
  init: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Animation.hide([this]);
    this.updateClass();
    this.updatePosition();
    this.createIcon();
    $('#'+this.get('layerId')).fadeIn(300);
  },
  updateClass: function(){
    this.get('classNames').push(this.get('type'));
  }.observes('type'),
  createIcon: function(){
    type = this.get('type');
    if(type == 'assignment'){
      checkBox = Planner.WeekCheckImage.create({});
      this.appendChild(checkBox);
    }
  }.observes('type'),
  childViews: [ 'title'],
  title: SC.LabelView.design({
    layout: {width: .9, height: .9, left: .1, top:.07},
    value: function(){
      return this.get('parentView').get('content').get('name');
    }.property(),
    render: function(){
      arguments.callee.base.apply(this,arguments);
    }
  }),
  updatePosition: function(){
    this.adjust({
      top: .05 + (this.get('eventIndex')*.21) 
    })
  }.observes('eventIndex')
}),

Planner.WeekCellView = SC.View.extend({
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
    var left = this.get('dayNum') == this.retrieve('numDays')-1;
    var bottom = this.get('periodNum') == this.retrieve('courses').get('length');
    if(bottom && !left) this.get('classNames').push('top-left-bottom');
    else if(left && !bottom) this.get('classNames').push('top-left-right');
    else if(!bottom && !left) this.get('classNames').push('top-left');
  },
  controller: function(){
    return Planner.WeekController.getController(this.get('periodNum'), this.get('dayNum'));
  }.property(),
  // First we go through and see if the event already exists, if it does, then we don't recreate it, we leave it alone
  // Next, if the event already exists, we break, other wise we enter our event creation process
  // We have out eventOrder, which helps us set the superOrder, which organizes our events in groups
  //      - Basically here, test should be at the top, then notes, then assignments, and then tasks (this is dynamic and can be changed)
  // then we get the type, and the set the superOrder(where that event type appears based on its type)
  // Now we initialize a eventIndex variable, which is how we organize events, regardless of type, and we also create our adjustStartPoint variable
  // WE now loop through the event views, and check their superOrder, if a superorder happens to be less than our super order, then we set our index to it
  // We also grabbed the index of that eventView, so that now we can move all the views which come after it down. We do so by looping and incrementing
  // Finally!!, we create the newView, and add it to our eventsCreated list, or eventViews created, and then append it to the WeekCellVoew
  updateEvents: function(){
    $('#'+this.get('layerId')).children().forEach(function(item){item.destroy();});
    eventOrder = ['test', 'note', 'assignment', 'tasks'];
    for(var i = 0; i < this.get('events').get('length'); i++){
      e = this.get('events').objectAt(i);
      alreadyExists = false;
      for(var k = 0; k < this.get('eventsCreated').length; k++){
        if (e == this.get('eventsCreated')[k]){
          alreadyExists = true;
          SC.info(e + ' already exists');
          break;
        }
      }
      if(!alreadyExists){
        var eventType = Planner.Utility.type(e);
        var superOrder = eventOrder.indexOf(eventType);
        var eventIndex = 0;
        var adjustStartPoint = -1;
        for(var l = 0; l < this.get('eventViews').length; l++){
          if(superOrder < this.get('eventViews')[l].get('superOrder')){
            eventIndex = l;
            adjustStartPoint = l;
            break;
          }
          if(this.get('eventViews')[l+1] != undefined){
            if(superOrder == this.get('eventViews')[l].get('superOrder') && superOrder !== this.get('eventViews')[l+1].get('superOrder')){
              eventIndex = l;
              adjustStartPoint = l;
              break;
            }
          }
        }
        if(adjustStartPoint == -1){
          if(this.get('eventViews').length > 0) eventIndex = (this.get('eventViews')[(this.get('eventViews').length-1)].get('eventIndex')+1);
        }
        if(adjustStartPoint >= 0){
          for(var a = adjustStartPoint; a < this.get('eventViews').length; a++){
            this.get('eventViews')[a].set('eventIndex', (this.get('eventViews')[a].get('eventIndex')+1));
          }
        }
        newView = Planner.WeekEventView.create({content: e, eventIndex: eventIndex, superOrder: superOrder, type: eventType});
        this.get('eventsCreated').push(e);
        this.get('eventViews').insertAt(eventIndex, newView);
        this.appendChild(newView);
      }
    }
  }.observes('events')
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
  },
  render: function(){
    arguments.callee.base.apply(this,arguments);
    $('#'+this.get('layerId')).css('font-size', $('#'+this.get('layerId')).css('height'));
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
  layout: {width: .98, height: .98, left: .01, top: .01},
  classNames: ['week-view'],
});

/* >>>>>>>>>> BEGIN source/resources/event_list.js */
// sc_require('utility');
// sc_require('resources/week_view');

// Planner.ListCheckImage = Planner.WeekCheckImage.extend({

// })

// Planner.ListEventView = Planner.Wrapper.extend({
// 	layout: {width: .95, left: .025},
//   classNames: ['event-wrapper'],
//   init: function(){
//     arguments.callee.base.apply(this,arguments);
//     Planner.Animation.hide([this]);
//     this.updateClass();
//     this.updatePosition();
//     this.createIcon();
//     $('#'+this.get('layerId')).fadeIn(300);
//   },
//   updateClass: function(){
//     this.get('classNames').push(this.get('type'));
//   }.observes('type'),
//   createIcon: function(){
//     type = this.get('type');
//     if(type == 'assignment'){
//       checkBox = Planner.ListCheckImage.create({});
//       this.appendChild(checkBox);
//     }
//   }.observes('type'),
//   childViews: [ 'title'],
//   title: SC.LabelView.design({
//     layout: {width: .9, height: .9, left: .1, top:.07},
//     value: function(){
//       return this.get('parentView').get('content').get('name');
//     }.property(),
//     render: function(){
//       arguments.callee.base.apply(this,arguments);
//     }
//   }),
//   updatePosition: function(){
//     height = $('#'+Planner.getPath('plannerPage.plannerPane.sideView').get('layerId')).css('height');
//     height = height.substring(0, height.length-2)
//     n = .01 * height;
//     y = .05 * height;
//     this.adjust({
//       top: n + this.get('eventIndex')*(y + .2*y),
//       height: y
//     })
//   }.observes('eventIndex')
// })

// // Planner.EventListContent = Planner.Wrapper.extend({
// //   update: function(){
// //     for(var i = 0; i < this.get('eventViews').length; i++){
// //       this.get('eventViews')[i].destroy();
// //     }
// //     for(var i = 0; i < this.get('events').get('length'); i++){
// //       newEvent = Planner.ListEventView.create({content: this.get('events').objectAt(i), eventIndex: i, type: Planner.EventListController.get('currentType') }),
// //       this.appendChild(newEvent);
// //       this.get('eventViews').push(newEvent);
// //     }
// //     height = $('#'+Planner.getPath('plannerPage.plannerPane.sideView').get('layerId')).css('height');
// //     height = height.substring(0, height.length-2)
// //     n = .01 * height;
// //     y = .05 * height;
// //     this.adjust({
// //       //height: 2*n + this.get('events').get('length')*(y + .2*y)
// //     })
// //   }.observes('events')
// // });


// // Planner.EventList = SC.ScrollView.extend({
// //   layout: {zIndex: 1000},
// // 	hasHorizontalScroller: NO,
// // 	hasVerticalScroller: YES,
// // 	classNames: ['event-list'],
// // 	contentView: Planner.EventListContent.design({
// // 		eventsBinding: SC.Binding.from('Planner.EventListController.events'),
// // 		eventViews: [],
// //     layout: {zIndex: 1001, height: 1000},
// // 	})
// // });
/* >>>>>>>>>> BEGIN source/resources/frameworks.js */
sc_require('utility');
sc_require('animation');

Planner.CheckImage = SC.ImageView.extend({
  layout: {width: .07, height: .8, left: .02, top: .13},
  classNames: ['pointer'],
  useCanvas: NO,
  render: function(){
    arguments.callee.base.apply(this,arguments);     
    if(this.get('parentView').get('content').get('isComplete')) {
      this.set('value', '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/check.png')
    }else{
      this.set('value', '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/uncheck.png')
    }
  },
  mouseDown: function(){
    this.completeToggle();
  },
  completeToggle: function(){
    isComplete = this.get('parentView').get('content').get('isComplete');
    this.get('parentView').get('content').set('isComplete', !isComplete);
    if(isComplete) this.set('value', '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/uncheck.png');
    if(!isComplete) this.set('value', '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/check.png');
  }
});

Planner.EventView = Planner.Wrapper.extend({
	// content: null,
	// index: -1,
	// superOrder: -1,
  classNames: ['event-wrapper'],
  spacing: function(){
    return this.get('parentView').get('eventSpacing');
  }.property(),
  left: function(){
    return this.get('parentView').get('eventLeftOffset');
  }.property(), 
  top: function(){
    return this.get('parentView').get('eventTopOffset')*this.get('listHeight') + this.get('height')*this.get('index') + this.get('index')*this.get('spacing')*this.get('listHeight');
  }.property(),
  height: function(){
    return this.get('parentView').get('eventHeight') * this.get('listHeight');
  }.property(),
  width: function(){
    return this.get('parentView').get('eventWidth');
  }.property(),
  type: function(){
    return Planner.Utility.type(this.get('content'));
  }.property('content'),
  listHeight: function(){
    return this.get('parentView').get('currentHeight');
  }.property(),
  requiredProperties: 'content index superOrder left top height width type'.w(),
  init: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Animation.hide([this]);
    this.createChildren();
    this.updateClass();
    this.updatePosition();
    Planner.Animation.fadeIn(this, 700);;
  },
  updatePosition: function(){
    this.adjust({
   		width: this.get('width'),
  		height: this.get('height'),
  		left: this.get('left'),
    	top: this.get('top')
 		});
  }.observes('index'),
  updateClass: function() {
    this.get('classNames').push(this.get('type'));
  }.observes('type'),
  createChildren: function(){
    if(this.get('type') == 'assignment') this.appendChild(Planner.CheckImage.create({}));
    title = SC.LabelView.create({
	    layout: {width: .9, height: .9, left: .1, top:.07},
	    value: function(){
	      return this.get('parentView').get('content').get('name');
	    }.property(),
	  });
	  this.appendChild(title);
  }.observes('content'),  
});


Planner.EventListContent = Planner.Wrapper.extend({
	// eventsCreated: null, // type event objects
	// eventViews: null, //type views objects
	eventOrder: ['test', 'note', 'assignment', 'tasks'],
	events: function(){
    return this.get('parentView').get('parentView').get('events');
  }.property(),
	numEvents: function(){
    return this.get('events').get('length');
  }.property('events'),
	eventLeftOffset: function(){
    return this.get('parentView').get('parentView').get('eventLeftOffset');
  }.property(), 
  eventTopOffset: function(){
    return this.get('parentView').get('parentView').get('eventTopOffset');
  }.property(),
  eventHeight: function(){
    return this.get('parentView').get('parentView').get('eventHeight');
  }.property(),
  eventWidth: function(){
    return this.get('parentView').get('parentView').get('eventWidth');
  }.property(),
  eventSpacing: function(){
    return this.get('parentView').get('parentView').get('eventSpacing');
  }.property(),
  currentHeight: function(){
    return $(Planner.Utility.id(this)).css('height').slice(0,-2);
  }.property(),
  requiredProperties: 'eventsCreated eventViews eventOrder events numEvents eventLeftOffset eventTopOffset eventHeight eventWidth currentHeight'.w(),
	/*
		update(): observes events and behaves as follows.
			- Destroy all the current views
			- Decide if the event exists, if not, go about creating it
			- Loop over already created event views and find where the
				event in question fits into the list
			- If we didn't find a fit, check if the we have created any eventViews,
				if so, set the index of the view in question to the length of our 
				current eventViews. In essence, setting it to 1 + the last view's index
			- If we found an adjust point, loop over all events after that adjustPoint
				and increment their indices by one
			- Finally create the new view for the event and append it to the bin
			- Add the event to the eventsCreated array for future reference
			- Insert the view object at the *correct* index in the eventViews array.
			- Update the height of the content view to activate a scrollbar if needed.
				- Get pixel height, slice it, scale it, set it.
	*/
	update: function() {
    for(var i = 0; i < this.get('numEvents'); i++){
    	e = this.get('events').objectAt(i);
    	created = this.get('eventsCreated').contains(e);
      if(!created){
        superOrder = this.get('eventOrder').indexOf(Planner.Utility.type(e));
        index = 0;
        adjustPoint = -1;
        for(var l = 0; l < this.get('eventViews').get('length'); l++){
        	comparison = this.get('eventViews').objectAt(l).get('superOrder');
          nextComparison = this.get('eventViews').objectAt(l+1);
          if(superOrder < comparison){
            index = l;
            adjustPoint = l;
            break;
          }
          if(nextComparison != undefined && superOrder == comparison && superOrder !== nextComparison.get('superOrder')){
            index = l;
            adjustPoint = l;
            break;
          }
         }
        if(adjustPoint == -1) if(this.get('eventViews').get('length') > 0) index = this.get('eventViews').get('length');
        if(adjustPoint >= 0) for(var a = adjustPoint; a < this.get('eventViews').get('length'); a++) this.get('eventViews').objectAt(a).set('index', a+1);
        view = Planner.EventView.create({content: e, index: index, superOrder: superOrder, parentView: this })
        this.appendChild(view);
        this.get('eventsCreated').push(e);
        this.get('eventViews').insertAt(index, view);
     	} 
    }
    this.adjust({
    	height: this.get('eventTopOffset')*this.get('currentHeight')*2 + this.get('numEvents')*((this.get('currentHeight')*this.get('eventHeight'))+(this.get('currentHeight')*this.get('eventSpacing')))
    });
    return YES;
  }.observes('events')
});


Planner.EventList = SC.ScrollView.extend({
	// DEFINE THESE WHEN EXTENDING
	// events: null,
	// eventsCreated: null,
	// eventViews: null,
	// eventLeftOffset: null,
 //  eventTopOffset: null,
 //  eventHeight: null,
 //  eventWidth: null,
  requiredProperties: ['events', 'eventsCreated', 'eventViews', 'eventLeftOffset', 'eventTopOffset', 'eventHeight', 'eventWidth'],
	retrieve: function(){
		SC.error('You did not define the retrieve function to work with your current event list, or you just created a plain event list')
	},
	classNames: ['event-list'],
  contentView: Planner.EventListContent.design({
    eventsCreated: [],
    eventViews: [],
  })
});



Planner.WeekCell = Planner.EventList.extend({
	// Expected	
	// dayNum: null,
	// periodNum: null,
	// controller: null,
	// events: null,
	// eventsCreated: null,
	// eventViews: null,
	// FINALS
	eventLeftOffset: .025,
  eventTopOffset: .05,
  eventHeight: .17,
  eventWidth: .95,
  eventSpacing: .01,

  classNames: ['week-cell'],
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.build();
  },
  // Week Cell Custom Build Code
  build: function(){
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
    var left = this.get('dayNum') == this.retrieve('numDays')-1;
    var bottom = this.get('periodNum') == this.retrieve('courses').get('length');
    if(bottom && !left) this.get('classNames').push('top-left-bottom');
    else if(left && !bottom) this.get('classNames').push('top-left-right');
    else if(!bottom && !left) this.get('classNames').push('top-left');
  },
  retrieve: function(property){return Planner.WeekController.get(property);},
});


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
/* >>>>>>>>>> BEGIN source/statechart.js */
sc_require('utility');
sc_require('animation');

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
  	firstLoad: YES,
	  enterState: function() {
	  	// If we just came from login, then we have to do the login animations
	  	if(this.get('firstLoad')){
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
		  	Planner.Animation.hide([Planner.getPath('loginPage.loginPane.forgotAccountBin'), Planner.getPath('loginPage.loginPane.createAccountBin')]);
		  	Planner.Animation.fadeOut([Planner.getPath('loginPage.loginPane.createAccountButton'),
		  														 Planner.getPath('loginPage.loginPane.forgotAccountButton'), 
		  														 Planner.getPath('loginPage.loginPane.loginBin')
		  														 ], 500);
				SC.Timer.schedule({
					action: function(){											   
	   				// Switch Pages
	   				Planner.getPath('loginPage.loginPane').remove();
	 					Planner.getPath('plannerPage.plannerPane').append();
	 					Planner.Utility.resetFields([Planner.getPath('loginPage.loginPane.loginBin.username'), Planner.getPath('loginPage.loginPane.loginBin.password')]);
				    Planner.statechart.invokeStateMethod('startUp');
	 				},
		   		interval: 500
				});
				// tell ourselves we did the login animations once, so not again
				this.set('firstLoad', NO);
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
			$(Planner.Utility.id(Planner.getPath('plannerPage.plannerPane.bookmark'))).animate({translateY: '+=35'}, 500);
			Planner.Animation.fadeIn([Planner.getPath('plannerPage.plannerPane.sideView'), Planner.getPath('plannerPage.plannerPane.mainView')], 500)
	  },

	  logout: function(){
			$(Planner.Utility.id(Planner.getPath('plannerPage.plannerPane.bookmark'))).animate({translateY: '-=90'}, 1000);
			$(Planner.Utility.id(Planner.getPath('plannerPage.plannerPane.util'))).animate({translateY: '-=55'}, 750);
			Planner.Animation.fadeOut([Planner.getPath('plannerPage.plannerPane.sideView'), Planner.getPath('plannerPage.plannerPane.mainView').get('layer')], 500)
			SC.Timer.schedule({
				action: function(){
					Planner.statechart.gotoState('LOGGED_OUT');
				},
				interval: 1000
			});
			this.set('firstLoad', YES);
	  },

	  exitState: function(){
			Planner.getPath('plannerPage.plannerPane').remove();
	  },

    initialSubstate: 'VIEWING_PLANNER',
    VIEWING_PLANNER: SC.State.design({ 
			  substatesAreConcurrent: YES,
			  MAIN_VIEW: SC.State.design({
			  	initialSubstate: 'WEEK_PLANNER',
 					// Each of these states controls its fades
			  	// enterState(): Fades in, and handles the nave bar change
			  	// exitState: Fades out.
			  	gotoDay: function(){
			  		// Logic for checking if we are **not** in the DAY_PLANNER state
			  		if(this.get('currentPlannerView') != 'day') this.gotoState('DAY_PLANNER'); 
			  	},
			  	gotoWeek: function(){
			  		// Logic for checking if we are **not** in the WEEK_PLANNER state
			  		if(this.get('currentPlannerView') != 'week') this.gotoState('WEEK_PLANNER');
			  	},
			  	gotoMonth: function(){
			  		// Logic for checking if we are **not** in the MONTH_PLANNER state
			  		if(this.get('currentPlannerView') != 'month') this.gotoState('MONTH_PLANNER');
			  		
			  	},
			  	currentPlannerView: function(){
			  		if(Planner.statechart.currentStates().filterProperty('name', 'DAY_PLANNER').get('length') != 0) return 'day';
		  			if(Planner.statechart.currentStates().filterProperty('name', 'WEEK_PLANNER').get('length') != 0) return 'week';
			  		if(Planner.statechart.currentStates().filterProperty('name', 'MONTH_PLANNER').get('length') != 0) return 'month';
			  	}.property(),
			  	DAY_PLANNER: SC.State.design({
			  		enterState: function(){
			  			Planner.Animation.fadeIn(Planner.getPath('plannerPage.plannerPane.mainView.DayView'));
			  		},
			  		exitState: function(){
			  			Planner.Animation.fadeOut(Planner.getPath('plannerPage.plannerPane.mainView.DayView'));
			  		}
			  	}),
			  	WEEK_PLANNER: SC.State.design({
			  		enterState: function(){
			  			Planner.Animation.fadeIn(Planner.getPath('plannerPage.plannerPane.mainView.WeekView'));
			  		},
			  		exitState: function(){
			  			Planner.Animation.fadeOut(Planner.getPath('plannerPage.plannerPane.mainView.WeekView'));
			  		}
			  	}),
			  	MONTH_PLANNER: SC.State.design({
			  		enterState: function(){

			  		},
			  		exitState: function(){

			  		}
			  	}),
			  }),
			  SIDE_VIEW: SC.State.design({
			  	showAssignments: function(course){
			  		Planner.EventListController.set('currentCourse', course);
			  		Planner.EventListController.set('currentType', 'assignment');
			  		this.gotoState('EVENT_LIST');
			  	},
			  	showTests: function(course){
			  		Planner.EventListController.set('currentCourse', course);
			  		Planner.EventListController.set('currentType', 'test')
			  		this.gotoState('EVENT_LIST');
			  	},
			  	showNotes: function(course){
			  		Planner.EventListController.set('currentCourse', course);
			  		Planner.EventListController.set('currentType', 'note')
			  		this.gotoState('EVENT_LIST');
			  	},
			  	initialSubstate: 'COURSES',
			  	COURSES: SC.State.design({
			  		enterState: function(){
			  			Planner.Animation.fadeIn(Planner.getPath('plannerPage.plannerPane.sideView.courses'));
			  		},
			  		exitState: function(){
			  			Planner.Animation.fadeOut(Planner.getPath('plannerPage.plannerPane.sideView.courses'))
			  		}
			  	}),
			  	EVENT_LIST: SC.State.design({
			  		enterState: function(){
			  			Planner.Animation.fadeIn(Planner.getPath('plannerPage.plannerPane.sideView.eventList'));
			  		},
			  		exitState: function(){
			  			Planner.Animation.fadeOut(Planner.getPath('plannerPage.plannerPane.sideView.eventList'));
			  		}
			  	}),
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
			  			$(Planner.Utility.id(Planner.getPath('plannerPage.plannerPane.bookmark'))).animate({translateY: '+=60'}, 500);
			  			$(Planner.Utility.id(Planner.getPath('plannerPage.plannerPane.bookmark'))).animate({translateY: '-=5'}, 100);
			  			$(Planner.Utility.id(Planner.getPath('plannerPage.plannerPane.util'))).animate({translateY: '+=60'}, 500);
			  			$(Planner.Utility.id(Planner.getPath('plannerPage.plannerPane.util'))).animate({translateY: '-=5'}, 100);
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




// TransformJS - Copyright (c) 2011 Strobe Inc. - For More Info, visit http://transformjs.strobeapp.com/
function Matrix(){}var Sylvester={version:"0.1.3",precision:1e-6};Matrix.prototype={e:function(a,b){return a<1||a>this.elements.length||b<1||b>this.elements[0].length?null:this.elements[a-1][b-1]},map:function(a){var b=[],c=this.elements.length,d=c,e,f,g=this.elements[0].length,h;do{e=d-c,f=g,b[e]=[];do h=g-f,b[e][h]=a(this.elements[e][h],e+1,h+1);while(--f)}while(--c);return Matrix.create(b)},multiply:function(a){if(!a.elements)return this.map(function(b){return b*a});var b=a.modulus?!0:!1,c=a.elements||a;typeof c[0][0]=="undefined"&&(c=Matrix.create(c).elements);if(!this.canMultiplyFromLeft(c))return null;var d=this.elements.length,e=d,f,g,h=c[0].length,i,j=this.elements[0].length,k=[],l,m,n;do{f=e-d,k[f]=[],g=h;do{i=h-g,l=0,m=j;do n=j-m,l+=this.elements[f][n]*c[n][i];while(--m);k[f][i]=l}while(--g)}while(--d);var c=Matrix.create(k);return b?c.col(1):c},x:function(a){return this.multiply(a)},canMultiplyFromLeft:function(a){var b=a.elements||a;return typeof b[0][0]=="undefined"&&(b=Matrix.create(b).elements),this.elements[0].length==b.length},setElements:function(a){var b,c=a.elements||a;if(typeof c[0][0]!="undefined"){var d=c.length,e=d,f,g,h;this.elements=[];do{b=e-d,f=c[b].length,g=f,this.elements[b]=[];do h=g-f,this.elements[b][h]=c[b][h];while(--f)}while(--d);return this}var i=c.length,j=i;this.elements=[];do b=j-i,this.elements.push([c[b]]);while(--i);return this}},Matrix.create=function(a){var b=new Matrix;return b.setElements(a)},$M=Matrix.create,function(a){if(!a.cssHooks)throw"jQuery 1.4.3+ is needed for this plugin to work";var b="transform",c,d,e,f,g,h=b.charAt(0).toUpperCase()+b.slice(1),i=["Moz","Webkit","O","MS"],j=document.createElement("div");if(b in j.style)d=b,e=j.style.perspective!==undefined;else for(var k=0;k<i.length;k++){c=i[k]+h;if(c in j.style){d=c,i[k]+"Perspective"in j.style?e=!0:f=!0;break}}d||(g="filter"in j.style,d="filter"),j=null,a.support[b]=d;var l=d,m={rotateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,Math.cos(a),Math.sin(-a),0],[0,Math.sin(a),Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateY:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),0,Math.sin(a),0],[0,1,0,0],[Math.sin(-a),0,Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateZ:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),Math.sin(-a),0,0],[Math.sin(a),Math.cos(a),0,0],[0,0,1,0],[0,0,0,1]]):$M([[Math.cos(a),Math.sin(-a),0],[Math.sin(a),Math.cos(a),0],[0,0,1]])}},scale:{defaultValue:1,matrix:function(a){return e?$M([[a,0,0,0],[0,a,0,0],[0,0,a,0],[0,0,0,1]]):$M([[a,0,0],[0,a,0],[0,0,1]])}},translateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[a,0,0,1]]):$M([[1,0,0],[0,1,0],[a,0,1]])}},translateY:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,a,0,1]]):$M([[1,0,0],[0,1,0],[0,a,1]])}},translateZ:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,a,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}}},n=function(b){var c=a(b).data("transforms"),d;e?d=$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]):d=$M([[1,0,0],[0,1,0],[0,0,1]]);for(var h in m)d=d.x(m[h].matrix(c[h]||m[h].defaultValue));e?(s="matrix3d(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+","+d.e(1,3).toFixed(10)+","+d.e(1,4).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+","+d.e(2,3).toFixed(10)+","+d.e(2,4).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+","+d.e(3,2).toFixed(10)+","+d.e(3,3).toFixed(10)+","+d.e(3,4).toFixed(10)+",",s+=d.e(4,1).toFixed(10)+","+d.e(4,2).toFixed(10)+","+d.e(4,3).toFixed(10)+","+d.e(4,4).toFixed(10),s+=")"):f?(s="matrix(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+"px,"+d.e(3,2).toFixed(10)+"px",s+=")"):g&&(s="progid:DXImageTransform.Microsoft.",s+="Matrix(",s+="M11="+d.e(1,1).toFixed(10)+",",s+="M12="+d.e(1,2).toFixed(10)+",",s+="M21="+d.e(2,1).toFixed(10)+",",s+="M22="+d.e(2,2).toFixed(10)+",",s+="SizingMethod='auto expand'",s+=")",b.style.top=d.e(3,1),b.style.left=d.e(3,2)),b.style[l]=s},o=function(b){return a.fx.step[b]=function(c){a.cssHooks[b].set(c.elem,c.now+c.unit)},{get:function(c,d,e){var f=a(c).data("transforms");return f===undefined&&(f={},a(c).data("transforms",f)),f[b]||m[b].defaultValue},set:function(c,d){var e=a(c).data("transforms");e===undefined&&(e={});var f=m[b];typeof f.apply=="function"?e[b]=f.apply(e[b]||f.defaultValue,d):e[b]=d,a(c).data("transforms",e),n(c)}}};if(l)for(var p in m)a.cssHooks[p]=o(p),a.cssNumber[p]=!0}(jQuery)

/* >>>>>>>>>> BEGIN source/states/logged_out.js */
sc_require('statechart');
sc_require('utility');

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
  				Planner.Animation.show([
						Planner.getPath('loginPage.loginPane.forgotAccountBin'),
						Planner.getPath('loginPage.loginPane.createAccountBin'),
						Planner.getPath('loginPage.loginPane.createAccountButton'),
						Planner.getPath('loginPage.loginPane.forgotAccountButton'),
						Planner.getPath('loginPage.loginPane.loginBin')
					]);
					Planner.Utility.enableFields('login');
		  		// The things we dont need, we can hide
		  		Planner.Animation.hide([
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
			    Planner.Animation.show(Planner.getPath('loginPage.loginPane.loginBin.submit'));
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
					Planner.Animation.hide(Planner.getPath('loginPage.loginPane.createAccountBin'));

					// Back and Forth shake 
					Planner.Animation.shake(Planner.getPath('loginPage.loginPane.loginBin'));

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
	  			Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.submit'), 500);
	  			Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.loginBin.error'), 500);
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
	  			Planner.Animation.show(Planner.getPath('loginPage.loginPane.createAccountBin'));
	  			Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.error'));
	  			Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.loginBin.submit'));
	  			Planner.Animation.css([Planner.getPath('loginPage.loginPane.loginBin.username'),
	  														Planner.getPath('loginPage.loginPane.loginBin.password')],
	  														'border-color', 'maroon');
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
	  			Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.submit'), 500)
					Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.loginBin.status'), 500)
	  			// Re-enable all the text fields 
	  			Planner.Utility.enableFields('login');
				},
				exitState: function(){
					// Fade out status, reshow login 'submit' button
					Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.status'), 500)
					Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.loginBin.submit'), 500)
				}
			}),
			// LOGIN LOADING NOT CURRENTLY IMPLEMENTED
	  	LOGIN_LOADING: SC.State.design({
				enterState: function(){
					// Fade out the login button, and fade in the spinner.
					Planner.Animation.fadeToggle([Planner.getPath('loginPage.loginPane.loginBin.submit'),
															Planner.getPath('loginPage.loginPane.loginBin.spinner')], 500);
				},
				exitState: function(){
					// Fade out the spinner, we don't fade back in the sumbit button because we know
					// that if the user is still viewing the page, they recieved an error.
					Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.spinner'), 500);
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
	  			Planner.Animation.slideToggle([Planner.getPath('loginPage.loginPane.createAccountButton'),
	  																		 Planner.getPath('loginPage.loginPane.forgotAccountButton')], 1000)
	  			$(Planner.Utility.id(Planner.getPath('loginPage.loginPane.forgotAccountBin'))).animate({translateY: '+=45'}, 1000);
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
	  			Planner.Animation.slideToggle([Planner.getPath('loginPage.loginPane.createAccountButton'),
	  																		Planner.getPath('loginPage.loginPane.forgotAccountButton')], 1000)
	  			$(Planner.Utility.id(Planner.getPath('loginPage.loginPane.forgotAccountBin'))).animate({translateY: '-=45'}, 1000);
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
	  			switch(num){
	  				case 1: view = Planner.getPath('loginPage.loginPane.createAccountBin.firstname'); break;
	  				case 2: view = Planner.getPath('loginPage.loginPane.createAccountBin.lastname'); break;
	  				case 3: view = Planner.getPath('loginPage.loginPane.createAccountBin.email'); break;
	  				case 4: view = Planner.getPath('loginPage.loginPane.createAccountBin.username'); break;
	  				case 5: view = Planner.getPath('loginPage.loginPane.createAccountBin.password'); break;
	  				case 6: view = Planner.getPath('loginPage.loginPane.createAccountBin.passwordConfirmation'); break;
	  			}
	  			Planner.Animation.css(view, 'border-color', 'red');

	  			// Set the value of the Error Bin to the error recieved, inside of runloop to force a controller update
	  			SC.RunLoop.begin();
	  			Planner.currentUser.set('accountCreationError', error);
	  			SC.RunLoop.end()
	  			// Transitions, making use of jQuery
	  			Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.createAccountBin.submit'), 500);
	  			Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.createAccountBin.error'), 500);
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
					Planner.Animation.fadeToggle([Planner.getPath('loginPage.loginPane.createAccountBin.submit'),
																				Planner.getPath('loginPage.loginPane.createAccountBin.spinner')], 500);
				},
				exitState: function(){
					Planner.Animation.fadeToggle(Planner.getPath('loginPage.loginPane.createAccountBin.spinner'), 500)
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
		  		Planner.Animation.fadeToggle(Planner.getPath('loginPage.loginPane.createAccountBin.submit'), 500);
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
Planner.Theme = SC.AceTheme.create({
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
        value: '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/banner.png',
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
        value: '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/ajax-loader.gif',
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
        value: '/static/planner/en/3af0dcdcccc3f7a13687e0c59833e0807362eda2/source/resources/img/ajax-loader.gif',
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
    childViews: ['date', 'bookmark', 'util', 'sideHeader', 'sideView', 'mainView', 'calendar', 'navBar', 'feedback'],
    date: SC.LabelView.design({
      classNames: ['date'],
      layout: {width: 260, height: 40, top: 4, left: 16, zIndex: 1},
      tagName: "h1", 
      value: date.toFormattedString('%A, %B %D') + getSup(date.get('day'))
    }),

    sideHeader: Planner.Wrapper.design({
      layout: {width: .25, height:.2, top: .07, right: .017},
      childViews: ['loginTitle', 'rule'],
      loginTitle: SC.LabelView.design({
        classNames: ['sideHeader'],
        textAlign: SC.ALIGN_CENTER,
        value: 'Classes'
      }),
      rule: SC.LabelView.design({
        classNames: ['sideRule'],
        textAlign: SC.ALIGN_CENTER,
        layout: {width: .9,left:.05},
        value: '____________________________________'
      }),
    }),
    sideView: SC.View.design({
      layout: {width: .25, height: .45, right: .017, top: .12, zIndex: 0},
      classNames: ['sideView'],
      childViews: ['courses', 'eventList'],
      courses: Planner.Wrapper.create({
        courseViews: [],
        coursesBinding: SC.Binding.from('Planner.Courses.content'),
        numCourses: function(){return this.get('courses').get('length')}.property('courses'),
        render: function(){
          arguments.callee.base.apply(this,arguments);
          this.updateCourses();
        },
        updateCourses: function(){
          this.get('courseViews').forEach(function(view){view.destroy();});
          for(var i = 0; i < this.get('numCourses'); i++){
            courseView = Planner.CourseView.create({course:this.get('courses').objectAt(i), numCourses: this.get('numCourses'), num: i});
            this.appendChild(courseView);
            this.get('courseViews').push(courseView);
          }
        }.observes('courses')
      }),
      eventList: Planner.EventList.create({
        classNames: 'event-list',
        eventsBinding: SC.Binding.from('Planner.EventListController.events'),
        eventLeftOffset: .025,
        eventTopOffset: .02,
        eventHeight: .07,
        eventWidth: .97,
        eventSpacing: .01,
      }),
    }),
   
    mainView: SC.View.design({
      classNames: ['mainView'],
      layout: {width: .7, height: .92, left: .015, top:.065},
      childViews: ['DayView', 'WeekView'],
    
      DayView: Planner.DayView.design({}),
      WeekView: Planner.WeekView.design({
      }),

    }),

    calendar: Planner.CalendarView.create({
      classNames: ['calendar'],
      layout: {width: .21, height: .32, right:.036, top: .66}
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
    }),

    feedback: Planner.BrownButton.create({
      mouseUp: function(){alert('yea, it works..')},
      layout: {width: .21, top: .58, height: .036, right:.036 },
      title: 'Give us Feedback'
    }),

    navBar: Planner.Wrapper.design({
      classNames: ['nav-bar'],
      childViews: ['leftArrow', 'left', 'center', 'right', 'rightArrow'],
      layout: {width: .19, height: .04, top: .01, left: .4},
      leftArrow: Planner.BrownButton.design({
        classNames: ['left-arrow'],
        layout: {width: .104, left: 0},
        title: '<',
        action: 'prev'
      }),
      left: Planner.BrownButton.design({
        classNames: ['left'],
        layout: {width: .263, left: .104},
        title: 'Day',
        action: 'gotoDay',
      }),
      center: Planner.BrownButton.design({
        classNames: ['center'],
        layout: {width: .263, left: .367},
        title: 'Week',
        action: 'gotoWeek'
      }),
      right: Planner.BrownButton.design({
        classNames: ['right'],
        layout: {width: .263, left: .630},
        title: 'Month',
        action: 'gotoMonth'
      }),
      rightArrow: Planner.BrownButton.design({
        classNames: ['right-arrow'],
        layout: {width: .104, left: .893},
        title: '>',
        action: 'next'
      }),

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
