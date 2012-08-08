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