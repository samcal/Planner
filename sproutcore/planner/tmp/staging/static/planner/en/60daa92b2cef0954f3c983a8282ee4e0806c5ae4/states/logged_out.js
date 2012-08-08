sc_require('statechart');
Planner.LOGGED_OUT = SC.State.design({ 
	  enterState: function() {
	  	// If we are logged out, show the login screen
	    Planner.getPath('loginPage.loginPane').append();
	  },
	  firstLoad: true,
	  exitState: function(){
	  	// Let us know that we are leaving the state, and on the next entrance, to render originally
	  	this.set('firstLoad', true); 	
	  },
	  // When we enter the LOGGED_OUT state, automatically enter the LOGGING_IN substate
	  initialSubstate: 'LOGGING_IN',
	  LOGGING_IN: SC.State.design({
	  	initialSubstate: 'PROVIDING_CREDENTIALS',
	  	enterState: function(){
	  		// Not sure why we need == true, i think it may think true is a string?
	  		if(this.parentState.firstLoad == true){
		  		// The things we dont need, we can hide
		  		Planner.Utility.hide([
		  			Planner.getPath('loginPage.loginPane.loginHeader'),
		  			Planner.getPath('loginPage.loginPane.rememberedAccountButton'),
		  		]);
		  		// Make sure that loginBin is on top of createAccountBin
		  		Planner.Animation.oneUp(Planner.getPath('loginPage.loginPane.loginBin'), Planner.getPath('loginPage.loginPane.createAccountBin'));
		  		// Fade in the date
			    $(Planner.getPath('loginPage.loginPane.date').get('layer')).fadeToggle(1500);
			    // Switch bookmark, second param true so its knows not to slide up, just down.
		  		Planner.Animation.SwitchBookmark('Planner Login', true);
		  		// Now we have loaded once, never again.
		  		this.parentState.set('firstLoad', 'false');
		  		return YES;
	  		}else{
		  		/* This is the card switch animation
		  		*/
		  		$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=330'}, 500);
		  		$('#'+Planner.getPath('loginPage.loginPane.createAccountBin').get('layer').id).animate({translateX: '+=20'}, 500);
		  		SC.Timer.schedule({
					  target: this, action: 'moveBack', interval: 500
					});
					$('#'+Planner.getPath('loginPage.loginPane.loginHeader').get('layer').id).fadeToggle(700);
					$('#'+Planner.getPath('loginPage.loginPane.createAccountButton').get('layer').id).slideToggle(1000);
					$('#'+Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer').id).slideToggle(1000);
					$('#'+Planner.getPath('loginPage.loginPane.rememberedAccountButton').get('layer').id).slideToggle(1000);
					Planner.Animation.SwitchBookmark('Planner Login');
				}
	  	},
	  	moveBack: function(){
	  		Planner.Animation.oneUp(Planner.getPath('loginPage.loginPane.loginBin'), Planner.getPath('loginPage.loginPane.createAccountBin'));
	  		$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=330'}, 500);
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
	  		this.gotoState('PROVIDING_CREDENTIALS');
	  	},
	  	// Returns the fields that could possibly be visible in this state
	  	getFields: function(){
	  		fields = [
		  		Planner.getPath('loginPage.loginPane.loginBin.username'),
	  			Planner.getPath('loginPage.loginPane.loginBin.password'),
	  			Planner.getPath('loginPage.loginPane.forgotAccountBin.email')
  			]
  			return fields;
	  	},
	  	PROVIDING_CREDENTIALS: SC.State.design({
		  	checkInfo: function() {
		  		// Get Values
		  		username = Planner.getPath('loginPage.loginPane.loginBin.username').value;
		  		password = Planner.getPath('loginPage.loginPane.loginBin.password').value;
		  		
		  		// Validity Checks
		  		isUsername = Planner.Utility.isComplete(username);
		  		isPassword = Planner.Utility.isComplete(password);
		  		// Error Statements
		  		neither = 'Please supply a Username & Password';
		  		noUsername = 'Please supply a Username';
		  		noPassword = 'Please supply a Password';

		  		if(!isUsername && !isPassword){
		  			this.showError(neither, 1, 2);
		  			return YES;	
		  		}

		  		if(!isUsername){
						this.showError(noUsername, 1);
		  			return YES;	
		  		}

		  		if(!isPassword){
		  			this.showError(noPassword, 2);
		  			return YES;	
		  		}

		  		if(isUsername && isPassword){
		  			this.parentState.disableFields();
			  		Planner.currentUser.sendLogin(username, password);
			  		return YES;
			  	}
			  	return YES;
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
		  	},
		  	showStatus: function(status){
		  		this.gotoState('LOGIN_STATUS');
		  		Planner.statechart.invokeStateMethod('showStatus', status)
		  	}
	  	}),
			LOGIN_ERROR: SC.State.design({
				showError: function(error, num, num2){
					// We Hite the CreateAccountBin so that when login shakes, it doesnt reveal the bin behind it.
					Planner.Utility.hide([Planner.getPath('loginPage.loginPane.createAccountBin')]);

					// Back and Forth shake -5 +10 -10 +10 -10 +5  == 0
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=5'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=10'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=10'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=10'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=10'}, 100);
					$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=5'}, 100);

					// If we were given the number of the invalid text field.
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
	  			/*
	  				- Reshow the Create Account Bin since we won't be doing any more shaking.
	  				- Hide the error
	  				- Reshow the login 'submit' button
	  				- Resets the border colors in case they are still red
	  			*/
	  			Planner.Utility.show([Planner.getPath('loginPage.loginPane.createAccountBin')]);
	  			$(Planner.getPath('loginPage.loginPane.loginBin.error').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeIn();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.username').get('layer')).css('border-color', 'maroon');
	  			$(Planner.getPath('loginPage.loginPane.loginBin.password').get('layer')).css('border-color', 'maroon');
	  		},
	  		// createAccount() and forgotPassword() simply forward those requests to the correct states.
	  		createAccount: function(){
		  		this.gotoState('CREATING_ACCOUNT');
		  	},
		  	forgotPassword: function(){
		  		this.gotoState('FORGOT_PASSWORD');
		  	},
			}),
			LOGIN_STATUS: SC.State.design({
				showStatus: function(status){
					// Set status, inside of runloop to force a controller update
					SC.RunLoop.begin();
	  			Planner.currentUser.set('loginStatus', status);
	  			SC.RunLoop.end()
	  			// Transitions, making use of jQuery
	  			$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.status').get('layer')).fadeIn();
	  			// Re-enable all the text fields 
	  			this.parentState.enableFields();
				},
				exitState: function(){
					// Fade out status, reshow login 'submit' button
					$(Planner.getPath('loginPage.loginPane.loginBin.status').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).fadeIn();
				}
			}),
			// LOGIN LOADING NOT CURRENTLY IMPLEMENTED
	  	LOGIN_LOADING: SC.State.design({

				enterState: function(){
					//this.rotateSpinner();
					//Planner.getPath('loginPage.loginBin.login.lowBin').replaceContent(Planner.getPath('loginPage.loader'));
				},

				rotateSpinner: function(){
					/*Planner.getPath('loginPage.loader').animate({rotateZ: 360}, 3);
					this.invokeLater(this.rotateSpinner, 5000)*/
				},
				
				showError: function(error, num){
		  		this.gotoState('LOGIN_ERROR');
		  		Planner.statechart.invokeStateMethod('showError', error, num)
		  	},
			}),
			FORGOT_PASSWORD: SC.State.design({
	  		enterState: function(){
	  			/*
	  				- Switch bookmark to Password Recovery title
	  				- Call enableFields() to unfocus all fields
	  				- Slide up the createAccount and forgotAccount buttons
	  				- Move the forgot account bin into place
	  				- Focus on the Email text field
	  				- Reset the action of the submit button to have it call loginInfo
	  			*/
	  			Planner.Animation.SwitchBookmark("Password Recovery");
	  			this.parentState.enableFields();
	  			$(Planner.getPath('loginPage.loginPane.createAccountButton').get('layer')).slideToggle(1000);
	  			$(Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer')).slideToggle(1000);
	  			$('#'+Planner.getPath('loginPage.loginPane.forgotAccountBin').get('layer').id).animate({translateY: '+=45'}, 1000);
	  			Planner.getPath('loginPage.loginPane.forgotAccountBin.email').$input()[0].focus();
	  			Planner.getPath('loginPage.loginPane.loginBin.submit').set('action', 'loginInfo');
	  		},
	  		exitState: function(){
	  			/*
	  				- Switch bookmark to Planner Login title
	  				- Enable fields to unfocus
	  				- Slide back down the createAccount and forgotAccountButtons
	  				- Slide the forgotAccountBin back to its hidden position
	  				- Set a timer to, after passwordBin is out of site, reset its values to the default hints and buttons
	  				- Reset the action of the submit button to have it call the normal checkInfo()
	  			*/
	  			Planner.Animation.SwitchBookmark('Planner Login');
	  			this.parentState.enableFields();
	  			$(Planner.getPath('loginPage.loginPane.createAccountButton').get('layer')).slideToggle(1000);
	  			$(Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer')).slideToggle(1000);
	  			$('#'+Planner.getPath('loginPage.loginPane.forgotAccountBin').get('layer').id).animate({translateY: '-=45'}, 1000);
	  			SC.Timer.schedule({
	  				action:function(){
	  								Planner.getPath('loginPage.loginPane.forgotAccountBin.email').set('hint', 'Your Email');
	  								Planner.getPath('loginPage.loginPane.forgotAccountBin.send').set('title', 'Send Email');
	  							},
	  			  interval: 700});
	  			Planner.getPath('loginPage.loginPane.loginBin.submit').set('action', 'checkInfo');
	  		},
	  		checkInfo: function(){
	  			// If they got here from the try again button.
	  			Planner.getPath('loginPage.loginPane.forgotAccountBin.send').set('title', 'Send Email');

	  			// Get the email value
	  			email = Planner.getPath('loginPage.loginPane.forgotAccountBin.email').value;

	  			// Errors Responses
	  			noEmail = 'Please provide an email...'
	  			notEmail = 'Please provide a valid email'

	  			// Validity Checks
	  			// Perform this first to throw if no value was given
	  			if(!Planner.Utility.isComplete(email)){
	  				this.showError(noEmail, true);
	  				return YES;
	  			}
	  			isEmail = Planner.Utility.isEmail(email);
	  			if(!isEmail){
	  				this.showError(notEmail, true);
	  				return YES;
	  			}

	  			this.parentState.disableFields();
	  			Planner.getPath('loginPage.loginPane.forgotAccountBin.send').set('title', 'Loading...');
	  			Planner.currentUser.sendForgotPassword(email);

	  		},
	  		showError: function(error, local){
	  			/*
	  				If this state internally sent us the error local == true. 
	  				In that case we never sent the request and therefore we don't need to 'Try Again'
	  				Otherwise, if local is emtpy, !local equals true and we display the 'Try Again'
	  			*/
	  			if(!local){
	  				Planner.getPath('loginPage.loginPane.forgotAccountBin.send').set('title', 'Try Again');
	  			}
	  			/* 
	  				- Unfocus fields with enable()
	  				- Clear field value and set hint
	  			*/ 
	  			this.parentState.enableFields();
  				Planner.getPath('loginPage.loginPane.forgotAccountBin.email').set('value', '');
  				Planner.getPath('loginPage.loginPane.forgotAccountBin.email').set('hint', error);
	  		},
	  		// Forwards a login function call. Rememeber how we reset the login button's action. Here we handle it.
	  		loginInfo: function(){
	  			this.gotoState('PROVIDING_CREDENTIALS');
	  			Planner.statechart.invokeStateMethod('checkInfo');
	  		}
	  	}),
	  }),
	  CREATING_ACCOUNT: SC.State.design({
	  	enterState: function(){
	  		Planner.Animation.SwitchBookmark('Planner Registration');
	  		/* This is the card switch animation
	  		*/
	  		$('#'+Planner.getPath('loginPage.loginPane.createAccountBin').get('layer').id).animate({translateX: '+=330'}, 500);
	  		$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '-=20'}, 500);
	  		SC.Timer.schedule({
				  target: this, action: 'moveBack', interval: 500
				});
				$('#'+Planner.getPath('loginPage.loginPane.loginHeader').get('layer').id).fadeToggle(700);
				$('#'+Planner.getPath('loginPage.loginPane.createAccountButton').get('layer').id).slideToggle(1000);
				$('#'+Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer').id).slideToggle(1000);
				$('#'+Planner.getPath('loginPage.loginPane.rememberedAccountButton').get('layer').id).slideToggle(1000);	
	  	},
	  	moveBack: function(){
	  		Planner.Animation.oneUp(Planner.getPath('loginPage.loginPane.createAccountBin'), Planner.getPath('loginPage.loginPane.loginBin'));
	  		$('#'+Planner.getPath('loginPage.loginPane.createAccountBin').get('layer').id).animate({translateX: '-=330'}, 500);
	  		$('#'+Planner.getPath('loginPage.loginPane.loginBin').get('layer').id).animate({translateX: '+=20'}, 500);

	  	},
	  	exitState: function(){
	  		this.getFields().forEach(
	  			function(item){
	  				$(item.get('layer')).css('border-color', 'maroon');
	  			});
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
		  			this.gotoState('CREATION_LOADING');
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
		  		//$(Planner.getPath('loginPage.loginPane.createAccountBin.submit').get('layer')).fadeOut();
		  		//$(Planner.getPath('loginPage.createAccountBin.login.spinner').get('layer')).fadeIn();
		  		//this.spin();
				},
				spin: function(){
					//if(Planner.statechart.currentStates().indexOf('CREATION_LOADING') != -1){
						//Planner.getPath('loginPage.createAccountBin.login.spinner').animate({rotateZ: 360}, 1);
						//invokelater('spin', 1000);
					//}
				},
				exitState: function(){
					//$(Planner.getPath('loginPage.createAccountBin.login.spinner').get('layer')).fadeOut();
		  		//$(Planner.getPath('loginPage.createAccountBin.login.submit').get('layer')).fadeIn();
				},
				// Switches the state and forwards the request
		  	showError: function(error, num){
		  		this.gotoState('CREATION_ERROR');
		  		Planner.statechart.invokeStateMethod('showError', error, num)
		  	}
			}),
	  }),
	});