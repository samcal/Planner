/*
	Initiates long poll request every 5 seconds, or when the
	previous request returns, whichever comes first. Call
	start() to begin the process, stop() to cancel it.
*/
Planner.pollManager = SC.Object.create({
	start: function() {
		if(!this.running){
			this.running = YES;
			this.poll();
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
		this.timer = this.invokeLater(this.poll, 5000);
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
			SC.info(data.assignments);
			var assignment_ids = Planner.store.loadRecords(Planner.Assignment, data.assignments);
			for(var i = 0; i < assignment_ids.length; i++) {
				var assignment = Planner.store.find(Planner.Assignment, Planner.store.idFor(assignment_ids[i]));
				assignment.get('course').get('assignments').addInverseRecord(assignment);
			}
			SC.info(data.tests);
			var test_ids = Planner.store.loadRecords(Planner.Test, data.tests);
			for(var i = 0; i < test_ids.length; i++) {
				var test = Planner.store.find(Planner.Test, Planner.store.idFor(test_ids[i]));
				test.get('course').get('tests').addInverseRecord(test);
			}
			SC.info(data.notes);
			var note_ids = Planner.store.loadRecords(Planner.Note, data.notes);
			for(var i = 0; i < note_ids.length; i++) {
				var note = Planner.store.find(Planner.Note, Planner.store.idFor(note_ids[i]));
				note.get('course').get('notes').addInverseRecord(note);
			}
			SC.info(data.tasks);
			var task_ids = Planner.store.loadRecords(Planner.Task, data.tasks);
			for(var i = 0; i < task_ids.length; i++) {
				var task = Planner.store.find(Planner.Task, Planner.store.idfor(task_ids[i]));
				task.get('course').get('tasks').addInverseRecord(task);
			}
			if(assignment_ids.length + test_ids.length + note_ids.length + task_ids.length > 0) Planner.WeekController.updateAllCells();
		}
	}
});

Planner.pollRequest = SC.Request.getUrl('/poll/').json().notify(Planner.pollManager, 'pollDidRespond');