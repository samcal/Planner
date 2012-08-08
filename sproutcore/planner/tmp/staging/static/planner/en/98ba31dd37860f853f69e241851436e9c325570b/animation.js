sc_require('utility');
Planner.Animation = SC.Object.create({
	// Basic Bookmark Animations:  Slide Up --> Changes the Text --> Slides back down (Handles Timing)
	SwitchBookmark: function(title, noHide){
		// If we passed this parameter, we do not need to slide up.
		if(!noHide){
			$('#'+Planner.getPath('loginPage.loginPane.bookmark').get('layer').id).animate({translateY: '-=35'}, 500);
		}
		// Set a timer to execute the value reset and slide down to occur in 300 milliseconds. 
		SC.Timer.schedule({
			target: this, 
			action: function(){	
				 $('#'+Planner.getPath('loginPage.loginPane.bookmark').get('layer').id).animate({translateY: '+=35'}, 500);
				 Planner.getPath('loginPage.loginPane.bookmark').set('value', title);}
			, interval: 300
		});
	},
	LoginCardSwitch: function(toSwitchTo, directionEmerging){
		var a, b;
		switch(toSwitchTo){
			case 1 :
				a = Planner.getPath('loginPage.loginPane.loginBin');
				b = Planner.getPath('loginPage.loginPane.createAccountBin');
				$(Planner.Utility.toId(a)).animate({translateX: '-=330'}, 500);
				$(Planner.Utility.toId(b)).animate({translateX: '+=20'}, 500);
				SC.Timer.schedule({
					action: function(){
						Planner.Animation.oneUp(a, b);
			  		$(Planner.Utility.toId(a)).animate({translateX: '+=330'}, 500);
			  		$(Planner.Utility.toId(b)).animate({translateX: '-=20'}, 500);
					}, 
					interval: 500
				});
				break;
			case 2:
				b = Planner.getPath('loginPage.loginPane.loginBin');
				a = Planner.getPath('loginPage.loginPane.createAccountBin');
				$(Planner.Utility.toId(a)).animate({translateX: '+=330'}, 500);
				$(Planner.Utility.toId(b)).animate({translateX: '-=20'}, 500);
				SC.Timer.schedule({
					action: function(){
						Planner.Animation.oneUp(a, b);
			  		$(Planner.Utility.toId(a)).animate({translateX: '-=330'}, 500);
			  		$(Planner.Utility.toId(b)).animate({translateX: '+=20'}, 500);
					}, 
					interval: 500
				});
				break;
		}
 		$('#'+Planner.getPath('loginPage.loginPane.loginHeader').get('layer').id).fadeToggle(700);
		$('#'+Planner.getPath('loginPage.loginPane.createAccountButton').get('layer').id).slideToggle(1000);
		$('#'+Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer').id).slideToggle(1000);
		$('#'+Planner.getPath('loginPage.loginPane.rememberedAccountButton').get('layer').id).slideToggle(1000);	
	},
	// Increase Z-Index by one, put 'over' over 'under'
	oneUp: function(over, under){
		newIndex = Number($(under.get('layer')).css('z-index')) + 1;
		$(over.get('layer')).css('z-index', newIndex)
	},
	fadeIn: function(item, time){
		if (!time) time = 700;
		$(Planner.Utility.id(item)).fadeIn(700);
	},
	fadeOut: function(item, time){
		if(!time) time = 700;
		$(Planner.Utility.id(item)).fadeOut(700);
	}
})