/*
	Initiates long poll request every 5 seconds, or when the
	previous request returns, whichever comes first. Call
	start() to begin the process, stop() to cancel it.
*/
Planner.pollManager = SC.Object.create({
	start: function() {
		if(!this.running){
			this.running = YES;
			this.poll()
		}
	},

	// starts a new poll, cancels the outstanding request
	poll: function() {
		// cancel outstanding
		if(this.request) this.request.cancel();
		if(this.timer) this.timer.invalidate();

		// start a new request
		this.request = Planner.pollRequest.send();

		// set timout to restart the poll in 5 seconds
		this.timer = this.invokeLater(this.poll, 31000);
	},

	stop: function() {
		if(this.running) {
			this.running = NO;

			// about the XHR and clear the timer
			if(this.request) this.request.cancel();
			if(this.timer) this.timer.invalidate();

			this.timer = this.request = null;
		}
	},

	pollDidRespond: function(response) {
		if(SC.ok(response)) {
			var data = response.get('body');

			var ids;

			ids = Planner.store.loadRecords(Planner.Assignment, data.assignments);
			for(var i = 0; i < ids.length; i++) {
				var assignment = Planner.store.find(Planner.Assignment, Planner.store.idFor(ids[i]));
				assignment.get('course').get('assignments').addInverseRecord(assignment);
			}

			Planner.store.loadRecords(Planner.Test, data.tests);
			Planner.store.loadRecords(Planner.Note, data.notes);
			Planner.store.loadRecords(Planner.Task, data.tasks);
			if(data.assignments != null || data.tests != null || data.notes != null || data.tasks != null) Planner.WeekController.updateAllCells();
		}
	}
});

Planner.pollRequest = SC.Request.getUrl('/poll/').json().notify(Planner.pollManager, 'pollDidRespond');