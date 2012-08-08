sc_require('core');

Planner.User = SC.Record.extend({
	firstName: SC.Record.attr(String),
	lastName: SC.Record.attr(String),
	fullName: function() {return "%@ %@".fmt(this.get('firstName'), this.get('lastName'));}.property(),
	courses: SC.Record.toMany("Planner.Course"),
	loginGreeting: function() {return "Hi, %@".fmt(this.get('firstName'));}.property()
});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');