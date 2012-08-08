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

	events: function() {
		return this.get('assignments').toArray().concat(this.get('tests').toArray()).concat(this.get('notes').toArray()).concat(this.get('tasks').toArray());
	}.property(),

	sideCourseDisplay: function() {
		return "%@\n\twith %@".fmt(this.get('name'), this.get('teacher'));
	}.property(),
});