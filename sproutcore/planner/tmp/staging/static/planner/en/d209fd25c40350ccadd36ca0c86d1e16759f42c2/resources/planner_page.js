Planner.plannerPage = SC.Page.design({
  resize: function() {
    alert('hey');
    var x = window.innerWidth / 1434;
    var y = window.innerHeight / 710;
    if (x < y) {
      document.body.style.fontSize = x + 'em';
    }else{
      document.body.style.fontSize = y + 'em';
    }
  },

  plannerPane: SC.MainPane.design({
    resize: function() {
    alert('hey');
    var x = window.innerWidth / 1434;
    var y = window.innerHeight / 710;
    if (x < y) {
      document.body.style.fontSize = x + 'em';
    }else{
      document.body.style.fontSize = y + 'em';
    }
  },
    classNames: ['plannerPane'],
    childViews: ['date', 'bookmark', 'util', 'sideHeader', 'sideView', 'mainView', 'calendar'],
    date: SC.LabelView.design({
      classNames: ['date'],
      layout: {width: 260, height: 40, top: 4, left: 16, zIndex: 1},
      tagName: "h1", 
      value: date.toFormattedString('%A, %B %D') + getSup(date.get('day'))
    }),

    sideHeader: Planner.Wrapper.design({
      layout: {width: .25, height:.2, top: .07, right: .017},
      childViews: ['loginTitle', 'rule'],
      loginTitle: SC.LabelView.design({
        classNames: ['sideHeader'],
        textAlign: SC.ALIGN_CENTER,
        value: 'Classes'
      }),
      rule: SC.LabelView.design({
        classNames: ['sideRule'],
        textAlign: SC.ALIGN_CENTER,
        layout: {width: .9,left:.05},
        value: '____________________________________'
      }),
    }),
    sideView: SC.View.design({
      layout: {width: .25, height: .45, right: .017, top: .12, zIndex: 0},
      classNames: ['sideView'],
      childViews: ['courses'],
      courses: Planner.Wrapper.create({
        courses: function(){
          return Planner.courses
        }.property('Planner.courses'),
      courseViews: [],
      updateCourses: function(){
        for( var i = 0; i < this.get('courses').get('length'); i++){
          courseView = Planner.CourseView.create({course:this.get('courses').objectAt(i), numCourses: this.get('courses').get('length'), num: i});
          this.appendChild(courseView);
          this.get('courseViews').push(courseView);
        }
      }.observes('courses'),
      resize: function() {
    alert('hey');
    var x = window.innerWidth / 1434;
    var y = window.innerHeight / 710;
    if (x < y) {
      document.body.style.fontSize = x + 'em';
    }else{
      document.body.style.fontSize = y + 'em';
    }
  },
      }),
    }),
   
    mainView: SC.View.design({
      classNames: ['mainView'],
      layout: {width: .7, height: .92, left: .015, top:.065},
      childViews: ['WeekView'],
    
      WeekView: Planner.WeekView.design({
        layout: {top: 0}
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