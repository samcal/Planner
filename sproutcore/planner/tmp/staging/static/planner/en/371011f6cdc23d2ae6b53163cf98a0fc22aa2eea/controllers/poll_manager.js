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

	pollDidRespond: function() {
		// TODO -- function to process long poll response

		this.poll();
	}
});

Planner.pollRequest = SC.Request.getUrl('/events/').notify(Planner.pollManager, 'pollDidRespond');