// ==========================================================================
// Project:   Planner - mainPage
// Copyright: @2012 My Company, Inc.
// ==========================================================================
/*globals Planner */

date = SC.DateTime.create();
function getSup(day){if(day > 10 && day < 20) return "th";var temp = day%10; if(temp == 1) return "st"; else if(temp == 2) return "nd"; else if(temp == 3) return "rd"; else return "th";}


Planner.BrownButton = SC.LabelView.extend({
  classNames: ['brownButton'],
  textAlign: SC.ALIGN_CENTER,
}),

Planner.Wrapper = SC.View.extend({
  backgroundColor: 'transparent'
}),

Planner.LoginView = SC.View.extend({
  layout: {width: 325, height: 300, centerX: 0, centerY: 0, zIndex:100},
}),

Planner.LoginHeader = SC.LabelView.extend({
  classNames: ['loginHeader'],
  textAlign: SC.ALIGN_CENTER,
  layout: {width: 200, height: 30, centerX: 0, centerY: -170}
}),

Planner.LoginRule = SC.LabelView.extend({
  
})

Planner.loginPage = SC.Page.design({

loginPane: SC.MainPane.design({
  classNames: ['loginPane'],
  childViews: ['date', 'loginContainer', 'bookMark'],


  date: SC.LabelView.design({
    classNames: ['date'],
    layout: {width: 260, height: 40, top: 4, left: 16},
    tagName: "h1", 
    value: date.toFormattedString('%A, %B %d') + getSup(date.get('day'))
  }),

  bookMark: SC.LabelView.design({
    classNames: ['bookMark'],
    textAlign: SC.ALIGN_CENTER,
    layout: {width: 175,  height: 25, top: 0, right:20},
    value: "M-A Planner Login",

  }),
  loginContainer: SC.ContainerView.design({
    nowShowing: 'loginBin'
  }),
}),

loginBin: Planner.Wrapper.design({
  childViews: ['login', 'loginButtons'],
  login: Planner.LoginView.design({
    classNames: ['loginBin'],
    childViews: ['bearImage', 'username', 'password',  'submit'],
  
    bearImage: SC.ImageView.design({
      layout: {height: 160, width: 160, centerX: 0},
      canLoadInBackground: NO,
      value: 'http://maplanner.alwaysdata.net/static/img/banner3.png'
    }),

    username: SC.TextFieldView.design({
      hint: 'Username',
      spellCheckEnabled: NO,
      shouldRenderBorder: NO,
      layout: {height: 35, width: 175, centerX: 0, centerY: 25},
    }),
   
    password: SC.TextFieldView.design({
      shouldRenderBorder: NO,
      hint: 'Password',
      isPassword: YES,
      layout: {height: 35, width: 175, centerX: 0, centerY: 68}
    }),
   
    submit: SC.LabelView.design({
      classNames: ['submit'],
      textAlign: SC.ALIGN_CENTER,
      layout: {height: 35, width: 90, centerX: 0, centerY: 115},
      value: 'Login',
      click: function() {Planner.loginPageController.login(Planner.getPath('loginPage.loginBin.login.username').value, Planner.getPath('loginPage.loginBin.login.password').value)}
    }),    
  }),
  loginButtons: SC.ContainerView.design({
    nowShowing: 'buttonWrapper',
    layout: {zIndex:2}
  })
  
}),

buttonWrapper: Planner.Wrapper.design({
  childViews: ['createAccountButton', 'forgotAccountButton'],
    createAccountButton: Planner.BrownButton.design({
      classNames: ['createAccountButton'],
      layout: {width: 150, height: 20, centerX: -80, centerY: 170},
      value: 'Create an Account',
      click: function(){Planner.getPath('loginPage.loginPane.loginContainer').replaceContent(Planner.getPath('loginPage.createAccountBin'));}
    }),

    forgotAccountButton: Planner.BrownButton.design({
      classNames: ['forgotAccountButton'],
      layout: {width: 150, height: 20, centerX: 80, centerY: 170},
      value: 'Forgot you password?',
      click: function(){Planner.getPath('loginPage.loginBin.loginButtons').replaceContent(Planner.getPath('loginPage.forgotPasswordBin'));}
    }),
}),

createAccountBin: Planner.Wrapper.design({
  childViews: ['loginHeader', 'rule', 'login', 'rememberedAccountButton'],
  loginHeader: Planner.LoginHeader.design({
    value: 'Planner Registration'
  }),
  rule: SC.LabelView.design({
    classNames: ['loginRule'],
    textAlign: SC.ALIGN_CENTER,
    layout: {width: 500, height: 50, centerX: 0, centerY: -170},
    value: '________________'
  }),
  login: Planner.LoginView.design({
    classNames: ['createAccountBin'],
    childViews: ['firstname', 'lastname', 'email', 'username', 'password', 'passwordConfirmation', 'submit' ],
    firstname: SC.TextFieldView.design({
      hint: 'First Name',
      spellCheckEnabled: NO,
      shouldRenderBorder: NO,
      layout: {height: 30, width: 250, centerX: 0, centerY: -120},
    }),
    lastname: SC.TextFieldView.design({
      hint: 'Last Name',
      spellCheckEnabled: NO,
      shouldRenderBorder: NO,
      layout: {height: 30, width: 250, centerX: 0, centerY: -80},
    }),
    email: SC.TextFieldView.design({
      hint: 'Email',
      spellCheckEnabled: NO,
      shouldRenderBorder: NO,
      layout: {height: 30, width: 250, centerX: 0, centerY: -40},
    }),
    username: SC.TextFieldView.design({
      hint: 'Username',
      spellCheckEnabled: NO,
      shouldRenderBorder: NO,
      layout: {height: 30, width: 250, centerX: 0, centerY: 0},
    }),
    password: SC.TextFieldView.design({
      hint: 'Password',
      spellCheckEnabled: NO,
      shouldRenderBorder: NO,
      isPassword: YES,
      layout: {height: 30, width: 250, centerX: 0, centerY: 40},
    }),
    passwordConfirmation: SC.TextFieldView.design({
      hint: 'Confirm Password',
      spellCheckEnabled: NO,
      shouldRenderBorder: NO,
      isPassword: YES,
      layout: {height: 30, width: 250, centerX: 0, centerY: 80},
    }),
    submit: SC.LabelView.design({
      classNames: ['submit'],
      textAlign: SC.ALIGN_CENTER,
      layout: {height: 30, width: 150, centerX: 0, centerY: 122},
      value: 'Create Account',
    }),

  }),
  rememberedAccountButton: Planner.BrownButton.design({
    classNames: ['rememberedAccountButton'],
    layout: {width: 250, height: 20, centerX: 0, centerY: 170},
    value: 'Already have an Account?',
    click: function(){Planner.getPath('loginPage.loginPane.loginContainer').replaceContent(Planner.getPath('loginPage.loginBin'));}
  }),
}),

forgotPasswordBin: Planner.Wrapper.design({
  classNames: ['forgotPasswordBin'],
  childViews: ['email', 'send'],
  email: SC.TextFieldView.design({
      hint: 'Email',
      spellCheckEnabled: NO,
      shouldRenderBorder: NO,
      layout: {height: 24, width: 200, centerX: -49, centerY: 170},
  }),
  send: Planner.BrownButton.design({
    classNames: ['sendEmailButton'],
    layout: {width: 90, height: 24, centerX: 97, centerY: 170},
    value: 'Send Email',
    click: function(){Planner.getPath('loginPage.loginPane.loginContainer').replaceContent(Planner.getPath('loginPage.loginBin'));}
  }),
}),

});


Planner.plannerPage = SC.Page.design({
  plannerPane: SC.MainPane.design({
    classNames: ['plannerPane'],
    childViews: ['sideView', 'weekBin'],
    sideView: SC.View.design({
      layout: { width: .25, height: .5, right: 20, top: .1},
      classNames: ['sideView'],
      sideBin: SC.ScrollView.design({
        contentView: SC.ListView.design({
          rowHeight: 36,
          value: 'lkjsad'
        })
      })
    }),
    weekBin: SC.ScrollView.design({
      classNames: ['weekBin'],
      hasHorizontalScroller: NO,
      layout: { width: .65, height: .8 },
      backgroundColor: 'white',
      
    })
  }),

  
});
; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('planner');