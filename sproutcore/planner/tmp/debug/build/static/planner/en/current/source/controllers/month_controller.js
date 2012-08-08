Planner.MonthController = SC.Object.create({

	prev: function(){
		this.get('monthnum')--;
	},

	next: function(){
		this.get('monthnum')++;
	},

	monthnum: 0,

  today: SC.DateTime.create(),

	leftDate: function(){
		return this.get('today').adjust({month: this.get('today').get('month')+this.get('monthnum')});
	}.property('daynum'),


	leftEvents: function(){
		events = [];
		for(var i = 0; i < Planner.Courses.get('length'); i++){
			course = Planner.Courses.objectAt(i);
			events.push(course.get('events').findProperty('date', this.get('leftDate')));
		}
		return events;


		//return Planner.store.find(Planner.Event).findProperty('date', this.get('leftDate'));
	}.property('leftDate'),

	rightEvents: function(){
		return Planner.store.find(Planner.Event).findProperty('date', this.get('rightDate'));
	}.property('rightDate'),

}); if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');