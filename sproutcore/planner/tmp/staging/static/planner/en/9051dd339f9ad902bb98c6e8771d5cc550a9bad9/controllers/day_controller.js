Planner.DayController = SC.Object.extend({

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
		return Planner.store.find(Planner.Event).findProperty('date', this.get('leftDate'));
	}.property('leftDate'),

	rightEvents: function(){
		return Planner.store.find(Planner.Event).findProperty('date', this.get('rightDate'));
	}.property('rightDate'),
})