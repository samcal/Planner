sc_require('core');

Planner.MonthController = SC.Object.create({
	monthBinding: 'Planner.Calendar.monthnum',
	yearBinding: 'Planner.Calendar.yearnum'
})