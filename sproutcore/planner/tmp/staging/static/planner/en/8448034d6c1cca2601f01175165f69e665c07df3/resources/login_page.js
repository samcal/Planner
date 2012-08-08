// ==========================================================================
// Project:   Planner - Login Page
// Copyright: @2012 Nick Landolfi, Sam Calvert
// ==========================================================================


Planner.loginPage = SC.Page.design({
  loginPane: SC.MainPane.design({
    classNames: ['loginPane'],
    childViews: ['date',
                 'bookmark',
                 'copyrightInfo',
                 'loginHeader', 
                 'loginBin', 
                 'createAccountBin',
                 'forgotAccountBin', 
                 'forgotAccountButton',
                 'createAccountButton', 
                 'rememberedAccountButton', 
                ],
    date: SC.LabelView.design({
      classNames: ['date'],
      layout: {width: .2, height: 40, top: 4, left: 16},
      value: date.toFormattedString('%A, %B %D') + getSup(date.get('day'))
    }),
    bookmark: SC.LabelView.design({
      classNames: ['bookmark'],
      textAlign: SC.ALIGN_CENTER,
      layout: { width: .125,  height: 35, top: -45, right: 20 },
      value: "Planner Login",
    }),
    copyrightInfo : SC.LabelView.design({
      classNames: ['copyrightInfo'],
      layout: { width: .25, height: 12, bottom: 5, left: 5},
      value: 'Planner Software © Nick Landolfi and Sam Calvert; 2012-2013'
    }),
    loginBin: Planner.LoginView.design({
      classNames: ['loginBin'],
      childViews: ['bearImage', 'username', 'password', 'submit', 'error', 'status', 'spinner'],   
      bearImage: SC.ImageView.design({
        layout: {height: 160, width: 160, centerX: 0},
        canLoadInBackground: NO,
        value: '/static/planner/en/8448034d6c1cca2601f01175165f69e665c07df3/source/resources/img/banner.png',
      }),
      username: Planner.LoginTextField.design({
        textAlign: SC.ALIGN_CENTER,
        hint: 'Username',
        textAlign: SC.ALIGN_CENTER,
        layout: {height: 35, width: 175, centerX: 0, centerY: 25},
      }),
      password: Planner.LoginTextField.design({
        hint: 'Password',
        textAlign: SC.ALIGN_CENTER,
        type: 'password',
        layout: {height: 35, width: 175, centerX: 0, centerY: 68},
      }),
      submit: SC.ButtonView.design({
        classNames: ['submit'],
        textAlign: SC.ALIGN_CENTER,
        layout: {height: 35, width: 90, centerX: 0, centerY: 115},
        title: 'Login',
        action: 'checkInfo',
      }),
      error: Planner.LoginError.design({
        layout: {width: 275, height: 30, centerX: 0, centerY: 120},
        valueBinding: 'Planner.currentUser.loginError',
      }),
      status: Planner.LoginStatus.design({
        layout: {width: 275, height: 30, centerX: 0, centerY: 120},
        valueBinding: 'Planner.currentUser.loginStatus',
      }),
      spinner: SC.ImageView.design({
        classNames: ['spinner'],
        layout: {height: 30, width: 30, centerX: 0, centerY: 117},
        useCanvas: NO,
        value: '/static/planner/en/8448034d6c1cca2601f01175165f69e665c07df3/source/resources/img/ajax-loader.gif',
      })
    }),
    createAccountBin: Planner.LoginView.design({
      classNames: ['createAccountBin'],
      childViews: ['firstname', 'lastname', 'email', 'username', 'password', 'passwordConfirmation', 'submit', 'error', 'spinner' ],
      firstname: Planner.LoginTextField.design({
        hint: 'First Name',
        layout: {height: 30, width: 250, centerX: 0,centerY: -120},
      }),
      lastname: Planner.LoginTextField.design({
        hint: 'Last Name',
        layout: {height: 30, width: 250, centerX: 0, centerY: -80},
      }),
      email: Planner.LoginTextField.design({
        hint: 'Email',
        layout: {height: 30, width: 250, centerX: 0, centerY: -40},
      }),
      username: Planner.LoginTextField.design({
        hint: 'Username',
        layout: {height: 30, width: 250, centerX: 0, centerY: 0},
      }),
      password: Planner.LoginTextField.design({
        hint: 'Password',
        isPassword: YES,
        layout: {height: 30, width: 250, centerX: 0, centerY: 40},
      }),
      passwordConfirmation: Planner.LoginTextField.design({
        hint: 'Confirm Password',
        isPassword: YES,
        layout: {height: 30, width: 250, centerX: 0, centerY: 80},
      }),
      submit: SC.ButtonView.design({
        classNames: ['submit'],
        textAlign: SC.ALIGN_CENTER,
        layout: {height: 30, width: 150, centerX: 0, centerY: 122},
        title: 'Create Account',
        action: 'checkInfo',
      }),
      error: Planner.LoginError.design({
        layout: {width: 275, height: 30, centerX: 0, centerY: 125},
        valueBinding: 'Planner.currentUser.accountCreationError' ,
      }),
      spinner: SC.ImageView.design({
        classNames: ['spinner'],
        layout: {height: 30, width: 30, centerX: 0, centerY: 125},
        useCanvas: NO,
        value: '/static/planner/en/8448034d6c1cca2601f01175165f69e665c07df3/source/resources/img/ajax-loader.gif',
      })
    }),
    forgotAccountBin: Planner.Wrapper.design({
      classNames: ['forgotPasswordBin'],
      childViews: ['email', 'send'],
      layout: {width:300, height:30, centerY: 130, centerX: 0},
      email: SC.TextFieldView.design({
        classNames: ['emailInput'], 
        hint: 'Your Email',
        spellCheckEnabled: NO,
        shouldRenderBorder: NO,
        layout: {height: 24, width: 200, centerX: -49},
        keyDown: function(evt){
          arguments.callee.base.apply(this,arguments);
          // If enter key, submit info
          if(evt.keyCode === 13){
            Planner.statechart.sendEvent('checkInfo');
          }
        }
      }),
      send: Planner.BrownButton.design({
        classNames: ['sendEmailButton'],
        layout: {width: 90, height: 24, centerX: 97},
        title: 'Send Email',
        action: 'checkInfo'
      }),
    }),
    loginHeader: Planner.Wrapper.design({
      childViews: ['loginTitle', 'rule'],
      loginTitle: Planner.LoginHeader.design({
              classNames: ['loginHeader'],

        value: 'Registration'
      }),
      rule: SC.LabelView.design({
        classNames: ['loginRule'],
        textAlign: SC.ALIGN_CENTER,
        layout: {width: 500, height: 50, centerX: 0, centerY: -170},
        value: '________________'
      }),
    }),
    createAccountButton: Planner.BrownButton.design({
      layout: {width: 150, height: 20, centerX: -80, centerY: 170, zIndex: 2},
      title: 'Create an Account',
      action: 'createAccount',
    }),
    forgotAccountButton: Planner.BrownButton.design({
      layout: {width: 150, height: 20, centerX: 80, centerY: 170, zIndex: 2},
      title: 'Forgot Password?',
      action: 'forgotPassword'
    }),
    rememberedAccountButton: Planner.BrownButton.design({
      layout: {width: 250, height: 20, centerX: 0, centerY: 170, zIndex: 1},
      title: 'Already have an Account?',
      action: 'alreadyHaveAccount',
    }), 
  }),
});