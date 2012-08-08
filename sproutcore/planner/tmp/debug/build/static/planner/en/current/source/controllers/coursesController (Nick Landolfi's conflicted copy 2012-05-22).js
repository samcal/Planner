sc_require('core');

Planner.coursesController = SC.ArrayController.create({
	content: [],

	getCourses: function() {
		this.set('content', currentUser.get('courses'));
		return this.get('content');
	}.property(),
});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');