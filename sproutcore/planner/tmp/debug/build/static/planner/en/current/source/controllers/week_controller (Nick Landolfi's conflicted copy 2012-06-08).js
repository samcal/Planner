Planner.WeekController = SC.Object.create({
	topOffset: .08,
	leftOffset:.03,
	numPeriods: 5,
	numDays: 5,
	tabHeight: function(){
		return this.get('height')/5
	}.property('height'),
  width: function(){
  	return (1-this.get('leftOffset'))/this.get('numDays')-.0009
  }.property('numDays', 'leftOffset' ),
  height: function(){
  	return (1-this.get('topOffset'))/this.get('numPeriods')-.0000000000000000001
  }.property('numPeriods', 'topOffset'),
  hasZero: function(){
  	return this.get('numPeriods') === 7;
  }.property('numPeriods'),
});
; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');