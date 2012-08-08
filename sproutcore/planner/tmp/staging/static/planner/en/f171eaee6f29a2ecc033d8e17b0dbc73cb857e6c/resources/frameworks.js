sc_require('utility');
sc_require('animation');

Planner.CheckImage = SC.ImageView.extend({
  layout: {width: .07, height: .8, left: .02, top: .13},
  classNames: ['pointer'],
  useCanvas: NO,
  render: function(){
    arguments.callee.base.apply(this,arguments);     
    if(this.get('parentView').get('content').get('isComplete')) {
      this.set('value', '/static/planner/en/f171eaee6f29a2ecc033d8e17b0dbc73cb857e6c/source/resources/img/check.png')
    }else{
      this.set('value', '/static/planner/en/f171eaee6f29a2ecc033d8e17b0dbc73cb857e6c/source/resources/img/uncheck.png')
    }
  },
  mouseDown: function(){
    this.completeToggle();
  },
  completeToggle: function(){
    isComplete = this.get('parentView').get('content').get('isComplete');
    task.set('isComplete', !isComplete);
    if(isComplete) this.set('value', '/static/planner/en/f171eaee6f29a2ecc033d8e17b0dbc73cb857e6c/source/resources/img/uncheck.png');
    if(!isComplete) this.set('value', '/static/planner/en/f171eaee6f29a2ecc033d8e17b0dbc73cb857e6c/source/resources/img/check.png');
  }
});

Planner.Event = Planner.Wrapper.extend({
	content: null,
	index: -1,
	superOrder: -1,
  classNames: ['event-wrapper'],
  left: function(){return this.get('parentView').get('eventLeftOffset');}.property(), 
  top: function(){return this.get('parentView').get('eventTopOffset');}.property(),
  height: function(){return this.get('parentView').get('eventHeight');}.property(),
  width: function(){return this.get('parentView').get('eventWidth');}.property(),
  type: function(){return Planner.Utility.getType(this.get('content'));}.property('content'),
  requiredProperties: 'content index superOrder left top height width type'.w(),
  init: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Animation.hide([this]);
    this.createChildren();
    this.updateClass();
    this.updatePosition();
    Planner.Animation.fadeIn([this], 700);;
  },
  updatePosition: function(){
  	this.adjust({
   		width: this.get('width'),
  		height: this.get('height'),
  		left: this.get('left'),
    	top: this.get('top') + (this.get('index')*this.get('height'))
 		});
  }.observes('index'),
  updateClass: function() {
    this.get('classNames').push(this.get('type'));
  }.observes('type'),
  createChildren: function(){
    if(this.get('type') == 'assignment') this.appendChild(Planner.CheckImage.create({}));
    title =  SC.LabelView.design({
	    layout: {width: .9, height: .9, left: .1, top:.07},
	    value: function(){
	      return this.get('parentView').get('content').get('name');
	    }.property(),
	    render: function(){
	      arguments.callee.base.apply(this,arguments);
	    }
	  });
	  this.appendChild(title);
  }.observes('content'),  
});


Planner.EventListContent = Planner.Wrapper.extend({
	eventsCreated: null, // type event objects
	eventViews: null, //type views objects
	eventOrder: ['test', 'note', 'assignment', 'tasks'],
	events: function(){
    return this.get('parentView').get('events');
  }.property,
	numEvents: function(){return this.get('events').get('length');}.property('events'),
	eventLeftOffset: function(){return this.get('parentView').get('eventLeftOffset');}.property(), 
  eventTopOffset: function(){return this.get('parentView').get('eventTopOffset');}.property(),
  eventHeight: function(){return this.get('parentView').get('eventHeight');}.property(),
  eventWidth: function(){return this.get('parentView').get('eventWidth');}.property(),
  currentHeight: function(){return $(Planner.Utility.id(this)).css('height').slice(0,-2);}.property(),
  requiredProperties: 'eventsCreated eventViews eventOrder events numEvents eventLeftOffset eventTopOffset eventHeight eventWidth currentHeight'.w(),
  init: function(){
    arguments.callee.base.apply(this,arguments);
    SC.info('Parent View: ' + this.get('parentView'));
    SC.info('Parent View Events: ' + this.get('parentView').get('events'));
    SC.info('These Events:' + this.get('events'));
    SC.info('LOffset:' + this.get('eventLeftOffset'));

 //   this.update();
  },
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
    SC.warn('updating!');
		$(Planner.Utility.id(this)).children().forEach(function(item){item.destroy();});
    for(var i = 0; i < this.get('numEvents'); i++){
    	e = this.get('events').objectAt(i);
    	created = this.get('eventsCreated').contains(e);
      SC.info(e.get('name') + 'is created = ' + isCreated);
      if(!created){
        superOrder, index, adjustPoint = this.get('eventOrder').indexOf(eventType), 0, -1;
        for(var l = 0; l < this.get('eventViews').get('length'); l++){
        	comparison, nextComparison = this.get('eventViews').objectAt(l).get('superOrder'), this.get('eventViews').objectAt(l+1);
          if(superOrder < comparison){
            index, adjustPoint = l, l;
            break;
          }
          if(nextComparison != undefined && superOrder == comparison && superOrder !== nextComparison.get('superOrder')){
            index, adjustPoint = l, l;
            break;
          }
         }
        if(adjustPoint == -1) if(this.get('eventViews').get('length') > 0) index = this.get('eventViews').get('length');
        if(adjustPoint >= 0) for(var a = adjustPoint; a < this.get('eventViews').get('length'); a++) this.get('eventViews').objectAt(a).set('index', a+1);
        view = Planner.WeekEventView.create({content: e, index: index, superOrder: superOrder })
        this.appendChild(view);
        this.get('eventsCreated').push(e);
        this.get('eventViews').insertAt(index, view);
     	} 
    }
    this.adjust({
    	height: this.get('eventTopOffset')*this.get('currentHeight') + this.get('numEvents')*(this.get('currentHeight')*(this.get('eventHeight')+this.get('eventTopOffset')))
    });
  }.observes('events')
});


Planner.EventList = SC.ScrollView.extend({
	// DEFINE THESE WHEN EXTENDING
	events: null,
	eventsCreated: null,
	eventViews: null,
	eventLeftOffset: null,
  eventTopOffset: null,
  eventHeight: null,
  eventWidth: null,
  requiredProperties: ['events', 'eventsCreated', 'eventViews', 'eventLeftOffset', 'eventTopOffset', 'eventHeight', 'eventWidth'],
	retrieve: function(){
		SC.error('You did not define the retrieve function to work with your current event list, or you just created a plain event list')
	},
	hasHorizontalScroller: NO,
	hasVerticalScroller: YES,
	classNames: ['event-list'],
  contentView: Planner.EventListContent.design({
    eventsCreated: [],
    eventViews: [],
  })
});



Planner.WeekCell = Planner.EventList.extend({
	// Expected	
	dayNum: null,
	periodNum: null,
	controller: null,
	events: null,
	eventsCreated: null,
	eventViews: null,
	// FINALS
	eventLeftOffset: .025,
  eventTopOffset: .05,
  eventHeight: .17,
  eventWidth: .95,

  classNames: ['week-cell'],
  init: function(){
    arguments.callee.base.apply(this,arguments);
    SC.info('Week Cell Events: ' + this.get('events'));
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