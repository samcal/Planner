sc_require('utility');
sc_require('animation');

Planner.ScrollerView = SC.ScrollerView.extend({
  hasButtons: NO,
  scrollbarThickness: 10,
  buttonLength: 18,
  buttonOverlap: 14,
  capLength: 18,
  capOverlap: 14,
  layout: {right: 3},
  classNames: ['planner-scroller-view'],
});

Planner.ScrollView = SC.ScrollView.extend({
  didScroll: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Animation.fadeOut(this.get('verticalScrollerView'), 500);
  },
  willScroll: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Animation.show(this.get('verticalScrollerView'));
  },
  hasHorizontalScroller: NO,
  //verticalOverlay: YES,
  verticalScrollerView: Planner.ScrollerView,
});

Planner.CheckImage = SC.ImageView.extend({
  left: .02,
  height: function(){
    return .8 * this.get('eventHeight')
  }.property('eventHeight'),
  top: function(){
    return (this.get('eventHeight') - this.get('height'))/2;
  }.property('currentHeight'),
  eventHeight: function(){
    return this.get('parentView').get('height');
  }.property(),
  classNames: ['pointer'],
  useCanvas: NO,
  render: function(){
    arguments.callee.base.apply(this,arguments); 
    this.build();
  },
  build: function(){
    this.adjust({
      height: this.get('height'),
      // These should be the same, its a square.
      width: this.get('height'),
      left: this.get('left'),
      top: this.get('top'),
    });
    if(this.get('parentView').get('content').get('isComplete')) this.set('value', '/static/planner/en/current/source/resources/img/check.png?1334120252');
    else this.set('value', '/static/planner/en/current/source/resources/img/uncheck.png?1334120529');
  }.observes('eventHeight'),
  mouseDown: function(){
    this.toggleCompletion();
  },
  toggleCompletion: function(){
    isComplete = this.get('parentView').get('content').get('isComplete');
    this.get('parentView').get('content').set('isComplete', !isComplete);
    if(isComplete) this.set('value', '/static/planner/en/current/source/resources/img/uncheck.png?1334120529');
    if(!isComplete) this.set('value', '/static/planner/en/current/source/resources/img/check.png?1334120252');
  }
});

Planner.EventView = Planner.Wrapper.extend({
	// content: null,
	// index: -1,
	// superOrder: -1,
  classNames: ['event-wrapper'],
  spacing: function(){
    return this.get('parentView').get('eventSpacing');
  }.property(),
  left: function(){
    return this.get('parentView').get('eventLeftOffset');
  }.property(), 
  top: function(){
    return this.get('parentView').get('eventTopOffset')*this.get('listHeight') + this.get('height')*this.get('index') + this.get('index')*this.get('spacing')*this.get('listHeight');
  }.property(),
  height: function(){
    return this.get('parentView').get('eventHeight') * this.get('listHeight');
  }.property(),
  width: function(){
    return this.get('parentView').get('eventWidth');
  }.property(),
  checkWidth: function(){
    return this.get('parentView').get('eventCheckWidth');
  }.property(),
  type: function(){
    return Planner.Utility.type(this.get('content'));
  }.property('content'),
  listHeight: function(){
    return this.get('parentView').get('currentHeight');
  }.property(),
  requiredProperties: 'content index superOrder left top height width type'.w(),
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.createChildren();
    Planner.Utility.required(this);
    Planner.Animation.hide(this);
    this.updateClass();
    this.updatePosition();
    Planner.Animation.fadeIn(this, 700);
  },
  updatePosition: function(){
    this.adjust({
   		width: this.get('width'),
  		height: this.get('height'),
  		left: this.get('left'),
    	top: this.get('top')
 		});
  }.observes('index'),
  updateClass: function() {
    this.get('classNames').push(this.get('type'));
  }.observes('type'),
  createChildren: function(){
    if(this.get('type') == 'assignment') this.appendChild(Planner.CheckImage.create({}));
    title = SC.LabelView.create({
	    layout: {width: .9, height: .9, left: .1, top:.07},
	    value: function(){
	      return this.get('parentView').get('content').get('name');
	    }.property(),
	  });
	  this.appendChild(title);
  }.observes('content'),  
});


Planner.EventListContent = Planner.Wrapper.extend({
	// eventsCreated: null, // type event objects
	// eventViews: null, //type views objects
	eventOrder: ['test', 'note', 'assignment', 'tasks'],
	events: function(){
    return this.get('parentView').get('parentView').get('events');
  }.property(),
	numEvents: function(){
    return this.get('events').get('length');
  }.property('events'),
	eventLeftOffset: function(){
    return this.get('parentView').get('parentView').get('eventLeftOffset');
  }.property(), 
  eventTopOffset: function(){
    return this.get('parentView').get('parentView').get('eventTopOffset');
  }.property(),
  eventHeight: function(){
    return this.get('parentView').get('parentView').get('eventHeight');
  }.property(),
  eventWidth: function(){
    return this.get('parentView').get('parentView').get('eventWidth');
  }.property(),
  eventCheckWidth: function(){
    return this.get('parentView').get('parentView').get('eventCheckWidth');
  }.property(),
  eventSpacing: function(){
    return this.get('parentView').get('parentView').get('eventSpacing');
  }.property(),
  currentHeight: function(){
    h = $(Planner.Utility.id(this)).css('height');
    if(h) return h.slice(0,-2);
  }.property(),
  requiredProperties: 'eventsCreated eventViews eventOrder events numEvents eventLeftOffset eventTopOffset eventHeight eventWidth currentHeight'.w(),
	/*
		update(): observes events and behaves as follows.
			- Destroy all the current views
			- Decide if the event exists, if not, go about creating it
			- Loop over already created event views and find where the
				event in question fits into the list
			- If we didn't find a fit, check if the we have created any eventViews,
				if so, set the index of the view in question to the length of our 
				current eventViews. In essence, setting it to 1 + the last view's index
			- If we found an adjust point, loop over all events after that adjustPoint
				and increment their indices by one
			- Finally create the new view for the event and append it to the bin
			- Add the event to the eventsCreated array for future reference
			- Insert the view object at the *correct* index in the eventViews array.
			- Update the height of the content view to activate a scrollbar if needed.
				- Get pixel height, slice it, scale it, set it.
	*/
	update: function() {
    for(var i = 0; i < this.get('numEvents'); i++){
    	e = this.get('events').objectAt(i);
    	created = this.get('eventsCreated').contains(e);
      if(!created){
        superOrder = this.get('eventOrder').indexOf(Planner.Utility.type(e));
        index = 0;
        adjustPoint = -1;
        for(var l = 0; l < this.get('eventViews').get('length'); l++){
        	comparison = this.get('eventViews').objectAt(l).get('superOrder');
          nextComparison = this.get('eventViews').objectAt(l+1);
          if(superOrder < comparison){
            index = l;
            adjustPoint = l;
            break;
          }
          if(nextComparison != undefined && superOrder == comparison && superOrder !== nextComparison.get('superOrder')){
            index = l;
            adjustPoint = l;
            break;
          }
         }
        if(adjustPoint == -1) if(this.get('eventViews').get('length') > 0) index = this.get('eventViews').get('length');
        if(adjustPoint >= 0) for(var a = adjustPoint; a < this.get('eventViews').get('length'); a++) this.get('eventViews').objectAt(a).set('index', a+1);
        view = Planner.EventView.create({content: e, index: index, superOrder: superOrder, parentView: this })
        this.appendChild(view);
        this.get('eventsCreated').push(e);
        this.get('eventViews').insertAt(index, view);
     	} 
    }
    this.adjust({
    	height: this.get('eventTopOffset')*this.get('currentHeight')*2 + this.get('numEvents')*((this.get('currentHeight')*this.get('eventHeight'))+(this.get('currentHeight')*this.get('eventSpacing')))
    });
   return YES;
  }.observes('events', 'numEvents', 'currentHeight')
});


Planner.EventList = Planner.ScrollView.extend({
  // DEFINE THESE WHEN EXTENDING
  layout: {width: .98},
  requiredProperties: 'events eventLeftOffset eventTopOffset eventHeight eventWidth eventCheckWidth'.w(),
  init: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Utility.required(this);
  },
	retrieve: function(){
		SC.warn('You did not define the retrieve function to work with your current event list, or you just created a plain event list')
	},
  //verticalScrollerLayout: {right: 3},
	classNames: ['event-list'],
  contentView: Planner.EventListContent.design({
    eventsCreated: [],
    eventViews: [],
  })
});



Planner.WeekCell = Planner.EventList.extend({
	// Expected	
	// dayNum: null,
	// periodNum: null,
	// controller: null,
	// events: null,
	// eventsCreated: null,
	// eventViews: null,
	// FINALS
	eventLeftOffset: .025,
  eventTopOffset: .05,
  eventHeight: .17,
  eventWidth: .95,
  eventSpacing: .01,

  classNames: ['week-cell'],
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.build();
  },
  // Week Cell Custom Build Code
  build: function(){
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
    var left = this.get('dayNum') == this.retrieve('numDays')-1;
    var bottom = this.get('periodNum') == this.retrieve('courses').get('length');
    if(bottom && !left) this.get('classNames').push('top-left-bottom');
    else if(left && !bottom) this.get('classNames').push('top-left-right');
    else if(!bottom && !left) this.get('classNames').push('top-left');
  },
  retrieve: function(property){return Planner.WeekController.get(property);},
});

; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');