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
  defaultTabbingEnabled: NO,
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

Planner.EventView = Planner.Wrapper.extend({
  layout: {width: .95, height: .15, centerX: .00000000001, top: .03},
  classNames: ['event-wrapper'],
  type: '',
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.setType();
  },
  setType: function(){
    if(SC.kindOf(this.get('content'), Planner.Assignment)){
      this.set('type', 'assignment')
    }else if(SC.kindOf(this.get('content'), Planner.Test)){
      this.set('type', 'test')
    }else if(SC.kindOf(this.get('content'), Planner.Note)){
      this.set('type', 'note')
    }else if(SC.kindOf(this.get('content'), Planner.Task)){
      this.set('type', 'task')
    }
    //this.set('classNames', [this.get('type')]);
  },
  childViews: ['icon', 'title'],
  icon: SC.ImageView.design({
    layout: {width: .07, height: .9, centerY:0.0000000001, left: .02},
    useCanvas: NO,
    init: function(){
      arguments.callee.base.apply(this,arguments);
      if(this.get('parentView').get('content').get('isComplete')) {
        this.set('value', '/static/planner/en/371011f6cdc23d2ae6b53163cf98a0fc22aa2eea/source/resources/img/check.png')
      }else{
        this.set('value', '/static/planner/en/371011f6cdc23d2ae6b53163cf98a0fc22aa2eea/source/resources/img/uncheck.png')
      }
    }
  }),
  title: SC.ButtonView.design({
    layout: {},
    title: function(){
      return this.get('parentView').get('content').get('name');
    }.property(),
    render: function(){
      arguments.callee.base.apply(this,arguments);
      $('#'+this.get('layerId')).css('font-size', $('#'+this.get('parentView').get('layerId')).css('height'));
      $('#'+this.get('layerId')).css('line-height', $('#'+this.get('parentView').get('layerId')).css('height'));
      $('#'+this.get('layerId')).css('font-size', '-=5');
    }
  })
}),

Planner.WeekCellView = SC.View.extend({
  classNames: ['week-cell'],
  retrieve: function(property){
    //Just for convenience
    return Planner.WeekController.get(property);
  },
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.adjust({
      height: this.retrieve('height'),
      width: this.retrieve('width'),
      left: this.retrieve('leftOffset') + (this.get('dayNum') * this.retrieve('width')),
    });
    if(Planner.WeekController.get('hasZero')){
      this.adjust({
        top: this.retrieve('topOffset') + (this.get('periodNum') * this.retrieve('height')),
      });
    }else{
      this.adjust({
        top: this.retrieve('topOffset') + ((this.get('periodNum')-1) * this.retrieve('height')),
      });
    }
  },
  controller: function(){
    return Planner.WeekController.getController(this.get('periodNum'), this.get('dayNum'));
  }.property(),
  events:[],
  render: function(){
    arguments.callee.base.apply(this,arguments);
    for(var i = 0; i < this.get('events').get('length'); i++){
      view = Planner.EventView.create({content: this.get('events').objectAt(i)});
      this.appendChild(view);
    }
  },
}),

Planner.PeriodTab = SC.LabelView.extend({
  classNames: ['period-tab'],
  textAlign: SC.ALIGN_CENTER,
  retrieve: function(property){
    //Just for convenience
    return Planner.WeekController.get(property);
  },
  value: function(){return this.get('periodNum')}.property('periodNum'),
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.adjust({
      width: this.retrieve('tabWidth'),
      height: this.retrieve('tabHeight'),
    });
    if(Planner.WeekController.get('hasZero')){
      this.adjust({
        top: this.retrieve('topOffset') + (this.get('periodNum') * this.retrieve('height')),
      });
    }else{
      this.adjust({
        top: this.retrieve('topOffset') + ((this.get('periodNum')-1) * this.retrieve('height')),
      });
    }
  }
}),

Planner.HeaderTab = SC.LabelView.extend({
  classNames: ['header-tab'],
  retrieve: function(property){
    //Just for convenience
    return Planner.WeekController.get(property);
  },
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.adjust({
      width: this.retrieve('width'),
      height: this.retrieve('headerHeight'),
      top: this.retrieve('headerTopSet'),
      left: this.retrieve('leftOffset') + (this.get('dayNum') * this.retrieve('width')),
    });
  }
})

Planner.WeekView = Planner.Wrapper.extend({
  layout: {width: .98, height: .98, centerX: .00000000001, centerY: .00000000001},
});

Planner.DateCell = Planner.BrownButton.extend({
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
    click: function(){Planner.Calendar.prevMonth();},
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
    click: function(){Planner.Calendar.nextMonth();},
    layout: {width: .2, height: Planner.Calendar.get('topOffset')}
  }),
  render: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Calendar.create();
  }
});


Planner.CourseBin = Planner.Wrapper.create({
  courses: function(){
          return Planner.courses
        }.property('Planner.courses'),
        init: function(){
          arguments.callee.base.apply(this,arguments);
        },
        courseViews: [],
        updateCourses: function(){
          for(var i = 0; i < this.get('courses').get('length'); i++){
            course = this.get('courses').objectAt(i);
            alreadyExists = false;
            this.get('courses').forEach( function(item){
              if(item = course){
                alreadyExists = true;
              }
            })
            if(!alreadyExists){
              courseView = Planner.CourseView.create({});
            }
          }
        }.observes('courses')
      });
Planner.CourseView = SC.View.extend({
})