Planner.EventListController = SC.Object.create ({
	currentType: null,
	currentCourse: null,
	events: function(){
		SC.info(this.get('currentCourse'));
		SC.info(this.get('currentCourse').get(this.get('currentType')+'s'));
		if(this.get('currentCourse') != null) return this.get('currentCourse').get(this.get('currentType')+'s');
		else return [];
	}.property('currentCourse', 'currentType')
})