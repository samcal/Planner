sc_require('core');

Planner.WeekCellController = SC.Object.extend({
	view: Planner.WeekCellView.create({dayNum: this.get('date').get('dayOfWeek')-1, periodNum: this.get('period')}}),
});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');