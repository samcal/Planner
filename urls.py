from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

admin.autodiscover()

urlpatterns = patterns('planner.views',
	url(r'^$', 'index'),

	url(r'^login/$', 'userLogin'),
	url(r'^logout/$', 'userLogout'),
	url(r'^register/$', 'userCreation'),
	url(r'^forgotPassword/$', 'forgotPassword'),
	url(r'^validate/$', 'validate'),
	url(r'^isLoggedIn/$', 'isLoggedIn'),

	url(r'^events/$', 'events'),
	url(r'^courses/$', 'courses'),
	url(r'^poll/$', 'poll'),

	url(r'^assignment/(?P<assignment_id>\d+)/$', 'assignment'),
	url(r'^test/(?P<test_id>\d+)/$', 'test'),
	url(r'^note/(?P<note_id>\d+)/$', 'note'),
	url(r'^task/(?P<task_id>\d+)/$', 'task'),

	url(r'^assignment/create/$', 'assignmentCreation'),
	url(r'^test/create/$', 'testCreation'),
	url(r'^note/create/$', 'noteCreation'),
	url(r'^task/create/$', 'taskCreation'),

	url(r'^assignment/(?P<assignment_id>\d+)/update/$', 'updateAssignment'),
	url(r'^task/(?P<task_id>\d+)/update/$', 'updateTask'),

  url(r'^admin/', include(admin.site.urls))
)