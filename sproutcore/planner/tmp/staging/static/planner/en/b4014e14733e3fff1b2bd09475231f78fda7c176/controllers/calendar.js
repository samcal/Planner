sc_require('core');

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

Planner.Calendar = SC.Object.create({
	// Set the initial calendar values
	init: function() {
		arguments.callee.base.apply(this,arguments);
		this.set('monthnum', (new Date()).getMonth());
		this.set('yearnum', (new Date()).getFullYear());
		this.updateValues();
	},

	// Month index and year fields
	monthnum: 0,
	yearnum: 0,

	// Returns the name of the month, as defined above
	monthName: function(){return months[this.get('monthnum')]}.property(),

	// 2d array of date integers
	dayValues: [],

	// Updates the dayValues array, according to the month and year
	updateValues: function() {
		var today = new Date(this.get('yearnum'), this.get('monthnum'));
		while (today.getDay() > 0) {
			today.setDate(today.getDate() - 1);
		}

		var days = [];

		for (var i = 0; i < 5; i++) {
			var week = []
			for (var j = 0; j < 7; j++) {
				week[j] = today.getDate();
				today.setDate(today.getDate() + 1);
			}
			days[i] = week;
		}

		this.set('dayValues', days);
	}.observes('monthnum'),

	// Advances one month
	nextMonth: function() {
		var newFirst = new Date(this.get('yearnum'), this.get('monthnum')+1);
		this.set('yearnum', newFirst.getFullYear());
		this.set('monthnum', newFirst.getMonth());
	},

	// Regresses one month
	prevMonth: function() {
		var newFirst = new Date(this.get('yearnum'), this.get('monthnum')-1);
		this.set('yearnum', newFirst.getFullYear());
		this.set('monthnum', newFirst.getMonth());
	},

	retrieve: function(x,y){
		return this.get('dayValues')[x][y];
	}.property('dayValues'),

	month: function(){
		return months[this.get('monthnum')]
	}.property('monthnum'),

	numRows:5,
	numCols:5,
	topOffset: .1,
	colWidth: function(){1/this.get('numCols')}.property('numCols'),
	rowHeight: function(){(1-this.get('topOffset'))/this.get('numRows');}.property('topOffset', 'numRows'),

	create: function(){
		for(var r = 0; r < this.get('numRows'); r++){
			for(var c = 0; c < this.get('numCols'); c++){
				dateCell = Planner.DateCell.create({rowNum: r, dayNum: c});
				Planner.getPath('plannerPage.plannerPane.calendar').appendChild(dateCell);

			}
		}
	}
});