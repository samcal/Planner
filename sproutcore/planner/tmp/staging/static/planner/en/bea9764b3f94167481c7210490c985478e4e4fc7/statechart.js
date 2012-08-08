sc_require('utility');

Planner.statechart = SC.Statechart.create({
  trace: YES,
	initialState: 'LOADED',
  
	LOADED: SC.State.design({ 
		// This state handles the original application load. Note ORIGINAL, login -> planner -> login is not original. This has nothing to do with 'firstLoad'.
	  enterState: function() {
	  	// CSS Adjustments
	  	current = SC.browser.current;
	  	if(current == 'firefox'){
	  		$(Planner.getPath('loginPage.loginPane.loginBin.submit').get('layer')).addClass('firefox');
	  	}
	  	this.gotoState('LOGGED_OUT');
	  },

	  exitState: function() {
	    //Nothing needed here as of right now, we may need to implement some sort of loading thing in the future
	  }
	}),

	

	LOGGED_OUT: SC.State.plugin('Planner.LOGGED_OUT'),

  LOGGED_IN: SC.State.design({
  	firstLoad: true,
	  enterState: function() {
	  	// If we just came from login, then we have to do the login animations
	  	if(this.firstLoad == true){
		  	/* Close Animations for Login Page
					- Slide up bookmark
					- Hide forgotAccountBin and createAccountBin
					- Fade out the buttons and loginBin
					- Wait for all that to happen, then
						- Remove loginPage, append plannerPage
						- Reset the loginPage
							- Show forgotAccountBin, createAccountBin, forgotAccountButton,  createAccountButton and loginBin
							- Reset username and password fields
							- Fade out date, to prep for a fade in.
		  	*/
		  	$("#"+Planner.getPath('loginPage.loginPane.bookmark').get('layer').id).animate({translateY: '-=35'}, 500);
		  	Planner.Utility.hide([Planner.getPath('loginPage.loginPane.forgotAccountBin'), Planner.getPath('loginPage.loginPane.createAccountBin')]);
		  	$(Planner.getPath('loginPage.loginPane.createAccountButton').get('layer')).fadeToggle(300);
		  	$(Planner.getPath('loginPage.loginPane.forgotAccountButton').get('layer')).fadeToggle(300);
		  	$(Planner.getPath('loginPage.loginPane.loginBin').get('layer')).fadeToggle(500);
				SC.Timer.schedule({
						   action: function(){											   
						   						// Switch Pages
						   						Planner.getPath('loginPage.loginPane').remove();
		   		 								Planner.getPath('plannerPage.plannerPane').append();
											  	Planner.getPath('loginPage.loginPane.loginBin.username').set('value', '');
									  			Planner.getPath('loginPage.loginPane.loginBin.password').set('value', '');
									    		Planner.statechart.invokeStateMethod('startUp');
		   		 							},
		   		 		 interval: 500
				});
				// tell ourselves we did the login animations once, so not again
				this.set('firstLoad', false);
			}else{
				Planner.getPath('plannerPage.plannerPane').append();
	    	SC.Timer.schedule({
	    		action: function(){
						Planner.statechart.invokeStateMethod('startUp');
					},
					interval: 200
				});
    }
			
	  },

	  startUp: function(){
			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '+=35'}, 500);
			$(Planner.getPath('plannerPage.plannerPane.sideView').get('layer')).fadeIn(500);
			$(Planner.getPath('plannerPage.plannerPane.mainView').get('layer')).fadeIn(500);
	  },

	  logout: function(){
			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '-=90'}, 1000);
			$('#'+Planner.getPath('plannerPage.plannerPane.util').get('layer').id).animate({translateY: '-=55'}, 750);
			$(Planner.getPath('plannerPage.plannerPane.sideView').get('layer')).fadeOut(500);
			$(Planner.getPath('plannerPage.plannerPane.mainView').get('layer')).fadeOut(500);
			SC.Timer.schedule({
				action: function(){
					Planner.statechart.gotoState('LOGGED_OUT');
				},
				interval: 1000
			});
			this.set('firstLoad', true);
	  },

	  exitState: function(){
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
			  }),
			  BOOKMARK: SC.State.design({
			  	initialSubstate: 'CLOSED',
			  	CLOSED: SC.State.design({
			  		toggleUtil: function(){
		    			Planner.Animation.oneUp(Planner.getPath('plannerPage.plannerPane.bookmark'), Planner.getPath('plannerPage.plannerPane.sideView'));
		    			Planner.Animation.oneUp(Planner.getPath('plannerPage.plannerPane.util'), Planner.getPath('plannerPage.plannerPane.bookmark'));
		    			Planner.Animation.oneUp(Planner.getPath('plannerPage.plannerPane.util.logout'), Planner.getPath('plannerPage.plannerPane.util'));
		    			Planner.Animation.oneUp(Planner.getPath('plannerPage.plannerPane.util.settings'), Planner.getPath('plannerPage.plannerPane.util'));
			  			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '+=60'}, 500);
			  			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '-=5'}, 100);
			  			$('#'+Planner.getPath('plannerPage.plannerPane.util').get('layer').id).animate({translateY: '+=60'}, 500);
			  			$('#'+Planner.getPath('plannerPage.plannerPane.util').get('layer').id).animate({translateY: '-=5'}, 100);
			  			this.gotoState('OPEN');
			  		}
			  	}),
			  	OPEN: SC.State.design({
			  		toggleUtil: function(){
			  			$('#'+Planner.getPath('plannerPage.plannerPane.bookmark').get('layer').id).animate({translateY: '-=55'}, 500);
			  			$('#'+Planner.getPath('plannerPage.plannerPane.util').get('layer').id).animate({translateY: '-=55'}, 500);
			  			this.gotoState('CLOSED');
			  		},
			  		logoutPressed:function(){
				  		Planner.currentUser.sendLogout();
			  		}
			  	}),
			  })
		}),
		COURSE_SIGNUP: SC.State.design({})
	}),
});









/*-------------------------------------- Helpers --------------------------------------*/


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
	}
})

// TransformJS - Copyright (c) 2011 Strobe Inc. - For More Info, visit http://transformjs.strobeapp.com/
function Matrix(){}var Sylvester={version:"0.1.3",precision:1e-6};Matrix.prototype={e:function(a,b){return a<1||a>this.elements.length||b<1||b>this.elements[0].length?null:this.elements[a-1][b-1]},map:function(a){var b=[],c=this.elements.length,d=c,e,f,g=this.elements[0].length,h;do{e=d-c,f=g,b[e]=[];do h=g-f,b[e][h]=a(this.elements[e][h],e+1,h+1);while(--f)}while(--c);return Matrix.create(b)},multiply:function(a){if(!a.elements)return this.map(function(b){return b*a});var b=a.modulus?!0:!1,c=a.elements||a;typeof c[0][0]=="undefined"&&(c=Matrix.create(c).elements);if(!this.canMultiplyFromLeft(c))return null;var d=this.elements.length,e=d,f,g,h=c[0].length,i,j=this.elements[0].length,k=[],l,m,n;do{f=e-d,k[f]=[],g=h;do{i=h-g,l=0,m=j;do n=j-m,l+=this.elements[f][n]*c[n][i];while(--m);k[f][i]=l}while(--g)}while(--d);var c=Matrix.create(k);return b?c.col(1):c},x:function(a){return this.multiply(a)},canMultiplyFromLeft:function(a){var b=a.elements||a;return typeof b[0][0]=="undefined"&&(b=Matrix.create(b).elements),this.elements[0].length==b.length},setElements:function(a){var b,c=a.elements||a;if(typeof c[0][0]!="undefined"){var d=c.length,e=d,f,g,h;this.elements=[];do{b=e-d,f=c[b].length,g=f,this.elements[b]=[];do h=g-f,this.elements[b][h]=c[b][h];while(--f)}while(--d);return this}var i=c.length,j=i;this.elements=[];do b=j-i,this.elements.push([c[b]]);while(--i);return this}},Matrix.create=function(a){var b=new Matrix;return b.setElements(a)},$M=Matrix.create,function(a){if(!a.cssHooks)throw"jQuery 1.4.3+ is needed for this plugin to work";var b="transform",c,d,e,f,g,h=b.charAt(0).toUpperCase()+b.slice(1),i=["Moz","Webkit","O","MS"],j=document.createElement("div");if(b in j.style)d=b,e=j.style.perspective!==undefined;else for(var k=0;k<i.length;k++){c=i[k]+h;if(c in j.style){d=c,i[k]+"Perspective"in j.style?e=!0:f=!0;break}}d||(g="filter"in j.style,d="filter"),j=null,a.support[b]=d;var l=d,m={rotateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,Math.cos(a),Math.sin(-a),0],[0,Math.sin(a),Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateY:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),0,Math.sin(a),0],[0,1,0,0],[Math.sin(-a),0,Math.cos(a),0],[0,0,0,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}},rotateZ:{defaultValue:0,matrix:function(a){return e?$M([[Math.cos(a),Math.sin(-a),0,0],[Math.sin(a),Math.cos(a),0,0],[0,0,1,0],[0,0,0,1]]):$M([[Math.cos(a),Math.sin(-a),0],[Math.sin(a),Math.cos(a),0],[0,0,1]])}},scale:{defaultValue:1,matrix:function(a){return e?$M([[a,0,0,0],[0,a,0,0],[0,0,a,0],[0,0,0,1]]):$M([[a,0,0],[0,a,0],[0,0,1]])}},translateX:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[a,0,0,1]]):$M([[1,0,0],[0,1,0],[a,0,1]])}},translateY:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,a,0,1]]):$M([[1,0,0],[0,1,0],[0,a,1]])}},translateZ:{defaultValue:0,matrix:function(a){return e?$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,a,1]]):$M([[1,0,0],[0,1,0],[0,0,1]])}}},n=function(b){var c=a(b).data("transforms"),d;e?d=$M([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]):d=$M([[1,0,0],[0,1,0],[0,0,1]]);for(var h in m)d=d.x(m[h].matrix(c[h]||m[h].defaultValue));e?(s="matrix3d(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+","+d.e(1,3).toFixed(10)+","+d.e(1,4).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+","+d.e(2,3).toFixed(10)+","+d.e(2,4).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+","+d.e(3,2).toFixed(10)+","+d.e(3,3).toFixed(10)+","+d.e(3,4).toFixed(10)+",",s+=d.e(4,1).toFixed(10)+","+d.e(4,2).toFixed(10)+","+d.e(4,3).toFixed(10)+","+d.e(4,4).toFixed(10),s+=")"):f?(s="matrix(",s+=d.e(1,1).toFixed(10)+","+d.e(1,2).toFixed(10)+",",s+=d.e(2,1).toFixed(10)+","+d.e(2,2).toFixed(10)+",",s+=d.e(3,1).toFixed(10)+"px,"+d.e(3,2).toFixed(10)+"px",s+=")"):g&&(s="progid:DXImageTransform.Microsoft.",s+="Matrix(",s+="M11="+d.e(1,1).toFixed(10)+",",s+="M12="+d.e(1,2).toFixed(10)+",",s+="M21="+d.e(2,1).toFixed(10)+",",s+="M22="+d.e(2,2).toFixed(10)+",",s+="SizingMethod='auto expand'",s+=")",b.style.top=d.e(3,1),b.style.left=d.e(3,2)),b.style[l]=s},o=function(b){return a.fx.step[b]=function(c){a.cssHooks[b].set(c.elem,c.now+c.unit)},{get:function(c,d,e){var f=a(c).data("transforms");return f===undefined&&(f={},a(c).data("transforms",f)),f[b]||m[b].defaultValue},set:function(c,d){var e=a(c).data("transforms");e===undefined&&(e={});var f=m[b];typeof f.apply=="function"?e[b]=f.apply(e[b]||f.defaultValue,d):e[b]=d,a(c).data("transforms",e),n(c)}}};if(l)for(var p in m)a.cssHooks[p]=o(p),a.cssNumber[p]=!0}(jQuery)
