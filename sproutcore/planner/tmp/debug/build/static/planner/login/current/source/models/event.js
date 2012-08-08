sc_require('core');

Planner.Event = SC.Record.extend({
	name: SC.Record.attr(String),
	date: SC.Record.attr(SC.DateTime),
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
	dateAssigned: SC.Record.attr(SC.DateTime),
	dateDue: SC.Record.attr(SC.DateTime),
	course: SC.Record.toOne("Planner.Course", {
		inverse: "assignments",
		isMaster: NO,
	}),
});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');