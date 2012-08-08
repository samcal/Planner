sc_require('utility'); sc_require('animation');

Planner.CheckImage = SC.ImageView.extend({
  layout: {width: .07, height: .8, left: .02, top: .13},
  classNames: ['pointer'],
  useCanvas: NO,
  render: function(){
    arguments.callee.base.apply(this,arguments);     
    if(this.get('parentView').get('content').get('isComplete')) {
      this.set('value', '/static/planner/en/68eb204a8a8c7740fa152921cfdf9df9c53173e3/source/resources/img/check.png')
    }else{
      this.set('value', '/static/planner/en/68eb204a8a8c7740fa152921cfdf9df9c53173e3/source/resources/img/uncheck.png')
    }
  },
  mouseDown: function(){
    var task =  this.get('parentView').get('content')
    var isComplete = task.get('isComplete');
    task.set('isComplete', !isComplete);
    this.switchComplete(isComplete);
  },
  switchComplete: function(isComplete){
    if(isComplete) this.set('value', '/static/planner/en/68eb204a8a8c7740fa152921cfdf9df9c53173e3/source/resources/img/uncheck.png');
    if(!isComplete) this.set('value', '/static/planner/en/68eb204a8a8c7740fa152921cfdf9df9c53173e3/source/resources/img/check.png');
  }
});

Event = Planner.Wrapper.extend({
	content: null,
	eventIndex: -1,

  classNames: ['event-wrapper'],
  // Supposedly Constant Variables Defined in the EventBin
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
    Planner.Animation.fadeIn(this, 700);;
  },
  updatePosition: function(){
  	this.adjust({
   		width: this.get('width'),
  		height: this.get('height'),
  		left: this.get('left'),
    	top: this.get('top') + (this.get('eventIndex')*this.get('height'))
 		});
  }.observes('eventIndex'),
  updateClass: function(){
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

Planner.EventBin = Planner.Wrapper.extend({})