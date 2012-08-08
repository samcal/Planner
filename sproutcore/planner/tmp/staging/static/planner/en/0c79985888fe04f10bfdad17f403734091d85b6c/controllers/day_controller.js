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

})