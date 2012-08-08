



// Standard Objects necessary throughout the site
date = SC.DateTime.create();

// Custom Functions specfic to views management, eventually these should all be contained in a state file.
function getSup(day){if(day > 10 && day < 20) return "th";var temp = day%10; if(temp == 1) return "st"; else if(temp == 2) return "nd"; else if(temp == 3) return "rd"; else return "th";}


// Custome Views
Planner.BrownButton = SC.ButtonView.extend({
  classNames: ['brownButton'],
  textAlign: SC.ALIGN_CENTER,
}),

Planner.Wrapper = SC.View.extend({
  backgroundColor: 'transparent'
}),

Planner.LoginView = SC.View.extend({
  layout: {width: 325, height: 300, centerX: 0, centerY: 0, zIndex:100},
  render: function(){
  	arguments.callee.base.apply(this,arguments);
  	this.animate({opacity:0}, 0);
  	this.animate({opacity:1}, 10);
  }
}),

Planner.LoginHeader = SC.LabelView.extend({
  classNames: ['loginHeader'],
  textAlign: SC.ALIGN_CENTER,
  layout: {width: 200, height: 30, centerX: 0, centerY: -170},

}),

Planner.LoginRule = SC.LabelView.extend({
  
})

// Calendar
var current_date = new Date();
var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Calendar(month, year) {
	this.month = (isNaN(month) || month == null) ? current_date.getMonth() : month;
	this.year = (isNaN(year) || year == null) ? current_date.getFullYear() : year;
	this.html = this.make();
}

Calendar.prototype.make = function() {
	var monthLength = (new Date(this.year, this.month+1, 0)).getDate();

	var first = new Date(this.year, this.month, 1);

	html = '<table class="calendar">';
	html += '<tr><th onclick="div.innerHTML = cal.left().html" id="cal-scrollL"><</th><th colspan="5">' + months[this.month] + ' '  + this.year + '</th><th onclick="div.innerHTML = cal.right().html" id="cal-scrollR">></th></tr><tr>';
	for (var i = 0; i <= 6; i++) {
		html += '<td class="calDayHead">' + days[i] + '</td>';
	}
	html += '</tr><tr>'

	var day = 1;
	for (var i = 0; i <= 6; i++) {
		for (var j = 0; j <= 6; j++) {
			if (day <= monthLength && (i > 0 || j >= first.getDay())) {
				html += '<td class="calDay" onclick="loadPlanner(\'/planner/day/' + this.year + '/' + (this.month+1) + '/' + day + '\')" ';
				if (this.year == current_date.getFullYear() && this.month == current_date.getMonth() && day == current_date.getDate())
					html += 'style="color:#ededed;"';
				html += '>'
				html += day;
				day++;
				html += '</td>'
			} else {
				html += '<td></td>'
			}
		}

		if (day > monthLength) {
			break;
		} else {
			html += '</tr><tr>'
		}
	}
	html += '</tr></table>'

	return html;
};

Calendar.prototype.right = function() {
	if (this.month == 11) {
		this.year++;
		this.month = 0;
	} else {
		this.month++;
	}

	this.html = this.make();
	return this;
};

Calendar.prototype.left = function() {
	if (this.month == 0) {
		this.year--;
		this.month = 11;
	} else {
		this.month--;
	}

	this.html = this.make();
	return this;
};

function makeCal(){
	var cal = new Calendar();
	return cal.html
}; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');