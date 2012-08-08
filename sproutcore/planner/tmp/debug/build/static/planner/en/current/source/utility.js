Planner.Utility = SC.Object.create({
	/* Functions (Alphabetical)    - Utility is for Redundant/Advanced Logic Functions
		.array(value)                - Returns the value as an array. Type agnostic...I think
		.datesAreEqual(date, date)   - Compares SC dates less 'precisely', Sproutcore uses milleseconds, we don't.
		.filterByDate(events, date)  - Filters events by their date, earliest to latest.
		.id(view)                    - Takes the SproutCore object and returns a DOM Id, Used for animations.
		.isDefined(value)            - Logic to see if a value exists
		.isEmail(value) 	           - Email Regular Expression
		.required(view)              - Used when initializing custom views to check all required properties.
		.type(item)                  - Takes an event object and returns its type
	*/

	array: function(value){
		if(!(value instanceof Array)) return [value];
		else return value;
	},

	datesAreEqual: function(x, y) {
		if (x != null && y != null)
			return x.get('year') == y.get('year') && x.get('month') == y.get('month') && x.get('day') == y.get('day');
	},

	filterByDate: function(events, date){
		var filteredEvents = [];
    for (var i = 0; i < events.get('length'); i++) {
      if (Planner.Utility.datesAreEqual(events[i].get('date'), date))
        filteredEvents.push(events[i]);
    }
    return filteredEvents;
	},

	id: function(view){
		return '#' + view.get('layerId');
	},

	isDefined: function(value){
		if (SC.none(value)) return false;
		if (! SC.none(value.length)) return value.length > 0;
		return YES;
	},

	isEmail: function(value){
		return value.match(/.+@.+\..+/);
	},

	required: function(view){
    for(var i = 0; i < view.get('requiredProperties').get('length'); i++){
      if(!Planner.Utility.isDefined(view.get(view.get('requiredProperties').objectAt(i)))) SC.error(view.get('requiredProperties').objectAt(i) + ' is not defined!');
    }
  },

	type: function(view){
		if(SC.kindOf(view, Planner.Assignment)) return 'assignment'
    if(SC.kindOf(view, Planner.Test)) return 'test'
    if(SC.kindOf(view, Planner.Note)) return 'note'
    if(SC.kindOf(view, Planner.Task)) return 'task'
	},

	
	// TODO: Fix this bottom shit.
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

}); if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');