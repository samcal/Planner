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
});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');