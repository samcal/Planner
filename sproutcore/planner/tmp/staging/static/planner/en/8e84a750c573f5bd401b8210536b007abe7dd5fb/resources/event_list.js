sc_require('utility');
sc_require('resources/week_view');

Planner.ListCheckImage = Planner.WeekCheckImage.extend({

})

// Planner.ListEventView = Planner.Wrapper.extend({
// 	layout: {width: .95, left: .025},
//   classNames: ['event-wrapper'],
//   init: function(){
//     arguments.callee.base.apply(this,arguments);
//     Planner.Animation.hide([this]);
//     this.updateClass();
//     this.updatePosition();
//     this.createIcon();
//     $('#'+this.get('layerId')).fadeIn(300);
//   },
//   updateClass: function(){
//     this.get('classNames').push(this.get('type'));
//   }.observes('type'),
//   createIcon: function(){
//     type = this.get('type');
//     if(type == 'assignment'){
//       checkBox = Planner.ListCheckImage.create({});
//       this.appendChild(checkBox);
//     }
//   }.observes('type'),
//   childViews: [ 'title'],
//   title: SC.LabelView.design({
//     layout: {width: .9, height: .9, left: .1, top:.07},
//     value: function(){
//       return this.get('parentView').get('content').get('name');
//     }.property(),
//     render: function(){
//       arguments.callee.base.apply(this,arguments);
//     }
//   }),
//   updatePosition: function(){
//     height = $('#'+Planner.getPath('plannerPage.plannerPane.sideView').get('layerId')).css('height');
//     height = height.substring(0, height.length-2)
//     n = .01 * height;
//     y = .05 * height;
//     this.adjust({
//       top: n + this.get('eventIndex')*(y + .2*y),
//       height: y
//     })
//   }.observes('eventIndex')
// })



// Planner.EventList = SC.ScrollView.extend({
//   layout: {zIndex: 1000},
// 	hasHorizontalScroller: NO,
// 	hasVerticalScroller: YES,
// 	classNames: ['event-list'],
//   init: function(){
//     arguments.callee.base.apply(this,arguments);
//     SC.info('Planner.EventList Created');
//   },
// 	contentView: Planner.EventListContent.design({
// 		eventsBinding: SC.Binding.from('Planner.EventListController.events'),
// 		eventViews: [],
//     layout: {zIndex: 1001, height: 1000},
// 	})
// });