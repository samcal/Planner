Planner.DayController = SC.Object.create({

	prev: function(){
		this.get('daynum')--;
	},

	next: function(){
		this.get('daynum')++;
	},

	daynum: 0,

  today: SC.DateTime.create(),

	leftDate: function(){
		return this.get('today').adjust({day: this.get('today').get('day')+this.get('daynum')+1});
	}.property('daynum'),

	rightDate: function(){
		return this.get('today').adjust({day: this.get('today').get('day')+this.get('daynum')+1});
	}.property('daynum'),

	leftEvents: function(){	
		events = [];
		for(var i = 0; i < Planner.Courses.get('length'); i++)
			events.push(Planner.Utility.filterByDate(Planner.Courses.objectAt(i).get('events'), this.get('leftDate')));
		return events;
		//return Planner.store.find(Planner.Event).findProperty('date', this.get('leftDate'));
	}.property('leftDate'),

	rightEvents: function(){
		events = [];
		for(var i = 0; i < Planner.Courses.get('length'); i++)
			events.push(Planner.Utility.filterByDate(Planner.Courses.objectAt(i).get('events'), this.get('rightDate')));
		return events;
		//return Planner.store.find(Planner.Event).findProperty('date', this.get('rightDate'));
	}.property('rightDate'),

}); if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');