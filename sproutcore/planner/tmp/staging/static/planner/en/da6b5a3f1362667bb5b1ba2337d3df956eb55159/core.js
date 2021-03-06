// ==========================================================================
// Project:   Planner
// Copyright: @2012 Nick Landolfi
// ==========================================================================
/*globals Planner */

/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Object
*/
Planner = SC.Application.create(
  /** @scope Planner.prototype */ {

  NAMESPACE: 'Planner',
  VERSION: '0.1.0',

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.
  store: SC.Store.create({
    commitRecordsAutomatically: YES,
  }).from('Planner.DataSource'),
  
  // TODO: Add global constants or singleton objects needed by your app here.

  required: function(){
    for(var i = 0; i < this.get('requiredProperties').get('length'); i++){
      if(!Planner.Utility.isDefined(this.get(this.get('requiredProperties').objectAt(i))){
       SC.error(this.get('requiredProperties').objectAt(i) + ' is not defined!');
     }
    }
  }

}) ;
