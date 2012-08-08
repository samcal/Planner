sc_require('utility'); sc_require('animation');

Planner.CheckImage = SC.ImageView.extend({
  layout: {width: .07, height: .8, left: .02, top: .13},
  classNames: ['pointer'],
  useCanvas: NO,
  render: function(){
    arguments.callee.base.apply(this,arguments);     
    if(this.get('parentView').get('content').get('isComplete')) {
      this.set('value', '/static/planner/en/7391d255e91052e3a91d0b0f044b2d411900a376/source/resources/img/check.png')
    }else{
      this.set('value', '/static/planner/en/7391d255e91052e3a91d0b0f044b2d411900a376/source/resources/img/uncheck.png')
    }
  },
  mouseDown: function(){
    var task =  this.get('parentView').get('content')
    var isComplete = task.get('isComplete');
    task.set('isComplete', !isComplete);
    this.switchComplete(isComplete);
  },
  switchComplete: function(isComplete){
    if(isComplete) this.set('value', '/static/planner/en/7391d255e91052e3a91d0b0f044b2d411900a376/source/resources/img/uncheck.png');
    if(!isComplete) this.set('value', '/static/planner/en/7391d255e91052e3a91d0b0f044b2d411900a376/source/resources/img/check.png');
  }
});

Planner.Event = Planner.Wrapper.extend({
	content: null,
	eventIndex: -1,

  classNames: ['event-wrapper'],
  // Constant Variables Defined in the EventBin EXCEPT: type is computed
  left: function(){this.get('parentView').get('eventLeftOffset');}.property(), 
  top: function(){this.get('parentView').get('eventTopOffset');}.property(),
  height: function(){this.get('parentView').get('eventHeight');}.property(),
  width: function(){this.get('parentView').get('eventWidth');}.property(),
  type: function(){Planner.Utility.getType(this.get('content'));}.property('content'),

  init: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Utility.hide([this]);
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
    	top: this.get('top') + (this.get('eventIndex')*this.get('height'))
 		});
  }.observes('eventIndex'),
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

Planner.EventBin = Planner.Wrapper.extend({
	events: null,
	classNames: ['event-bin'],

  retrieve: function(property){
    //Just for convenience
    SC.info('Do not use retrieve in Event bin');
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
    var left = this.get('dayNum') == this.retrieve('numDays')-1;
    var bottom = this.get('periodNum') == this.retrieve('courses').get('length');
    if(bottom && !left) this.get('classNames').push('top-left-bottom');
    else if(left && !bottom) this.get('classNames').push('top-left-right');
    else if(!bottom && !left) this.get('classNames').push('top-left');
  },
  controller: function(){
    return Planner.WeekController.getController(this.get('periodNum'), this.get('dayNum'));
  }.property(),
  // First we go through and see if the event already exists, if it does, then we don't recreate it, we leave it alone
  // Next, if the event already exists, we break, other wise we enter our event creation process
  // We have out eventOrder, which helps us set the superOrder, which organizes our events in groups
  //      - Basically here, test should be at the top, then notes, then assignments, and then tasks (this is dynamic and can be changed)
  // then we get the type, and the set the superOrder(where that event type appears based on its type)
  // Now we initialize a eventIndex variable, which is how we organize events, regardless of type, and we also create our adjustStartPoint variable
  // WE now loop through the event views, and check their superOrder, if a superorder happens to be less than our super order, then we set our index to it
  // We also grabbed the index of that eventView, so that now we can move all the views which come after it down. We do so by looping and incrementing
  // Finally!!, we create the newView, and add it to our eventsCreated list, or eventViews created, and then append it to the WeekCellVoew
  updateEvents: function(){
    $('#'+this.get('layerId')).children().forEach(function(item){item.destroy();});
    eventOrder = ['test', 'note', 'assignment', 'tasks'];
    for(var i = 0; i < this.get('events').get('length'); i++){
      e = this.get('events').objectAt(i);
      alreadyExists = false;
      for(var k = 0; k < this.get('eventsCreated').length; k++){
        if (e == this.get('eventsCreated')[k]){
          alreadyExists = true;
          SC.info(e + ' already exists');
          break;
        }
      }
      if(!alreadyExists){
        var eventType = Planner.Utility.getType(e);
        var superOrder = eventOrder.indexOf(eventType);
        var eventIndex = 0;
        var adjustStartPoint = -1;
        for(var l = 0; l < this.get('eventViews').length; l++){
          if(superOrder < this.get('eventViews')[l].get('superOrder')){
            eventIndex = l;
            adjustStartPoint = l;
            break;
          }
          if(this.get('eventViews')[l+1] != undefined){
            if(superOrder == this.get('eventViews')[l].get('superOrder') && superOrder !== this.get('eventViews')[l+1].get('superOrder')){
              eventIndex = l;
              adjustStartPoint = l;
              break;
            }
          }
        }
        if(adjustStartPoint == -1){
          if(this.get('eventViews').length > 0) eventIndex = (this.get('eventViews')[(this.get('eventViews').length-1)].get('eventIndex')+1);
        }
        if(adjustStartPoint >= 0){
          for(var a = adjustStartPoint; a < this.get('eventViews').length; a++){
            this.get('eventViews')[a].set('eventIndex', (this.get('eventViews')[a].get('eventIndex')+1));
          }
        }
        newView = Planner.WeekEventView.create({content: e, eventIndex: eventIndex, superOrder: superOrder, type: eventType});
        this.get('eventsCreated').push(e);
        this.get('eventViews').insertAt(eventIndex, newView);
        this.appendChild(newView);
      }
    }
  }.observes('events')
})



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
    var left = this.get('dayNum') == this.retrieve('numDays')-1;
    var bottom = this.get('periodNum') == this.retrieve('courses').get('length');
    if(bottom && !left) this.get('classNames').push('top-left-bottom');
    else if(left && !bottom) this.get('classNames').push('top-left-right');
    else if(!bottom && !left) this.get('classNames').push('top-left');
  },
  controller: function(){
    return Planner.WeekController.getController(this.get('periodNum'), this.get('dayNum'));
  }.property(),
  // First we go through and see if the event already exists, if it does, then we don't recreate it, we leave it alone
  // Next, if the event already exists, we break, other wise we enter our event creation process
  // We have out eventOrder, which helps us set the superOrder, which organizes our events in groups
  //      - Basically here, test should be at the top, then notes, then assignments, and then tasks (this is dynamic and can be changed)
  // then we get the type, and the set the superOrder(where that event type appears based on its type)
  // Now we initialize a eventIndex variable, which is how we organize events, regardless of type, and we also create our adjustStartPoint variable
  // WE now loop through the event views, and check their superOrder, if a superorder happens to be less than our super order, then we set our index to it
  // We also grabbed the index of that eventView, so that now we can move all the views which come after it down. We do so by looping and incrementing
  // Finally!!, we create the newView, and add it to our eventsCreated list, or eventViews created, and then append it to the WeekCellVoew
  updateEvents: function(){
    $('#'+this.get('layerId')).children().forEach(function(item){item.destroy();});
    eventOrder = ['test', 'note', 'assignment', 'tasks'];
    for(var i = 0; i < this.get('events').get('length'); i++){
      e = this.get('events').objectAt(i);
      alreadyExists = false;
      for(var k = 0; k < this.get('eventsCreated').length; k++){
        if (e == this.get('eventsCreated')[k]){
          alreadyExists = true;
          SC.info(e + ' already exists');
          break;
        }
      }
      if(!alreadyExists){
        var eventType = Planner.Utility.getType(e);
        var superOrder = eventOrder.indexOf(eventType);
        var eventIndex = 0;
        var adjustStartPoint = -1;
        for(var l = 0; l < this.get('eventViews').length; l++){
          if(superOrder < this.get('eventViews')[l].get('superOrder')){
            eventIndex = l;
            adjustStartPoint = l;
            break;
          }
          if(this.get('eventViews')[l+1] != undefined){
            if(superOrder == this.get('eventViews')[l].get('superOrder') && superOrder !== this.get('eventViews')[l+1].get('superOrder')){
              eventIndex = l;
              adjustStartPoint = l;
              break;
            }
          }
        }
        if(adjustStartPoint == -1){
          if(this.get('eventViews').length > 0) eventIndex = (this.get('eventViews')[(this.get('eventViews').length-1)].get('eventIndex')+1);
        }
        if(adjustStartPoint >= 0){
          for(var a = adjustStartPoint; a < this.get('eventViews').length; a++){
            this.get('eventViews')[a].set('eventIndex', (this.get('eventViews')[a].get('eventIndex')+1));
          }
        }
        newView = Planner.WeekEventView.create({content: e, eventIndex: eventIndex, superOrder: superOrder, type: eventType});
        this.get('eventsCreated').push(e);
        this.get('eventViews').insertAt(eventIndex, newView);
        this.appendChild(newView);
      }
    }
  }.observes('events')
}),