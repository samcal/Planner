Planner.plannerPage = SC.Page.design({

  plannerPane: SC.MainPane.design({
    classNames: ['plannerPane'],
    childViews: ['date', 'bookmark', 'util', 'sideHeader', 'sideView', 'mainView', 'calendar', 'navBar', 'feedback'],
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
      childViews: ['courses', 'eventList'],
      courses: Planner.Wrapper.create({
        courseViews: [],
        coursesBinding: SC.Binding.from('Planner.Courses.content'),
        numCourses: function(){return this.get('courses').get('length')}.property('courses'),
        render: function(){
          arguments.callee.base.apply(this,arguments);
          this.updateCourses();
        },
        updateCourses: function(){
          this.get('courseViews').forEach(function(view){view.destroy();});
          for(var i = 0; i < this.get('numCourses'); i++){
            courseView = Planner.CourseView.create({course:this.get('courses').objectAt(i), numCourses: this.get('numCourses'), num: i});
            this.appendChild(courseView);
            this.get('courseViews').push(courseView);
          }
        }.observes('courses')
      }),
      eventList: Planner.EventList.create({
        classNames: 'event-list',
        // The fucking binding didnt fucking work so we are doing this. Don't say a thing unless you can fucking fix it. This took days to figure out.
        events: function(){return Planner.EventListController.get('events');}.property('Planner.EventListController.events'),
        eventLeftOffset: .015,
        eventTopOffset: .02,
        eventHeight: .07,
        eventWidth: .97,
        eventSpacing: .01,
        eventCheckWidth: .05,
      }),
    }),
   
    mainView: SC.View.design({
      classNames: ['mainView'],
      layout: {width: .7, height: .92, left: .015, top:.065},
      childViews: ['DayView', 'WeekView'],
    
      DayView: Planner.DayView.design({}),
      WeekView: Planner.WeekView.design({
      }),

    }),

    calendar: Planner.CalendarView.create({
      classNames: ['calendar'],
      layout: {width: .21, height: .32, right:.036, top: .66}
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
    }),

    feedback: Planner.BrownButton.create({
      mouseUp: function(){alert('yea, it works..')},
      layout: {width: .21, top: .58, height: .036, right:.036 },
      title: 'Give us Feedback'
    }),

    navBar: Planner.Wrapper.design({
      classNames: ['nav-bar'],
      childViews: ['leftArrow', 'left', 'center', 'right', 'rightArrow'],
      layout: {width: .19, height: .04, top: .01, left: .4},
      leftArrow: Planner.BrownButton.design({
        classNames: ['left-arrow'],
        layout: {width: .104, left: 0},
        title: '<',
        action: 'prev'
      }),
      left: Planner.BrownButton.design({
        classNames: ['left'],
        layout: {width: .263, left: .104},
        title: 'Day',
        action: 'gotoDay',
      }),
      center: Planner.BrownButton.design({
        classNames: ['center'],
        layout: {width: .263, left: .367},
        title: 'Week',
        action: 'gotoWeek'
      }),
      right: Planner.BrownButton.design({
        classNames: ['right'],
        layout: {width: .263, left: .630},
        title: 'Month',
        action: 'gotoMonth'
      }),
      rightArrow: Planner.BrownButton.design({
        classNames: ['right-arrow'],
        layout: {width: .104, left: .893},
        title: '>',
        action: 'next'
      }),

    })

  })
});