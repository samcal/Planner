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
		return YES;
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
		return YES;
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
		return YES;
	},


	// Both hide() and show() deal with the 'display' property, items is an array or single object
	hide: function(views){
		if(!(views instanceof Array)) views = [views];
			views.forEach(function(view){
			$(Planner.Utility.id(view)).css('display', 'none');
		})
		return YES;
	},


	show: function(views){
		if(!(views instanceof Array)) views = [views];
		views.forEach(function(view){
			$(Planner.Utility.id(view)).css('display', 'block');
		})
		return YES;
	},

	// Increase Z-Index by one, put 'over' over 'under'
	oneUp: function(over, under){
		newIndex = Number($(under.get('layer')).css('z-index')) + 1;
		$(over.get('layer')).css('z-index', newIndex);
		return YES;
	},

	fadeIn: function(views, time){
		if (!time) var time = 700;
		if(!(views instanceof Array)) views = [views];
		views.forEach( function(view){
			$(Planner.Utility.id(view)).fadeIn(time);
		});
		return YES;
	},
	fadeOut: function(views, time){
		if(!time) time = 700;
		if(!(views instanceof Array)) views = [views];
		views.forEach( function(view){
			$(Planner.Utility.id(view)).fadeOut(time);
		});
		return YES;
	},

	fadeToggle: function(views, time){
		if(!time) time = 700;
		if(!(views instanceof Array)) views = [views];
		views.forEach(function(view){
			$(Planner.Utility.id(view)).fadeToggle(time);
		})
		return YES;
	},

	slideToggle: function(views, time){
		if(!time) time = 700;
		if(!(views instanceof Array)) views = [views];
		views.forEach(function(view){
			$(Planner.Utility.id(view)).slideToggle(time);
		});
		return YES;
	},

	css: function(views, property, value){
		if(!(views instanceof Array)) views = [views];
		views.forEach(function(view){
			$(Planner.Utility.id(view)).css(property, value);
		});
		return YES;
	}, 

	sizeText: function(view, percent){
		height = percent * $(Planner.Utility.id(view)).css('height').slice(0,-2);
		this.css(view, 'font-size', height+'px');
		return YES;
	},

})