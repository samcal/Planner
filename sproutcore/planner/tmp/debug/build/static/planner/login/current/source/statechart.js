Planner.statechart = SC.Statechart.create({

  initialState: 'LOGGED_OUT',
  
  LOGGED_OUT: SC.State.plugin('Planner.ReadyState'),
  LOGGED_IN: SC.State.plugin('Planner.LOGGED_IN')
  // someOtherState: SC.State.plugin('Planner.SomeOtherState')

});; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');