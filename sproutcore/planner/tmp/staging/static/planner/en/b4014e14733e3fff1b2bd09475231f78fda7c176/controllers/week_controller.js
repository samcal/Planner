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

  title: 'Week of the 1st of June',
  header0: 'Monday, June 1st',
	header1: 'Tuesday| 1',
  header2: 'Wednesday| 1',
  header3: 'Thursday| 1',
  header4: 'Friday| 1',

  coursesBinding: SC.Binding.from('Planner.courses'),

  create: function(){
  	title = SC.LabelView.create({textAlign: SC.ALIGN_CENTER, layout: {width: 500, centerX: 0}, classNames: ['title'], valueBinding: "Planner.WeekController.title"}),
  	Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(title);
  	for(var c = 0; c < this.get('numPeriods'); c++){
  		periodNumber = Planner.courses.objectAt(c).get('period');
  		periodTab = Planner.PeriodTab.create({periodNum: periodNumber});
  		Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(periodTab);
  		for(var d = 0; d < this.get('numDays'); d++){
  			if(c == 0){
  				bindingString = "Planner.WeekController.header" + d;
  				dayHeader = Planner.HeaderTab.create({dayNum: d, valueBinding: bindingString });
  				Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(dayHeader);
  			}
  			weekCell = Planner.WeekCell.create({dayNum: d, periodNum: periodNumber});
  			Planner.getPath('plannerPage.plannerPane.mainView.WeekView').appendChild(weekCell);
  		}
  	}
  }.observes('weeknum'),
});
