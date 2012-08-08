Planner.DateCell = SC.ButtonView.extend({
  classNames: ['date-cell'],
  textAlign: SC.ALIGN_CENTER,  
  retrieve: function(property){
    return Planner.Calendar.get(property);
  },
  init: function(){
    arguments.callee.base.apply(this,arguments);
    this.set('title', Planner.Calendar.retrieve(this.get('rowNum'), this.get('dayNum')));
    this.adjust({
      width: this.retrieve('colWidth'),
      height: this.retrieve('rowHeight'),
      top: this.retrieve('topOffset') + this.get('rowNum')*this.retrieve('rowHeight'),
      left: this.get('dayNum')*this.retrieve('colWidth'),
    });
  }
});

Planner.CalendarView = SC.View.extend({
  childViews: [
    'backArrow', 'monthName', 'nextArrow',
  ],
  backArrow: SC.LabelView.design({
    textAlign: SC.ALIGN_CENTER,
    title: '<',
    mouseUp: function(){Planner.Calendar.prevMonth();},
    layout: {width: .2, height: Planner.Calendar.get('topOffset')}
  }),
  monthName: SC.LabelView.design({
    classNames: ['month-name'],
    textAlign: SC.ALIGN_CENTER,
    valueBinding: 'Planner.Calendar.monthName',
    layout: {width: .5, height: Planner.Calendar.get('topOffset'), centerX: .000000001},
    init: function(){
      arguments.callee.base.apply(this,arguments);
      $('#'+this.get('layerId')).css('font-size', (((Planner.Calendar.get('topOffset'))*450)+100) + '%')
    },
  }),
  nextArrow: SC.LabelView.design({
    textAlign: SC.ALIGN_CENTER,
    title: '>',
    mouseUp: function(){Planner.Calendar.nextMonth();},
    layout: {width: .2, height: Planner.Calendar.get('topOffset'), right: 10}
  }),
 

  datesBinding: 'Planner.Calendar.dayValues',
  currentDates: [],
  build: function() {
    // Take care of the old dates, if of course, there are any
    this.get('currentDates').forEach(function(item){item.destroy();});
    for(var r = 0; r < this.get('dates').get('length'); r++){
      for(var c = 0; c < this.get('dates').objectAt(0).get('length'); c++){
        dateCell = Planner.DateCell.create({rowNum: r, dayNum: c});
        this.appendChild(dateCell);
        this.get('currentDates').push(dateCell);
      }
    }
  }.observes('dates'),
});