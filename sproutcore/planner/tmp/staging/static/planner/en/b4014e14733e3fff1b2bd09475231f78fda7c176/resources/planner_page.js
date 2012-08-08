Planner.plannerPage = SC.Page.design({
  plannerPane: SC.MainPane.design({
    classNames: ['plannerPane'],
    childViews: ['date', 'bookmark', 'util', 'sideView', 'mainView', 'calendar'],
    date: SC.LabelView.design({
      classNames: ['date'],
      layout: {width: 260, height: 40, top: 4, left: 16, zIndex: 1},
      tagName: "h1", 
      value: date.toFormattedString('%A, %B %D') + getSup(date.get('day'))
    }),

    sideView: SC.View.design({
      layout: {width: .25, height: .45, right: .015, top: .1, zIndex: 0},
      classNames: ['sideView'],
      childViews: ['sideBin'],
      sideBin: SC.ScrollView.design({
        childViews: ['contentView'],
        contentView: SC.ListView.extend({
          classNames: ['my-list-view'],
          isSelectable: NO,
          rowHeight: 35,
          contentBinding: SC.Binding.oneWay('Planner.courses'),
          exampleView: SC.ListItemView.extend({
            contentValueKey: 'sideCourseDisplay'
          }),
        })
      })
    }),
   
    mainView: SC.View.design({
      classNames: ['mainView'],
      layout: {width: .7, height: .92, left: .015, top:.065},
      childViews: ['WeekView'],
    
      WeekView: Planner.WeekView.design({
        
      }),
    }),

    calendar: Planner.CalendarView.create({
      layout: {width: .21, height: .33, right:.036, top: .64}
    }),

    bookmark: SC.LabelView.design({
      classNames: ['bookmark'],
      layout: { width: .125,  height: 35, top: -45, right: 20, zIndex: 1 },
      mouseDown: function(){Planner.statechart.invokeStateMethod('toggleUtil')},
      textAlign: SC.ALIGN_CENTER,
      valueBinding: SC.Binding.from('Planner.currentUser.loginGreeting'),
    }),

    util: SC.View.design({
      layout: { width: .125,  height: 100, top: -100, right: 20, zIndex: 100 },
      classNames: ['util'],
      childViews: ['logout', 'settings'],
      logout: Planner.UtilItem.design({
        layout: {width: .999, height: 25, centerY: 35},
        title: 'Logout',
        action: 'logoutPressed',
      }),
      settings: Planner.UtilItem.design({
        layout: {width: .999, height: 25, centerY: 10},
        title: 'Settings'
      })
    })
  })
});