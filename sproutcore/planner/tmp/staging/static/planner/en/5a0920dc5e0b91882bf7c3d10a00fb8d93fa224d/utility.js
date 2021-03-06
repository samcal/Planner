Planner.Utility = SC.Object.create({
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
	getType: function(item){
		if(SC.kindOf(item, Planner.Assignment)) return 'assignment'
    if(SC.kindOf(item, Planner.Test)) return 'test'
    if(SC.kindOf(item, Planner.Note)) return 'note'
    if(SC.kindOf(item, Planner.Task)) return 'task'
	},
	// Takes the SproutCore object and returns a DOM Id, Used for animations.
	// id: function(item){
	// 	return '#' + item.get('layerId');
	// },
	// Simple (redundant) email validity check
	isEmail: function(value){
		return value.match(/.+@.+\..+/);
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