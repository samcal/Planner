// Standard Objects necessary throughout the site
date = SC.DateTime.create();

// Custom Functions specfic to views management, eventually these should all be contained in a state file.
function getSup(day){if(day > 10 && day < 20) return "th";var temp = day%10; if(temp == 1) return "st"; else if(temp == 2) return "nd"; else if(temp == 3) return "rd"; else return "th";}


// Custom Views
Planner.BrownButton = SC.ButtonView.extend({
  classNames: ['brownButton'],
  textAlign: SC.ALIGN_CENTER,
}),

Planner.UtilItem = SC.ButtonView.extend({
	classNames: ['utilItem'],
	textAlign: SC.ALIGN_CENTER,
}),

Planner.Wrapper = SC.View.extend({
  backgroundColor: 'transparent'
}),

Planner.LoginView = SC.View.extend({
	// Keep width an even number!
  layout: {width: 326, height: 300, centerX: 0, centerY: 0, zIndex:100},
}),

Planner.LoginHeader = SC.LabelView.extend({
  //classNames: ['loginHeader'],
  textAlign: SC.ALIGN_CENTER,
  layout: {width: 200, height: 30, centerX: 0, centerY: -170},
}),

Planner.LoginError = SC.LabelView.extend({
	classNames: ['loginError'],
	textAlign: SC.ALIGN_CENTER,
}),

Planner.LoginStatus = SC.LabelView.extend({
	classNames: ['loginStatus'],
	textAlign: SC.ALIGN_CENTER
}),

Planner.LoginTextField = SC.TextFieldView.extend({
	classNames: ['login-text-field'],
  spellCheckEnabled: NO,
  shouldRenderBorder: NO,
  // Capture the focus event, we use this to hide the error message
  fieldDidFocus: function(evt){
  	// If we are currently enabled, then send event
  	if(this.get('isEditable') == YES){
    	Planner.statechart.sendEvent('fieldFocused');
  	}
  },
  keyDown: function(evt){
  	arguments.callee.base.apply(this,arguments);
  	// If enter key, submit info
  	if(evt.keyCode === 13){
    	Planner.statechart.sendEvent('checkInfo');
  	}else{
  		// if enabled, send focus event
  		if(this.get('isEditable') === YES){
  			Planner.statechart.sendEvent('fieldFocused');
  		}
  	}
  }

}),



Planner.DateCell = SC.ButtonView.extend({
  classNames: ['date-cell'],
  textAlign: SC.ALIGN_CENTER,  
  retrieve: function(property){
    return Planner.Calendar.get(property);
  },
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.set('title', Planner.Calendar.retrieve(this.get('rowNum'), this.get('dayNum')));
    this.adjust({
      width: this.retrieve('colWidth'),
      height: this.retrieve('rowHeight'),
      top: this.retrieve('topOffset') + this.get('rowNum')*this.retrieve('rowHeight'),
      left: this.get('dayNum')*this.retrieve('colWidth'),
    });
  }
});

Planner.CalendarView = SC.View.extend({
  childViews: [
    'backArrow', 'monthName', 'nextArrow',
  ],
  backArrow: Planner.BrownButton.design({
    textAlign: SC.ALIGN_CENTER,
    title: '<',
    mouseUp: function(){alert('back');Planner.Calendar.prevMonth();},
    layout: {width: .2, height: Planner.Calendar.get('topOffset')}
  }),
  monthName: SC.LabelView.design({
    textAlign: SC.ALIGN_CENTER,
    valueBinding: 'Planner.Calendar.monthName',
    layout: {width: .5, height: Planner.Calendar.get('topOffset'), centerX: .000000001},
    init: function(){
      arguments.callee.base.apply(this,arguments);
      $('#'+this.get('layerId')).css('font-size', (((Planner.Calendar.get('topOffset'))*450)+100) + '%')
    },
  }),
  nextArrow: Planner.BrownButton.design({
    textAlign: SC.ALIGN_CENTER,
    title: '>',
    mouseUp: function(){Planner.Calendar.nextMonth();},
    layout: {width: .2, height: Planner.Calendar.get('topOffset'), right: 10}
  }),

  datesBinding: 'Planner.Calendar.dayValues',

  build: function() {
    for(var r = 0; r < this.get('dates').get('length'); r++){
      for(var c = 0; c < this.get('dates').objectAt(0).get('length'); c++){
        dateCell = Planner.DateCell.create({rowNum: r, dayNum: c});
        Planner.getPath('plannerPage.plannerPane.calendar').appendChild(dateCell);
      }
    }
  }.observes('dates')
});



Planner.CourseNumTab = SC.LabelView.extend({
  layout: {width: .125, left: 0},
  classNames: ['course-num-tab'],
  render: function(){
    arguments.callee.base.apply(this,arguments);
    // var x = $('#'+this.get('layerId')).css('height');
    // var textHeight = x.substring(0, x.length-2);
    // textHeight = textHeight-(textHeight *.2);
    // textHeight = textHeight + 'px'
    // $('#'+this.get('layerId')).css('font-size', textHeight);
  },
  value: function(){
    return this.get('parentView').get('course').get('period')
  }.property(),
});

Planner.CourseView = SC.View.extend({
  layout: {width: .96, centerX: .0000000001},
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.adjust({
      height: (.90/ this.get('numCourses')),
      top: .025 + (.90/ this.get('numCourses'))*(this.get('num')) + (.01)*this.get('num')
    })
  },
  childViews: ['numTab', 'descBin'],
  
  numTab: Planner.CourseNumTab.design({}),
  descBin: SC.View.design({
    layout:{width:.86, left: .13},
    classNames: ['course-desc-view'],
    childViews: ['courseName', 'teacherName'],
    courseName: SC.LabelView.design({
      classNames: ['course-name'],
      layout: {left: .05, top: .15},
      value: function(){
        return this.get('parentView').get('parentView').get('course').get('name');
      }.property()
    }),
    teacherName: SC.LabelView.design({
      classNames: ['teacher-name'],
      layout: {left:.15, top: .6},
       value: function(){
        return 'with ' + this.get('parentView').get('parentView').get('course').get('teacher');
      }.property()
    })
  })
});
