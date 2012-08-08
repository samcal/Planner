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