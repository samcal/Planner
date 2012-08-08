Planner.plannerPage = SC.Page.design({
  plannerPane: SC.MainPane.design({
    classNames: ['plannerPane'],
    childViews: ['date', 'bookMark', 'sideView', 'mainView'],
    date: SC.LabelView.design({
      classNames: ['date'],
      layout: {width: 260, height: 40, top: 4, left: 16, zIndex: 0},
      tagName: "h1", 
      value: date.toFormattedString('%A, %B %d') + getSup(date.get('day'))
    }),

    sideView: SC.View.design({
      layout: {width: .25, height: .45, right: 20, top: .1, zIndex: 0},
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
      layout: {width: .7, height: .9, left: 20, top:.065},
      childViews: ['plannerGrid'],
      plannerGrid: SC.GridView.extend({
        columnWidth: .2,
        rowHeight: 80,
        content: ['hallo', 'bonojour', 'hola', 'aloha'],
        layout: {top: 20, bottom: 20, left: 20, right: 20},
      }),
    }),

    bookMark: SC.View.design({
      classNames: ['bookMark'],
      textAlign: SC.ALIGN_CENTER,
      layout: {width: 175,  height: 25, top: 0, right:20, zIndex: 1},
      open: false,
      mouseDown: function() {
        if (this.get('open')) {
          this.animate('height', 25, {duration: 0.1, /*timing:'ease-out'*/});
          this.set('open', false);
        } else {
          this.animate('height', 75, {duration:0.1, /*timing:'ease-out'*/});
          this.set('open', true);
        }
      },

      childViews: ['greeting', 'logout', 'settings'],
      greeting: SC.LabelView.design({
        layout: {left: 10, right: 10, bottom: 10},
        textAlign: SC.ALIGN_CENTER,
        valueBinding: SC.Binding.from('Planner.currentUser.loginGreeting'),
      }),
      logout: SC.LabelView.design({
        layout: {left: 10, top: 25},
        textAlign: SC.ALIGN_LEFT,
        value: 'Logout',
        mouseDown: function() {
          Planner.currentUser.sendLogout();
        }
      }),
      settings: SC.LabelView.design({
        layout: {left: 10, right: 10, bottom: 10, top: 40},
        textAlign: SC.ALIGN_LEFT,
        value: 'Settings'
      })
    }),
  })
});