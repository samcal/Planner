sc_require('core');

Planner.Calendar = SC.Object.create({
	// Set the initial calendar values
	init: function() {
		sc_super();
		this.set('monthnum', (new Date()).getMonth());
		this.set('yearnum', (new Date()).getFullYear());
		this.updateValues();
	},

	// Month (0-indexed) and year fields
	monthnum: 0,
	yearnum: 0,

	// Returns the name of the month and year, in the form "June 2011"
	monthName: function(){return SC.DateTime.monthNames[this.get('monthnum')] + ' ' + this.get('yearnum')}.property(),

	// 2d array of date integers
	dayValues: [],

	// Updates the dayValues array, according to the month and year
	updateValues: function() {
		var today = new Date(this.get('yearnum'), this.get('monthnum'));
		if(today.getDay() == 0 || today.getDay() == 6) {
			while(today.getDay() != 1) {
				today.setDate(today.getDate() + 1);
			}
		} else {
			while (today.getDay() != 1) {
				today.setDate(today.getDate() - 1);
			}
		}

		var days = [];

		for (var i = 0; i < 6; i++) {
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
		return SC.DateTime.monthNames[this.get('monthnum')]
	}.property('monthnum'),
	numCols: function(){return this.get('dayValues')[0].length}.property('dayValues'),
	numRows: function(){return this.get('dayValues').length;}.property('dayValues'),
	topOffset: .25,
	colWidth: function(){return 1/this.get('numCols')}.property('numCols'),
	rowHeight: function(){return (1-this.get('topOffset'))/this.get('numRows');}.property('topOffset', 'numRows'),
});