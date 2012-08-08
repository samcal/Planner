import re, os
from planner.models import *
from django.db.models import Q
from django.http import HttpResponse
from datetime import date
from dateutil.relativedelta import relativedelta

def getUser(user):
	try:
		out = Student.objects.get(pk=user.id)
		return out
	except Student.DoesNotExist:
		try:
			out = Teacher.objects.get(pk=user.id)
			return out
		except Teacher.DoesNotExist:
			pass
	return None

# returns the JSON of events since given time
def eventsSince(time, user):
	out = {}
	out['periods'] = list(Period.objects.filter(timestamp__lt=time, student=user))
	out['assignments'] = list(Assignment.objects.filter(timestamp__lt=time, course__in=user.courses.all()))
	out['tests'] = list(Test.objects.filter(timestamp__lt=time, course__in=user.courses.all()))
	out['notes'] = list(Note.objects.filter(timestamp__lt=time, course__in=user.courses.all()))
	out['tasks'] = list(user.tasks.filter(timestamp__lt=time))
	return out

def is_mobile(request):
	return 'iPhone' in request.META['HTTP_USER_AGENT']

def catXML(docs):
	out = ''
	out += docs[0].content[:-6]
	for doc in docs[1:]:
		out += doc.content[5:-6]

	out += '</doc>'
	return HttpResponse(out)

def getDaynum(start, end=date.today()):
	return (start-end).days

def normalize_query(query_string, findterms=re.compile(r'"([^"]+)"|(\S+)').findall, normspace=re.compile(r'\s{2,}').sub):
	return [normspace(' ', (t[0] or t[1]).strip()) for t in findterms(query_string)]

def get_query(query_string, search_fields):
	query = None

	terms = normalize_query(query_string)
	for term in terms:
		or_query = None
		for field_name in search_fields:
			q = Q(**{"%s__icontains" % field_name: term})
			if or_query is None:
				or_query = q
			else:
				or_query = or_query | q
		if query is None:
			query = or_query
		else:
			query = query & or_query
	return query

def plannerDayAU(start, end):
	return '/planner/day/?daynum=%d' % getDaynum(start, end)

def crypt(username):
	out = ''
	
	lets = ''
	for char in username:
		if chr(ord(char)-13) not in '&+^#?`!':
			lets += chr(ord(char)-13)
		else:
			lets += '*'
	
	nums = ''
	today = date.today()
	nums += str((today.year * 13 + today.day * 5 + today.month * 4 + 3) * ord(username[0]))
	
	comb = ''
	for x in range(len(username)):
		try:
			comb += lets[x] + nums[x]
		except:
			pass
	
	out = username + '+' + comb
	return out

def getCurrentURL(request):
	url = request.path
	if request.GET:
		url += '?'
		for data in request.GET:
			url += '&%s=%s' % (data, request.GET[data])
	
	return url

def plannerPKG(request, day):
	user = getUser(request.user)

	while date.weekday(day) > 4:
		day += relativedelta(days=-1)

	periods = Period.objects.filter(student=user).order_by('number')
	day_pkg = []

	for period in periods:
		if not ((date.weekday(day) == 2 and period.number % 2 == 0) or (date.weekday(day) == 3 and period.number % 2 == 1)):
			assignments = Assignment.objects.filter(course=period.course, date_assigned=day)
			tests = Test.objects.filter(course=period.course, date=day)
			notes = Note.objects.filter(course=period.course, date=day)
			tasks = Task.objects.filter(student=user, date=day, course=period.course)
			day_pkg.append((period, assignments, tests, notes, tasks))

	return day_pkg

def splitFilename(string, chars):
	x = string.split('.')
	x[0] = x[0][:chars-len(x[1])]
	return x[0] + '.' + x[1]