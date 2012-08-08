// ==========================================================================
// Project:   Planner.DataSource
// Copyright: @2012 My Company, Inc.
// ==========================================================================
/*globals Planner */

sc_require('models/course');
sc_require('models/event');

Planner.COURSE_QUERY = SC.Query.local(Planner.Course);
Planner.EVENT_QUERY = SC.Query.local(Planner.Event);


/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
Planner.DataSource = SC.DataSource.extend(
/** @scope Planner.CourseDataSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 

  fetch: function(store, query) {
    if (query == Planner.COURSE_QUERY) {
      SC.Request.getUrl('/courses/')
        .notify(this, 'didFetchCourses', store, query)
        .send();
        return YES;
    } else if (query == Planner.EVENT_QUERY) {
      SC.Request.getUrl('/events/')
        .notify(this, 'didFetchEvents', store, query)
        .send();
        return YES;
    }
    return NO;
  },

  didFetchCourses: function(response, store, query) {
    if (SC.ok(response)) {
      var data = JSON.parse(response.body());
      var events = data.events;
      if(events.assignments) store.loadRecords(Planner.Assignment, events.assignments);
      if(events.tests) store.loadRecords(Planner.Test, events.tests);
      if(events.notes) store.loadRecords(Planner.Note, events.notes);
      if(events.tasks) store.loadRecords(Planner.Task, events.tasks);
      if(data.courses) store.loadRecords(Planner.Course, data.courses);
      store.dataSourceDidFetchQuery(query);
      Planner.WeekController.create();
      Planner.statechart.gotoState('LOGGED_IN');
      Planner.pollManager.start()
    } else store.dataSourceDidErrorQuery(query, response);
  },

  didFetchEvents: function(response, store, query) {
    SC.info('didFetchEvents');
    if (SC.ok(response)) {
      var data = JSON.parse(response.body());
      if(data.assignments) store.loadRecords(Planner.Assignment, data.assignments);
      if(data.tests) store.loadRecords(Planner.Test, data.tests);
      if(data.notes) store.loadRecords(Planner.Note, data.notes);
      if(data.tasks) store.loadRecords(Planner.Task, data.tasks);
      store.dataSourceDidFetchQuery(query);
      Planner.statechart.gotoState('LOGGED_IN');
      Planner.pollManager.start();
    } else store.dataSourceDidErrorQuery(query, response);
  },
  
  retrieveRecord: function(store, storeKey) {
    if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Course)) {
      var url = '/course/' + store.idFor(storeKey) + '/';
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send();
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Assignment)) {
      var url = '/assignment/' + store.idFor(storeKey) + '/';
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Test)) {
      var url = '/test/' + store.idFor(storeKey) + '/';
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Note)) {
      var url = '/note/' + store.idFor(storeKey) + '/';
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    } else if (SC.kindOf(store.recordTypeFor(storeKey), Planner.Task)) {
      var url = '/task/' + store.idFor(storeKey) + '/';
      SC.Request.getUrl(url)
        .notify(this, 'didRetrieveData', store, storeKey)
        .send()
      return YES;
    }
    return NO;
  },

  didRetrieveData: function(response, store, storeKey) {
    if (SC.ok(response)) {
      var data = JSON.parse(response.body());
      if(data) store.loadRecord(store.recordTypeFor(storeKey), data);
    } else store.dataSourceDidError(storeKey, response);
  },
  
  createRecord: function(store, storeKey) {
    /*if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Course) {
      SC.Request.postUrl('/course/create/')
        .notify(this, 'didCreateCourse', store, storeKey)
        .send(store.readDataHash(storeKey));

      return YES;
    }*/

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Task) {
      var data = store.readDataHash(storeKey)
      SC.info(SC.json.encode(data))
      SC.Request.postUrl('/task/create/', store, storeKey)
        .notify(this, 'didCreateTask')
        .send('data=' + SC.json.encode(data));
      return YES;
    }

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Assignment) {
      var data = store.readDataHash(storeKey);
      SC.Request.postUrl('/assignment/create/')
        .notify(this, 'didCreateAssignment', store, storeKey)
        .send('data=' + SC.json.encode(data));
      return YES;
    }

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Test) {
      SC.Request.postUrl('/test/create/', store, storeKey)
        .notify(this, 'didCreateTest')
        .send(store.readDataHash(storeKey));
      return YES;
    }

    if (SC.kindOf(store.recordTypeFor(storeKey)), Planner.Note) {
      SC.Request.postUrl('/note/create/', store, storeKey)
        .notify(this, 'didCreateNote')
        .send(store.readDataHash(storeKey));
      return YES;
    }

    return NO;
  },

  didCreateCourse: function(response, store, storeKey) {
    /*if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);*/
  },

  didCreateAssignment: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);
  },

  didCreateTest: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);
  },

  didCreateNote: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);
  },

  didCreateTask: function(response, store, storeKey) {
    if (SC.ok(response)) {
      store.dataSourceDidComplete(storeKey, null);
    } else store.dataSourceDidError(storeKey, response);
  },
  
  updateRecord: function(store, storeKey) {
    
    // TODO: Add handlers to submit modified record to the data source
    // call store.dataSourceDidComplete(storeKey) when done.
    if(Planner.currentUser.get('isStudent')) {
      if(SC.kindOf(store.recordTypeFor(storeKey), Planner.Assignment)) {
        var assignment = store.find(Planner.Assignment, store.idFor(storeKey));
        var body = 'isComplete=' + assignment.get('isComplete');
        SC.Request.postUrl('/assignment/' + store.idFor(storeKey) + '/update/', body)
          .notify(this, 'didUpdateEvent', store, storeKey)
          .send();
        store.dataSourceDidComplete(storeKey, null);
        return YES;
      } else if(SC.kindOf(store.recordTypeFor(storeKey), Planner.Task)) {
        var body = 'isComplete=' + store.find(Planner.Task, store.idFor(storeKey)).get('isComplete');
        SC.Request.postUrl('/task/' + store.idFor(storeKey) + '/update/', body)
          .notify(this, 'didUpdateEvent', store, storeKey)
          .send();
        return YES;
      }
    }

    return NO; // return YES if you handled the storeKey
  },

  didUpdateEvent: function(response, store, storeKey) {
    if (SC.ok(response) && JSON.parse(response.get('body')).status == 400) {
      store.dataSourceDidError(storeKey, 'We had an error with updating an event.');
    }
  },
  
  destroyRecord: function(store, storeKey) {
    
    // TODO: Add handlers to destroy records on the data source.
    // call store.dataSourceDidDestroy(storeKey) when done
    
    return NO; // return YES if you handled the storeKey
  }
  
}) ;
