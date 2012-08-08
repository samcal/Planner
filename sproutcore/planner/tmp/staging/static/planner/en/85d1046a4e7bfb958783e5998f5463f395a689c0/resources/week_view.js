sc_require('utility');
Planner.WeekCheckImage = SC.ImageView.extend({
  layout: {width: .07, height: .8, left: .02, top: .13},
  classNames: ['pointer'],
  useCanvas: NO,
  render: function(){
    arguments.callee.base.apply(this,arguments);     
    if(this.get('parentView').get('content').get('isComplete')) {
      this.set('value', '/static/planner/en/85d1046a4e7bfb958783e5998f5463f395a689c0/source/resources/img/check.png')
    }else{
      this.set('value', '/static/planner/en/85d1046a4e7bfb958783e5998f5463f395a689c0/source/resources/img/uncheck.png')
    }
  },
  mouseDown: function(){
    var task =  this.get('parentView').get('content')
    var isComplete = task.get('isComplete');
    task.set('isComplete', !isComplete);
    this.switchComplete(isComplete);
  },
  switchComplete: function(isComplete){
    if(isComplete) this.set('value', '/static/planner/en/85d1046a4e7bfb958783e5998f5463f395a689c0/source/resources/img/uncheck.png');
    if(!isComplete) this.set('value', '/static/planner/en/85d1046a4e7bfb958783e5998f5463f395a689c0/source/resources/img/check.png');
  }
})

Planner.WeekEventView = Planner.Wrapper.extend({
  layout: {width: .95, height: .17, top: .05, left: .025},
  classNames: ['event-wrapper'],
  init: function(){
    arguments.callee.base.apply(this,arguments);
    Planner.Animation.hide([this]);
    this.updateClass();
    this.updatePosition();
    this.createIcon();
    $('#'+this.get('layerId')).fadeIn(300);
  },
  updateClass: function(){
    this.get('classNames').push(this.get('type'));
  }.observes('type'),
  createIcon: function(){
    type = this.get('type');
    if(type == 'assignment'){
      checkBox = Planner.WeekCheckImage.create({});
      this.appendChild(checkBox);
    }
  }.observes('type'),
  childViews: [ 'title'],
  title: SC.LabelView.design({
    layout: {width: .9, height: .9, left: .1, top:.07},
    value: function(){
      return this.get('parentView').get('content').get('name');
    }.property(),
    render: function(){
      arguments.callee.base.apply(this,arguments);
    }
  }),
  updatePosition: function(){
    this.adjust({
      top: .05 + (this.get('eventIndex')*.21) 
    })
  }.observes('eventIndex')
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
  },
  render: function(){
    arguments.callee.base.apply(this,arguments);
    $('#'+this.get('layerId')).css('font-size', $('#'+this.get('layerId')).css('height'));
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
  layout: {width: .98, height: .98, left: .01, top: .01},
  classNames: ['week-view'],
});
