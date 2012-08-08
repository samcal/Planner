sc_require('statechart');
sc_require('utility');

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
  				Planner.Animation.show([
						Planner.getPath('loginPage.loginPane.forgotAccountBin'),
						Planner.getPath('loginPage.loginPane.createAccountBin'),
						Planner.getPath('loginPage.loginPane.createAccountButton'),
						Planner.getPath('loginPage.loginPane.forgotAccountButton'),
						Planner.getPath('loginPage.loginPane.loginBin')
					]);
					Planner.Utility.enableFields('login');
		  		// The things we dont need, we can hide
		  		Planner.Animation.hide([
		  			Planner.getPath('loginPage.loginPane.loginHeader'),
		  			Planner.getPath('loginPage.loginPane.rememberedAccountButton'),
		  		]);
		  		// Make sure that loginBin is on top of createAccountBin
		  		Planner.Animation.oneUp(Planner.getPath('loginPage.loginPane.loginBin'), Planner.getPath('loginPage.loginPane.createAccountBin'));
		  		// Fade in the date if we didnt just come from the planner (aka our last state was the login loader.)
			    if(this.historyState != 'LOGGED_OUT.LOGGING_IN.LOGIN_LOADING'){
			    	$(Planner.getPath('loginPage.loginPane.date').get('layer')).fadeToggle(1500);
			    }
			    // If this is the second time the user is viewing this page, we never faded in that sumbit button, we show it here.
			    Planner.Animation.show(Planner.getPath('loginPage.loginPane.loginBin.submit'));
			    // Switch bookmark, second param true so its knows not to slide up, just down.
		  		Planner.Animation.SwitchBookmark('Planner Login', true);
		  		// Now we have loaded once, never again.
		  		this.parentState.set('firstLoad', 'false');
		  		return YES;
	  		}else{
		  		Planner.Animation.LoginCardSwitch(1);
					Planner.Animation.SwitchBookmark('Planner Login');
				}
	  	},
	  	fieldFocused: function(){
	  		this.gotoState('PROVIDING_CREDENTIALS');
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
		  			Planner.Utility.disableFields('login');
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
					Planner.Animation.hide(Planner.getPath('loginPage.loginPane.createAccountBin'));

					// Back and Forth shake 
					Planner.Animation.shake(Planner.getPath('loginPage.loginPane.loginBin'));

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
	  			Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.submit'), 500);
	  			Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.loginBin.error'), 500);
	  			// Re-enable all the text fields 
	  			Planner.Utility.enableFields('login');
	  		},
	  		exitState: function(){
	  			/*
	  				- Reshow the Create Account Bin since we won't be doing any more shaking.
	  				- Hide the error
	  				- Reshow the login 'submit' button
	  				- Resets the border colors in case they are still red
	  			*/
	  			Planner.Animation.show(Planner.getPath('loginPage.loginPane.createAccountBin'));
	  			Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.error'));
	  			Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.loginBin.submit'));
	  			Planner.Animation.css([Planner.getPath('loginPage.loginPane.loginBin.username'),
	  														Planner.getPath('loginPage.loginPane.loginBin.password')],
	  														'border-color', 'maroon');
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
	  			Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.submit'), 500)
					Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.loginBin.status'), 500)
	  			// Re-enable all the text fields 
	  			Planner.Utility.enableFields('login');
				},
				exitState: function(){
					// Fade out status, reshow login 'submit' button
					Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.status'), 500)
					Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.loginBin.submit'), 500)
				}
			}),
			// LOGIN LOADING NOT CURRENTLY IMPLEMENTED
	  	LOGIN_LOADING: SC.State.design({
				enterState: function(){
					// Fade out the login button, and fade in the spinner.
					Planner.Animation.fadeToggle([Planner.getPath('loginPage.loginPane.loginBin.submit'),
															Planner.getPath('loginPage.loginPane.loginBin.spinner')], 500);
				},
				exitState: function(){
					// Fade out the spinner, we don't fade back in the sumbit button because we know
					// that if the user is still viewing the page, they recieved an error.
					Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.loginBin.spinner'), 500);
				},
				// Simple forwarding method.
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
	  			Planner.Utility.enableFields('login');
	  			Planner.Animation.slideToggle([Planner.getPath('loginPage.loginPane.createAccountButton'),
	  																		 Planner.getPath('loginPage.loginPane.forgotAccountButton')], 1000)
	  			$(Planner.Utility.id(Planner.getPath('loginPage.loginPane.forgotAccountBin'))).animate({translateY: '+=45'}, 1000);
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
	  			Planner.Utility.enableFields('login');
	  			Planner.Animation.slideToggle([Planner.getPath('loginPage.loginPane.createAccountButton'),
	  																		Planner.getPath('loginPage.loginPane.forgotAccountButton')], 1000)
	  			$(Planner.Utility.id(Planner.getPath('loginPage.loginPane.forgotAccountBin'))).animate({translateY: '-=45'}, 1000);
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

	  			Planner.Utility.disableFields('login');
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
	  			Planner.Utility.enableFields('login');
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
	  		Planner.Animation.LoginCardSwitch(2)
	  		Planner.Animation.SwitchBookmark('Planner Registration');	  		
	  	},
	  	exitState: function(){
	  		// Changing any red borders back to maroon
	  		// This breaks a rule too, _getLoginFields is private, but fuck it.
	  		Planner.Utility._getLoginFields().forEach(
	  			function(item){
	  				$(item.get('layer')).css('border-color', 'maroon');
	  			});
	  	},
	  	alreadyHaveAccount: function(){
	  		this.gotoState('LOGGING_IN')
	  	},
	  	fieldFocused: function(){
	  		this.gotoState('REGISTERING')
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
		  			Planner.Utility.disableFields('login');
		  			return YES;
		  		}

		  		// Otherwise prepare to send detailed feedback
		  		// Error Strings
		  		badEmail = 'Please provide a valid email';
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
	  			switch(num){
	  				case 1: view = Planner.getPath('loginPage.loginPane.createAccountBin.firstname'); break;
	  				case 2: view = Planner.getPath('loginPage.loginPane.createAccountBin.lastname'); break;
	  				case 3: view = Planner.getPath('loginPage.loginPane.createAccountBin.email'); break;
	  				case 4: view = Planner.getPath('loginPage.loginPane.createAccountBin.username'); break;
	  				case 5: view = Planner.getPath('loginPage.loginPane.createAccountBin.password'); break;
	  				case 6: view = Planner.getPath('loginPage.loginPane.createAccountBin.passwordConfirmation'); break;
	  			}
	  			Planner.Animation.css(view, 'border-color', 'red');

	  			// Set the value of the Error Bin to the error recieved, inside of runloop to force a controller update
	  			SC.RunLoop.begin();
	  			Planner.currentUser.set('accountCreationError', error);
	  			SC.RunLoop.end()
	  			// Transitions, making use of jQuery
	  			Planner.Animation.fadeOut(Planner.getPath('loginPage.loginPane.createAccountBin.submit'), 500);
	  			Planner.Animation.fadeIn(Planner.getPath('loginPage.loginPane.createAccountBin.error'), 500);
	  			// Re-enable all the text fields 
	  			Planner.Utility.enableFields('login');
	  		},
	  		exitState: function(){
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.error').get('layer')).fadeOut();
	  			$(Planner.getPath('loginPage.loginPane.createAccountBin.submit').get('layer')).fadeIn();
	  		},
	  	}),
  		CREATION_LOADING: SC.State.design({
				enterState: function(){
					// Fade out the create button, and fade in the spinner.
					Planner.Animation.fadeToggle([Planner.getPath('loginPage.loginPane.createAccountBin.submit'),
																				Planner.getPath('loginPage.loginPane.createAccountBin.spinner')], 500);
				},
				exitState: function(){
					Planner.Animation.fadeToggle(Planner.getPath('loginPage.loginPane.createAccountBin.spinner'), 500)
				},
				// Simple forwarding method.
				showError: function(error, num){
		  		this.gotoState('CREATION_ERROR');
		  		Planner.statechart.invokeStateMethod('showError', error, num)
		  	},
		  	// We have this method so that we can more in depth deal with the 
		  	// successful account creation
		  	showStatus: function(status){
		  		// Call the Registration Reset Function, on a timer, so after the card switch animation
		  		SC.Timer.schedule({action:this.reset(), interval: 700});
		  		Planner.statechart.gotoState('LOGGING_IN');
		  		Planner.statechart.invokeStateMethod('showStatus', status)
		  	},
		  	reset: function(){
		  		Planner.Animation.fadeToggle(Planner.getPath('loginPage.loginPane.createAccountBin.submit'), 500);
		  		Planner.Utility._getLoginFields().forEach(
		  			function(item){
		  				item.set('value', '');
		  			});
		  		Planner.Utility.enableFields();
		  	}
			}),
	  }),
	});