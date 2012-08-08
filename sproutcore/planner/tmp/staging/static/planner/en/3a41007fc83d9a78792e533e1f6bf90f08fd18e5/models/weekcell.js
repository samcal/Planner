sc_require('core')

Planner.WeekCell = SC.Record.extend({
	period: SC.Record.attr(Number),
	date: SC.Record.attr(SC.DateTime),
	events: SC.Record.toMany('Planner.Event', {
		inverse: 'course',
		isMaster: YES
	})
});