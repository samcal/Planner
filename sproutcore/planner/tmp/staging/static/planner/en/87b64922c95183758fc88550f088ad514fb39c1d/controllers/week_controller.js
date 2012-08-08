sc_require('core');

Planner.WeekCellController = SC.Object.extend({
  init: function() {
    arguments.callee.base.apply(this,arguments);
    this.set('view', Planner.WeekCellView.create({dayNum: this.get('date').get('dayOfWeek')-1, periodNum: this.get('period'), controller: this, events:[], eventsCreated: [], eventViews: []}));

    var courseQ = SC.Query.local(Planner.Course, {
      conditions: 'period = %@',
      parameters: [this.get('period')]
    });
    this.set('course', Planner.store.find(courseQ).firstObject());
    Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(this.get('view'));
    this.updateEvents();
  },
  period: 0,
  date: SC.DateTime.create(),
  view: SC.View.design(),
  course: '',
  events: [],
  updateEvents: function() {
    var allEvents = this.get('course').get('events');
    var todayEvents = [];
    for (var i = 0; i < allEvents.length; i++) {
      if (Planner.Utility.datesAreEqual(allEvents[i].get('date'), this.get('date')))
        todayEvents.push(allEvents[i]);
    }
    this.set('events', todayEvents);
  },
  updateView: function() {
    this.get('view').set('events', this.get('events'))
  }.observes('events'),
});

Planner.WeekController = SC.Object.create({
	topOffset: .08,
	leftOffset:.015,
	numPeriods: function(){
		return this.get('courses').get('length');
	}.property('courses'),
	numDays: 5,
	headerHeight: function(){
		return this.get('topOffset')/2.5;
	}.property('topOffset'),
	headerTopSet: function(){
		return this.get('topOffset')-this.get('headerHeight');
	}.property('topOffset', 'headerHeight'),
	tabHeight: function(){
		return this.get('height')/4.5
	}.property('height'),
	tabWidth: function(){
		return this.get('leftOffset')*.9
	}.property('leftOffset'),
  width: function(){
  	return (1-this.get('leftOffset'))/this.get('numDays')-.0009
  }.property('numDays', 'leftOffset'),
  height: function(){
  	return (1-this.get('topOffset'))/this.get('numPeriods')-.0009
  }.property('numPeriods', 'topOffset'),
  hasZero: function(){
  	return this.get('numPeriods') === 7;
  }.property('numPeriods'),

  weeknum: 0,
  nextWeek: function(){this.set('weeknum', this.get('weeknum')+1)},
  prevWeek: function(){this.set('weeknum', this.get('weeknum')-1)},

  cells: [],
  getController: function(x,y){
    return this.get('cells')[x][y]
  }.property(),

  updateAllCells: function() {
    for (var i = 0; i < this.get('cells').get('length'); i++) {
      for (var j = 0; j < this.get('cells').objectAt(i).get('length'); j++) {
        this.get('cells')[i][j].updateEvents()
      }
    }
  },

  title: '',
  header0: '',
	header1: '',
  header2: '',
  header3: '',
  header4: '',

  coursesBinding: SC.Binding.from('Planner.courses'),

  create: function(){
    var firstDay = SC.DateTime.create();
    firstDay = firstDay.adjust({day:firstDay.get('day')+(this.get('weeknum')*7)});
    if (firstDay.get('dayOfWeek') === 0) {
      firstDay = firstDay.adjust({day:firstDay.get('day')+1})
    } else {
      while (firstDay.get('dayOfWeek') > 1) {
        firstDay = firstDay.adjust({day:firstDay.get('day')-1})
      }
    }

  	title = SC.LabelView.create({textAlign: SC.ALIGN_CENTER, layout: {width: .5, left:.25, height: .2}, classNames: ['title'], valueBinding: "Planner.WeekController.title"}),
  	Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(title);
    var periods = [];
  	for(var c = 0; c < this.get('numPeriods'); c++){
  		periodNumber = Planner.courses.objectAt(c).get('period');
  		periodTab = Planner.PeriodTab.create({periodNum: periodNumber});
  		Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(periodTab);
      var days = []
  		for(var d = 0; d < this.get('numDays'); d++){
  			if(c == 0){
  				bindingString = "Planner.WeekController.header" + d;
  				dayHeader = Planner.HeaderTab.create({dayNum: d, valueBinding: bindingString });
  				Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(dayHeader);
  			}
        controller = Planner.WeekCellController.create({date: firstDay.adjust({day: firstDay.get('day')+d}), period: periodNumber});
        days[d] = controller;
  		}
      periods[c] = days;
  	}
    this.set('cells', periods);
    var first = this.get('cells')[0][0].get('date');
    this.set('title', 'Week of %@/%@'.fmt(first.get('month'), first.get('day')));
    for (var i = 0; i <= 4; i++) {
      var day = first.adjust({day:first.get('day')+i})
      this.set('header'+i, '%@ %@'.fmt(SC.DateTime.dayNames[day.get('dayOfWeek')], day.get('day')));
    }
  }.observes('weeknum'),
});