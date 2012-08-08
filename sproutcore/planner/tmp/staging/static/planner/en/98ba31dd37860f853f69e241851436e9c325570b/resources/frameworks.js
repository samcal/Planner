sc_require('utility'); sc_require('animation');

EventFramework = Planner.Wrapper.extend({
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
    if(this.get('type') == 'assignment') this.appendChild(Planner.WeekCheckImage.create({}));
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