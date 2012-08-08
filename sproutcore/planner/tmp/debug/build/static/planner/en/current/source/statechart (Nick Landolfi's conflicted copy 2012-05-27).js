Planner.loginHeader = Planner.getPath('loginPage.loginPane.loginHeader');
Planner.loginBin = Planner.getPath('loginPage.loginPane.loginBin');
Planner.createAccountBin = Planner.getPath('loginPage.loginPane.createAccountBin');
Planner.forgotAccountBin = Planner.getPath('loginPage.loginPane.forgotPasswordBin');
Planner.createAccountButton = Planner.getPath('loginPage.loginPane.createAccountButton');
Planner.forgotPasswordButton = Planner.getPath('loginPage.loginPane.forgotPasswordButton');
Planner.rememberedAccountButton = Planner.getPath('loginPage.loginPane.rememberedAccountButton');





Planner.statechart = SC.Statechart.create({
  trace: YES,
	initialState: 'LOADED',
  
	LOADED: SC.State.design({ 
	  enterState: function() {
	  	this.gotoState('LOGGED_OUT');
	  },

	  exitState: function() {
	    //Nothing needed here as of right now, we may need to implement some sort of loading thing in the future
	  }
	}),

	

	LOGGED_OUT: SC.State.design({ 
	  enterState: function() {
	  	// If we are logged out, show the login screen
	    Planner.getPath('loginPage.loginPane').append();
	  },

	  // When we enter the LOGGED_OUT state, automatically enter the LOGGING_IN substate
	  initialSubstate: 'LOGGING_IN',

	  LOGGING_IN: SC.State.extend({
	  	initialSubstate: 'PROVIDING_CREDENTIALS',
	  	firstEnter: true,
	  	enterState: function(){
	  		// Not sure why we need == true, i think it may think true is a string?
	  		if(this.firstEnter == true){
		  		// The things we dont need, we can hide
		  		Planner.Utility.hide([
		  			Planner.getPath('loginPage.loginPane.loginHeader'),
		  			Planner.getPath('loginPage.loginPane.rememberedAccountButton')
		  		]);
		  		// Make sure that loginBin is on top of createAccountBin
		  		Planner.Utility.oneUp(Planner.getPath('loginPage.loginPane.loginBin'), Planner.getPath('loginPage.loginPane.createAccountBin'));
		  		this.set('firstEnter', 'false');
		  		return YES;
	  		}else{
		  		/* This is the card switch animation
		  		*/
		  		$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=350'}, 500);
		  		$('#'+Planner.getPath('loginPage.loginPane.createAccountBin').get('layer').id).animate({translateX: '+=20'}, 500);
		  		SC.Timer.schedule({
					  target: this, action: 'moveBack', interval: 500
					});
					$('#'+Planner.getPath('loginPage.loginPane.loginHeader').get('layer').id).fadeToggle(700);
					$('#'+Planner.getPath('loginPage.loginPane.createAccountButton').get('layer').id).slideToggle(1000);
					$('#'+Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer').id).slideToggle(1000);
					$('#'+Planner.getPath('loginPage.loginPane.rememberedAccountButton').get('layer').id).slideToggle(1000);
				}
	  	},
	  	moveBack: function(){
	  		Planner.Utility.oneUp(Planner.getPath('loginPage.loginPane.loginBin'), Planner.getPath('loginPage.loginPane.createAccountBin'));
	  		$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=350'}, 500);
	  		$('#'+Planner.getPath('loginPage.loginPane.createAccountBin').get('layer').id).animate({translateX: '-=20'}, 500);
	  	},
	  	/* 
	  		These four functions repeat in CREATING_ACCOUNT
	  		but they are distinct, as they alter different
	  		fields. The idea, however, is the same. When we
	  		are processing the input, disable the fields, 
	  		then re-enable them when we are done. A focus 
	  		event will forward us back to a state where
	  		the user is typing information. 
	  		NOTE: getFields() is really just a helper
	  		method and eventually should be moved to
	  		Planner.Utility and written for duplicity
	  		in both of these situations. 
			*/
	  	disableFields: function(){
	  		this.getFields().forEach(
	  			function(item){
	  				item.set('isEditable', NO);
	  				item.set('focused', NO);
	  			}
	  		)
	  	},
	  	enableFields: function(){
	  		this.getFields().forEach(
	  			function(item){
	  				item.set('isEditable', YES);
	  				item.set('focused', NO);
	  			}
	  		)
	  	},
	  	fieldFocused: function(){
	  		this.gotoState('PROVIDING_CREDENTIALS')
	  	},
	  	getFields: function(){
	  		fields = [
	  		Planner.getPath('loginPage.loginPane.loginBin.username'),
  			Planner.getPath('loginPage.loginPane.loginBin.password'),
  			]
  			return fields;
	  	},
	  	PROVIDING_CREDENTIALS: SC.State.design({
		  	enterState: function(){
		  		
		  	},
		  	checkInfo: function() {
		  		// Get Values
		  		username = Planner.getPath('loginPage.loginPane.loginBin.username').value;
		  		password = Planner.getPath('loginPage.loginPane.loginBin.password').value;
		  		
		  		//Validity Checks
		  		isUsername = Planner.Utility.isComplete(username);
		  		isPassword = Planner.Utility.isComplete(password);
		  		//Error Statements
		  		neither = 'Please supply a Username & Password';
		  		noUsername = 'Please supply a Username';
		  		noPassword = 'Please supple a Password';

		  		if(!isUsername && !isPassword){
		  			this.showError(neither, 1, 2);
		  			return YES;	
		  		}

		  		if(!isUsername){
						this.showError(noPassword, 1);
		  			return YES;	
		  		}

		  		if(!isPassword){
		  			this.showError(noUsername, 2);
		  			return YES;	
		  		}

		  		if(isUsername && isPassword){
			  		Planner.currentUser.sendLogin(username, password);
			  		return YES;
			  	}
			  	return YES;
		  	},

		  	blurEffect: function() {
		  	},
		  	unBlurEffect: function() {
		  	},

		  	createAccount: function(){
		  		this.gotoState('CREATING_ACCOUNT');
		  	},
		  	forgotPassword: function(){
		  		this.gotoState('FORGOT_PASSWORD');
		  	},
		  	// Switches the state and forwards the request
		  	showError: function(error, num){
		  		this.gotoState('LOGIN_ERROR');
		  		Planner.statechart.invokeStateMethod('showError', error, num)
		  	}
	  	}),
			LOGIN_ERROR: SC.State.design({
				showError: function(error, num, num2){
	  			if(num || num2 ){
	  				if(num == 1){
	  					$(Planner.getPath('loginPage.loginPane.loginBin.username').get('layer')).css('border-color', 'red');
	  				}
	  				if(num == 2){
	  					$(Planner.getPath('loginPage.loginPane.loginBin.password').get('layer')).css('border-color', 'red');
	  				}
	  			}
	  			// Set the value of the Error Bin to the error recieved, inside of runloop to force a controller update
	  			SC.RunLoop.begin();
	  			Planner.currentUser.set('loginError', error);
	  			SC.RunLoop.end()
	  			// Transitions, making use of jQuery
	  			$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.error').get('layer')).fadeIn();
	  			// Re-enable all the text fields 
	  			this.parentState.enableFields();
	  		},
	  		exitState: function(){
	  			$(Planner.getPath('loginPage.loginPane.loginBin.error').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeIn();
	  		},
			}),
	  	LOGIN_LOADING: SC.State.design({
				enterState: function(){
					//this.rotateSpinner();
					//Planner.getPath('loginPage.loginBin.login.lowBin').replaceContent(Planner.getPath('loginPage.loader'));
				},

				rotateSpinner: function(){
					/*Planner.getPath('loginPage.loader').animate({rotateZ: 360}, 3);
					this.invokeLater(this.rotateSpinner, 5000)*/
				}
			}),
			FORGOT_PASSWORD: SC.State.design({
	  		enterState: function(){
	  			this.parentState.enableFields();
	  			$(Planner.getPath('loginPage.loginPane.createAccountButton').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer')).fadeOut();
	  			Planner.getPath('loginPage.loginPane.forgotAccountBin').animate({centerY:170 }, {duration: 100, timing:'ease-in-out'});
	  		},
	  		exitState: function(){
	  			Planner.getPath('loginPage.loginBin.forgotAccountBin').animate({centerY:130}, 2000);
	  			$(Planner.getPath('loginPage.loginPane.createAccountButton').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer')).fadeOut();
	  		}
	  	}),
	  }),
	  CREATING_ACCOUNT: SC.State.design({
	  	enterState: function(){
	  		/* This is the card switch animation
	  		*/
	  		$('#'+Planner.getPath('loginPage.loginPane.createAccountBin').get('layer').id).animate({translateX: '+=350'}, 500);
	  		$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=20'}, 500);
	  		SC.Timer.schedule({
				  target: this, action: 'moveBack', interval: 500
				});
				$('#'+Planner.getPath('loginPage.loginPane.loginHeader').get('layer').id).fadeToggle(700);
				$('#'+Planner.getPath('loginPage.loginPane.createAccountButton').get('layer').id).slideToggle(1000);
				$('#'+Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer').id).slideToggle(1000);
				$('#'+Planner.getPath('loginPage.loginPane.rememberedAccountButton').get('layer').id).slideToggle(1000);	
				Planner.Utility.hide([Planner.getPath('loginPage.loginPane.forgotAccountButton')]);
	  	},
	  	moveBack: function(){
	  		Planner.Utility.oneUp(Planner.getPath('loginPage.loginPane.createAccountBin'), Planner.getPath('loginPage.loginPane.loginBin'));
	  		$('#'+Planner.getPath('loginPage.loginPane.createAccountBin').get('layer').id).animate({translateX: '-=350'}, 500);
	  		$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=20'}, 500);

	  	},
	  	alreadyHaveAccount: function(){
	  		this.gotoState('LOGGING_IN')
	  	},
	  	disableFields: function() {
	  		this.getFields().forEach(
	  			function(item){
	  				item.set('isEditable', NO);
	  				item.set('focused', NO);
	  			}
	  		)
	  	},
	  	enableFields: function() {
				this.getFields().forEach(
	  			function(item){
	  				item.set('isEditable', YES);
	  				item.set('focused', NO);
	  			}
	  		)
	  	},
	  	fieldFocused: function(){
	  		this.gotoState('REGISTERING')
	  	},
	  	getFields: function(){
	  		fields = [
	  		Planner.getPath('loginPage.loginPane.createAccountBin.username'),
  			Planner.getPath('loginPage.loginPane.createAccountBin.password'),
  			Planner.getPath('loginPage.loginPane.createAccountBin.passwordConfirmation'),
  			Planner.getPath('loginPage.loginPane.createAccountBin.firstname'),
  			Planner.getPath('loginPage.loginPane.createAccountBin.lastname'),
  			Planner.getPath('loginPage.loginPane.createAccountBin.email')
  			]
  			return fields;
	  	},
	  	initialSubstate: 'REGISTERING',
	  	REGISTERING: SC.State.design({
		  	checkInfo: function(){
		  		// Collect values
		  		username = Planner.getPath('loginPage.loginPane.createAccountBin.username').value;
		  		password = Planner.getPath('loginPage.loginPane.createAccountBin.password').value;
		  		passwordConfirmation = Planner.getPath('loginPage.loginPane.createAccountBin.passwordConfirmation').value;
		  		firstname = Planner.getPath('loginPage.loginPane.createAccountBin.firstname').value;
		  		lastname = Planner.getPath('loginPage.loginPane.createAccountBin.lastname').value;
		  		email = Planner.getPath('loginPage.loginPane.createAccountBin.email').value;
		  		
		  		// First, check to see if all elements of the form are filled
		  		// Error Strings
		  		noFName = 'Please provide a First Name';
		  		noLName = 'Please provide a Last Name';
		  		noEmail = 'Please provide an Email';
		  		noUsername = 'Please provide a Username';
		  		noPassword = 'Please provide a Password';
		  		noPasswordConfirmation = 'Please confirm your Password';

		  		if(!Planner.Utility.isComplete(firstname)){
		  			this.showError(noFName, 1);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(lastname)){
		  			this.showError(noLName, 2);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(email)){
		  			this.showError(noEmail, 3);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(username)){
		  			this.showError(noUsername, 4);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(password)){
		  			this.showError(noPassword, 5);
		  			return YES;
		  		}
		  		if(!Planner.Utility.isComplete(passwordConfirmation)){
		  			this.showError(noPasswordConfirmation, 6);
		  			return YES;
		  		}

		  		/*
		  			If we made it here, then we can assume that all fields have real values
		  			So now we:
		  				Perform all of our specific validations
		  				Then:
		  					Send the Request or Send a specific error respsonse
		  		*/

		  		/* Specific Validations: (In this Order)
		  			- Username is over 3 characters and under 10 characters
		  		  - Password is over 5 characters and under 10 characters
						- Passwords match
						- Email is legitimate
		  		*/
		  		usernameCheck = (username.length >= 3 && username.length <= 10);
		  		passwordCheck = (password.length >= 5 && password.length <= 10);
		  		passwords = (password === passwordConfirmation);
		  		isEmail = email.match(/.+@.+\..{2,4}/);

		  		// If we are good, create the account
		  		if(usernameCheck && passwordCheck && passwords && isEmail){
		  			Planner.currentUser.sendNewAccount(username, password, firstname, lastname, email);
		  			this.parentState.disableFields();
		  			return YES;
		  		}

		  		// Otherwise prepare to send detailed feedback
		  		// Error Strings
		  		badEmail = 'Please provide a correct email';
					usernameShort = 'Username must be 3 characters or more';
		  		usernameLong = 'Username must be 10 characters or less';
		  		passwordShort = 'Password must be 5 characters or more';
		  		passwordLong = 'Password must be 10 characters or less';
		  		passwordsDif = 'Passwords do not match';

		  		/* Format
						showError(<errorString, <number of the error box>)
						Always return YES to break the function
		  		*/

		  		// Email
		  		if(!isEmail){
		  			this.showError(badEmail, 3);
		  			return YES;
		  		}

		  		// Username Feedback
		  		if(!usernameCheck){
		  			if(username.length < 3){
		  				this.showError(usernameShort, 4);
		  				return YES;
		  			}else if (username.length > 10){
		  				this.showError(usernameLong), 4;
		  				return YES;
		  			}
		  		}

		  		// Password Feedback
		  		if(!passwordCheck || !passwords){
		  			if(password.length < 5){
		  				this.showError(passwordShort, 5);
		  				return YES;
		  			}else if(password.length > 10){
		  				this.showError(passwordLong, 5);
		  				return YES;
		  			}else if(!passwords){
		  				this.showError(passwordsDif, 6);
		  				return YES;
		  			}
		  		}
		  	},
		  	// Switches the state and forwards the request
		  	showError: function(error, num){
		  		this.gotoState('CREATION_ERROR');
		  		Planner.statechart.invokeStateMethod('showError', error, num)
		  	}
	  	}),
	  	CREATION_ERROR: SC.State.design({
	  		showError: function(error, num){
	  			if(num){
	  				if(num == 1){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.firstname').get('layer')).css('border-color', 'red');
	  				}else if(num == 2){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.lastname').get('layer')).css('border-color', 'red');
	  				}else if(num == 3){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.email').get('layer')).css('border-color', 'red');
	  				}else if(num == 4){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.username').get('layer')).css('border-color', 'red');
	  				}else if(num == 5){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.password').get('layer')).css('border-color', 'red');
	  				}else if(num == 6){
	  					$(Planner.getPath('loginPage.loginPane.createAccountBin.passwordConfirmation').get('layer')).css('border-color', 'red');
	  				}
	  			}
	  			// Set the value of the Error Bin to the error recieved, inside of runloop to force a controller update
	  			SC.RunLoop.begin();
	  			Planner.currentUser.set('accountCreationError', error);
	  			SC.RunLoop.end()
	  			// Transitions, making use of jQuery
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.submit').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.error').get('layer')).fadeIn();
	  			// Re-enable all the text fields 
	  			this.parentState.enableFields();
	  		},
	  		exitState: function(){
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.error').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.submit').get('layer')).fadeIn();
	  		},
	  	}),
  		CREATION_LOADING: SC.State.design({
				enterState: function(){
		  		$(Planner.getPath('loginPage.loginPane.createAccountBin.submit').get('layer')).fadeOut();
		  		//$(Planner.getPath('loginPage.createAccountBin.login.spinner').get('layer')).fadeIn();
		  		//this.spin();
				},
				spin: function(){
					if(Planner.statechart.currentStates().indexOf('CREATION_LOADING') != -1){
						//Planner.getPath('loginPage.createAccountBin.login.spinner').animate({rotateZ: 360}, 1);
						invokelater('spin', 1000);
					}
				},
				exitState: function(){
					//$(Planner.getPath('loginPage.createAccountBin.login.spinner').get('layer')).fadeOut();
		  		//$(Planner.getPath('loginPage.createAccountBin.login.submit').get('layer')).fadeIn();
				}
			}),
	  }),
	}),

  LOGGED_IN: SC.State.design({
	  enterState: function() {
			Planner.getPath('loginPage.loginPane').remove();
	    Planner.getPath('plannerPage.plannerPane').append();
	  },

	  exitState: function() {
	  	Planner.getPath('plannerPage.plannerPane').remove();
	  },

    initialSubstate: 'VIEWING_PLANNER',
    VIEWING_PLANNER: SC.State.design({ 
			  substatesAreConcurrent: YES,
			  MAIN_VIEW: SC.State.design({
			  	initialSubstate: 'WEEK_PLANNER',
			  	DAY_PLANNER: SC.State.design({}),
			  	WEEK_PLANNER: SC.State.design({}),
			  	MONTH_PLANNER: SC.State.design({}),
			  }),
			  SIDE_VIEW: SC.State.design({
			  	initialSubstate: 'COURSES',
			  	COURSES: SC.State.design({}),
			  	ASSIGNMENTS: SC.State.design({}),
			  	TESTS: SC.State.design({}),
			  	NOTES: SC.State.design({}),
			  	ASSIGNMENT: SC.State.design({}),
			  	TEST: SC.State.design({}),
			  	NOTE: SC.State.design({}),
			  	FEEDBACK: SC.State.design({}),
			  	ABOUT: SC.State.design({})
			  })
		}),
		COURSE_SIGNUP: SC.State.design({})
	}),
});

Planner.Utility = SC.Object.create({
	// Checks if a value exists
	isComplete: function(value){
		// Simply value logic
		if (SC.none(value)) { return false; }
		if (! SC.none(value.length)) { return value.length > 0; }
		return YES;
	},
	// Sets opacity to zero, taks an array
	hide: function(items){
		items.forEach(function(item){
			$(item.get('layer')).css('display', 'none');
		})
	},
	// Increase Z-Index by one, put 'over' over 'under'
	oneUp: function(over, under){
		newIndex = Number($(under.get('layer')).css('z-index')) + 1;
		$(over.get('layer')).css('z-index', newIndex)
	}
})

// TransformJS
function Matrix(){}var Sylvester={version:"0.1.3",precision:1e-6};Matrix.prototype={e:function(a,b){return a<1||a>this.elements.length||b<1||b>this.elements[0].length?null:this.elements[a-1][b-1]},map:function(a){var b=[],c=this.elements.length,d=c,e,f,g=this.elements[0].length,h;do{e=d-c,f=g,b[e]=[];do h=g-f,b[e][h]=a(this.elements[e][h],e+1,h+1);while(--f)}while(--c);return Matrix.create(b)},multiply:function(a){if(!a.elements)return this.map(function(b){return b*a});var b=a.modulus?!0:!1,c=a.elements||a;typeof c[0][0]=="undefined"&&(c=Matrix.create(c).elements);if(!this.canMultiplyFromLeft(c))return null;var d=this.elements.length,e=d,f,g,h=c[0].length,i,j=this.elements[0].length,k=[],l,m,n;do{f=e-d,k[f]=[],g=h;do{i=h-g,l=0,m=j;do n=j-m,l+=this.elements[f][n]*c[n][i];while(--m);k[f][i]=l}while(--g)}while(--d);var c=Matrix.create(k);return b?c.col(1):c},x:function(a){return this.multiply(a)},canMultiplyFromLeft:function(a){var b=a.elements||a;return typeof b[0][0]=="undefined"&&(b=Matrix.create(b).elements),this.elements[0].length==b.length},setElements:function(a){var b,c=a.elements||a;if(typeof c[0][0]!="undefined"){var d=c.length,e=d,f,g,h;this.elements=[];do{b=e-d,f=c[b].length,g=f,this.elements[b]=[];do h=g-f,this.elements[b][h]=c[b][h];while(--f)}while(--d);return this}var i=c.length,j=i;this.elements=[];do b=j-i,this.elements.push([c[b]]);while(--i);return this}},Matrix.create=function(a){var b=new Matrix;return b.setElements(a)},$M=Matrix.create,function(a){if(!a.cssHooks)throw"jQuery 1.4.3+ is needed for this plugin to work";var b="transform",c,d,e,f,g,h=b.charAt(0).toUpperCase()+b.slice(1),i=["Moz","Webkit","O","MS"],j=document.createElement("div");if(b in j.style)d=b,e=j.style.perspective!==undefined;else for(var k=0;k<i.length;k++){c=i[k]+h;if(c in j.style){d=c,i[k]+"Perspective"in j.style?e=!0:f=!0;break}}d||(g="filter"in j.style,d="filter"),j=null,a.support[b]=d;var l=d,m={rotateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,Math.cos(a),Math.sin(-a),0],[0,Math.sin(a),Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateY:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),0,Math.sin(a),0],[0,1,0,0],[Math.sin(-a),0,Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateZ:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),Math.sin(-a),0,0],[Math.sin(a),Math.cos(a),0,0],[0,0,1,0],[0,0,0,1]]):$M([[Math.cos(a),Math.sin(-a),0],[Math.sin(a),Math.cos(a),0],[0,0,1]])}},scale:{defaultValue:1,matrix:function(a){return e?$M([[a,0,0,0],[0,a,0,0],[0,0,a,0],[0,0,0,1]]):$M([[a,0,0],[0,a,0],[0,0,1]])}},translateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[a,0,0,1]]):$M([[1,0,0],[0,1,0],[a,0,1]])}},translateY:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,a,0,1]]):$M([[1,0,0],[0,1,0],[0,a,1]])}},translateZ:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,a,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}}},n=function(b){var c=a(b).data("transforms"),d;e?d=$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]):d=$M([[1,0,0],[0,1,0],[0,0,1]]);for(var h in m)d=d.x(m[h].matrix(c[h]||m[h].defaultValue));e?(s="matrix3d(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+","+d.e(1,3).toFixed(10)+","+d.e(1,4).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+","+d.e(2,3).toFixed(10)+","+d.e(2,4).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+","+d.e(3,2).toFixed(10)+","+d.e(3,3).toFixed(10)+","+d.e(3,4).toFixed(10)+",",s+=d.e(4,1).toFixed(10)+","+d.e(4,2).toFixed(10)+","+d.e(4,3).toFixed(10)+","+d.e(4,4).toFixed(10),s+=")"):f?(s="matrix(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+"px,"+d.e(3,2).toFixed(10)+"px",s+=")"):g&&(s="progid:DXImageTransform.Microsoft.",s+="Matrix(",s+="M11="+d.e(1,1).toFixed(10)+",",s+="M12="+d.e(1,2).toFixed(10)+",",s+="M21="+d.e(2,1).toFixed(10)+",",s+="M22="+d.e(2,2).toFixed(10)+",",s+="SizingMethod='auto expand'",s+=")",b.style.top=d.e(3,1),b.style.left=d.e(3,2)),b.style[l]=s},o=function(b){return a.fx.step[b]=function(c){a.cssHooks[b].set(c.elem,c.now+c.unit)},{get:function(c,d,e){var f=a(c).data("transforms");return f===undefined&&(f={},a(c).data("transforms",f)),f[b]||m[b].defaultValue},set:function(c,d){var e=a(c).data("transforms");e===undefined&&(e={});var f=m[b];typeof f.apply=="function"?e[b]=f.apply(e[b]||f.defaultValue,d):e[b]=d,a(c).data("transforms",e),n(c)}}};if(l)for(var p in m)a.cssHooks[p]=o(p),a.cssNumber[p]=!0}(jQuery)
; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');