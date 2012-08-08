sc_require('resources/views');
sc_require('utility');
sc_require('resources/frameworks.js');


Planner.DayCellTitle = Planner.Wrapper.extend({
	classNames: ['day-cell-title'],
	courseName: function(){return this.get('parentView').get('course').get('name')}.property(),
	click: function(){Planner.statechart.invokeStateMethod('showAssignments', this.get('parentView').get('course'));},
	childViews: ['label', 'rule'],
	label: SC.LabelView.create({
		value: function(){return this.get('parentView').get('course').get('name')}.property(),
	}),
	rule: SC.LabelView.design({
    classNames: ['sideRule'],
    textAlign: SC.ALIGN_CENTER,
    layout: {width: .9,left:.05},
    value: '____________________________________'
	}),
});

Planner.DayCell = Planner.Wrapper.extend({
  layout: {width: .9, left: .05},
  course: function(){
  	return this.get('events').objectAt(i).firstObject().get('course');
  }.property(),
	courseName: function(){
		return this.get('course').get('name');
	}.property('course'),
	childView: ['title', 'eventList'],
	title: Planner.DayCellTitle.create({}),
	eventList: Planner.EventList.create({
		eventLeftOffset: .015,
	  eventTopOffset: .02,
	  eventHeight: .07,
	  eventWidth: .97,
	  eventSpacing: .01,
	  eventCheckWidth: .05,
	}),
	init: function(){
		arguments.callee.base.apply(this,arguments);
		this.updateEvents();
		Planner.Animation.hide(this);Planner.Animation.fadeIn(this);
	},
	updateEvents: function(){
		SC.info('here??');
		this.get('eventList').set('events', this.get('events'))
	}.observes('events'),
});

Planner.IndividualDayView = Planner.Wrapper.extend({
	build: function(){
		this.get('dayCells').forEach(function(view){
			Planner.Animation.fadeOut(view);
			view.destroy();
		});
		for(var i = 0; i < this.get('events').get('length'); i++){
			if(Planner.isDefined(this.get('events').objectAt(i))) {
				view = Planner.DayCell.create({events: this.get('events').objectAt(i)});
				this.appendChild(view);
				this.get('dayCells').push(view);
			}
		}
	}.observes('events'),
});

Planner.DayView = Planner.Wrapper.extend({
  classNames: ['day-view'],
  childViews: ['left', 'right'],
  left: Planner.IndividualDayView.create({
  	dayCells: [],
  	layout: {width: .5},
		eventsBinding: SC.Binding.from('Planner.DayController.leftEvents'),
  }),
  right: Planner.IndividualDayView.create({
  	dayCells: [],
  	layout: {width: .5, left: .5},
		eventsBinding: SC.Binding.from('Planner.DayController.rightEvents'),
  }),
});
