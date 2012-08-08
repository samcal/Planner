sc_require('utility');
Planner.Animation = SC.Object.create({
	// Basic Bookmark Animations:  Slide Up --> Changes the Text --> Slides back down (Handles Timing)
	SwitchBookmark: function(title, noHide){
		b = Planner.getPath('loginPage.loginPane.bookmark');
		// If we passed this parameter, we do not need to slide up.
		if(!noHide) $(Planner.Utility.id(b)).animate({translateY: '-=35'}, 500);
		// Set a timer to execute the value reset and slide down to occur in 300 milliseconds. 
		SC.Timer.schedule({
			action: function(){	
				$(Planner.Utility.id(b)).animate({translateY: '+=35'}, 500);
				b.set('value', title);
			},
			interval: 300
		});
	},
	LoginCardSwitch: function(toSwitchTo, directionEmerging){
		var a, b;
		switch(toSwitchTo){
			case 1 :
				a = Planner.getPath('loginPage.loginPane.loginBin');
				b = Planner.getPath('loginPage.loginPane.createAccountBin');
				$(Planner.Utility.id(a)).animate({translateX: '-=330'}, 500);
				$(Planner.Utility.id(b)).animate({translateX: '+=20'}, 500);
				SC.Timer.schedule({
					action: function(){
						Planner.Animation.oneUp(a, b);
			  		$(Planner.Utility.id(a)).animate({translateX: '+=330'}, 500);
			  		$(Planner.Utility.id(b)).animate({translateX: '-=20'}, 500);
					}, 
					interval: 500
				});
				break;
			case 2:
				b = Planner.getPath('loginPage.loginPane.loginBin');
				a = Planner.getPath('loginPage.loginPane.createAccountBin');
				$(Planner.Utility.id(a)).animate({translateX: '+=330'}, 500);
				$(Planner.Utility.id(b)).animate({translateX: '-=20'}, 500);
				SC.Timer.schedule({
					action: function(){
						Planner.Animation.oneUp(a, b);
			  		$(Planner.Utility.id(a)).animate({translateX: '-=330'}, 500);
			  		$(Planner.Utility.id(b)).animate({translateX: '+=20'}, 500);
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

	// Shakes the bin; -5 +10 -10 +10 -10 +5  == 0
	shake: function(view){
		id = Planner.Utility.id(view);
		$(id).animate({translateX: '-=5'}, 100);
		$(id).animate({translateX: '+=10'}, 100);
		$(id).animate({translateX: '-=10'}, 100);
		$(id).animate({translateX: '+=10'}, 100);
		$(id).animate({translateX: '-=10'}, 100);
		$(id).animate({translateX: '+=5'}, 100);
	},


	// Both hide() and show() deal with the 'display' property, items is an array or single object
	hide: function(views){
		if(views instanceof Array){
			if(views.length == 1) SC.info('The hide method now supports single objects.')
 			views.forEach(function(view){
				$(Planner.Utility.id(view)).css('display', 'none');
			})
		}else {
			$(Planner.Utility.id(views)).css('display', 'none');
		}
	},


	show: function(views){
		if(views instanceof Array){
			if(views.length == 1) SC.info('The show method now supports single objects.')
			views.forEach(function(view){
				$(Planner.Utility.id(view)).css('display', 'block');
			})
		}else {
			$(Planner.Utility.id(views)).css('display', 'block');
		}
	},


	// Increase Z-Index by one, put 'over' over 'under'
	oneUp: function(over, under){
		newIndex = Number($(under.get('layer')).css('z-index')) + 1;
		$(over.get('layer')).css('z-index', newIndex)
	},

	fadeIn: function(views, time){
		if (!time) var time = 700;
		if(views instanceof Array){
			if(views.length == 1) SC.info('The fadeIn method now supports single objects.');
			views.forEach( function(view){
				$(Planner.Utility.id(view)).fadeIn(time);
			});
		}else{
			$(Planner.Utility.id(views)).fadeIn(time);
		}
	},
	fadeOut: function(views, time){
		if(!time) var time = 700;
		if(views instanceof Array){
			if(views.length == 1) SC.info('The fadeOut method now supports single objects.');
			views.forEach( function(view){
				$(Planner.Utility.id(view)).fadeOut(time);
			});
		}else {
			$(Planner.Utility.id(views)).fadeOut(time);
		}
	}
})