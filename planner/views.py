import json
from datetime import date, datetime
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.contrib.auth.decorators import login_required
from planner.models import *
from planner.util import *

SITE_NAME = 'localhost:4020'

def index(request):
	return render_to_response('index.html')

@csrf_exempt
def userLogin(request):
	if request.method == 'POST':
		username = request.POST.get('username')
		password = request.POST.get('password')
		if username and password:
			user = authenticate(username=username, password=password)
			if user is not None:
				login(request, user)
				user = getUser(user)
				if user.is_student:
					data = {
						'status': 101,
						'firstName': user.first_name,
						'lastName': user.last_name,
						'username': user.username
					}
					return HttpResponse(json.dumps(data))
				else:
					data = {
						'status': 102,
						'firstName': user.first_name,
						'lastName': user.last_name,
						'username': user.username
					}
					return HttpResponse(json.dumps(data))
			else:
				if list(User.objects.filter(username=username)):
					return HttpResponse(json.dumps({'status':302}))
				else:
					return HttpResponse(json.dumps({'status':301}))
	else:
		return HttpResponseRedirect('/')

def userLogout(request):
	if request.user.is_authenticated():
		logout(request)
	return HttpResponse('')

@csrf_exempt
def userCreation(request):
	if request.method == 'POST':
		try:
			User.objects.get(username=request.POST['username'])
			data = {'error': 'Username already in use'}
			return HttpResponse(json.dumps(data))
		except User.DoesNotExist:
			try:
				User.objects.get(email=request.POST['email'])
				data = {'error': 'Email already in use'}
				return HttpResponse(json.dumps(data))
			except User.DoesNotExist:
				newUser = Student.objects.create(username=request.POST['username'], password='0', first_name=request.POST['firstname'], last_name=request.POST['lastname'], email=request.POST['email'], appear='d', logins=0)
				newUser.set_password(request.POST['password'])
				newUser.is_active = False
				newUser.save()

				subject = "Planner Validation"
				msg = 'Hello %s,\n\tWe have created your account using the following information:\n\t\tName: %s %s\n\t\tEmail: %s\n\t\tUsername: %s\n\tActivate your account now using this link: http://%s/validate/?code=%s\nWelcome to M-A Planner,\n\tNick and Sam' % (newUser.first_name, newUser.first_name, newUser.last_name, newUser.email, newUser.username, SITE_NAME, crypt(newUser.username))
				send_mail(subject, msg, 'maplannerservice@gmail.com', [newUser.email])

				data = {'status': 'Validation Email Sent'}
				return HttpResponse(json.dumps(data))
	else:
		return HttpResponseRedirect('/')

def validate(request):
	code = request.GET['code']
	data = code.split()

	if data[1] == crypt(data[0]).split('+')[1]:
		user = getUser(User.objects.get(username=data[0]))
		user.is_active = True
		user.save()
		data = {'status': 'account verified, please login'}
		return HttpResponse(json.dumps(data))
	return HttpResponse('')

@csrf_exempt
def forgotPassword(request):
	if request.method == 'POST':
		try:
			user = User.objects.get(email=request.POST['email'])

			subject = "Planner Reset Password"
			msg = 'Hello %s,\nThis is an email to reset your password at Planner. if you did not request this email, please ignore.\n\nYou can reset your password using this link: http://%s/resetPassword/?code=%s\n\nBest Regards,\n\tNick and Sam' % (user.first_name, SITE_NAME, crypt(user.username))
			send_mail(subject, msg, 'maplannerservice@gmail.com', [user.email])

			data = {'status': 'Email Sent'}
			return HttpResponse(json.dumps(data))
		except User.DoesNotExist:
			data = {'error': 'Email not in our records'}
			return HttpResponse(json.dumps(data))


def isLoggedIn(request):
	try:
		if request.user.is_authenticated:
			user = getUser(request.user)
			if user.is_student:
				status = 101
			else:
				status = 102
			data = {
				'status': status,
				'firstName': user.first_name,
				'lastName': user.last_name,
				'username': user.username
			}
			return HttpResponse(json.dumps(data))
	except:
		data = {'status':0}
		return HttpResponse(json.dumps(data))


@login_required
def courses(request):
	user = getUser(request.user)
	if user.is_student:
		# Some fancy list logic, just gets the right JSON courses, in period order
		courses = [{'guid':period.course.id,
		 					  'period':period.number,
							  'name':period.course.name,
							  'teacher':str(period.course.teacher),
							  'assignments': [assignment.id for assignment in Assignment.objects.filter(course=period.course)],
							  'tests': [test.id for test in Test.objects.filter(course=period.course)],
							  'notes': [note.id for note in Note.objects.filter(course=period.course)]} for period in Period.objects.filter(student=user).order_by('number')]
		events = {
			'assignments': [{'guid':assignment.id, 'name':assignment.name, 'description':assignment.description, 'dateAssigned':assignment.date_assigned.isoformat(), 'dateDue':assignment.date_due.isoformat(), 'course':assignment.course.id, 'isComplete':(assignment in user.completed.all())} for assignment in Assignment.objects.filter(course__in=user.courses.all())],
			'tests': [{'guid':test.id, 'name':test.name, 'description':test.what_to_study, 'date':test.date.isoformat(), 'course':test.course.id} for test in Test.objects.filter(course__in=user.courses.all())],
			'notes': [{'guid':note.id, 'name':note.name, 'description':note.description, 'date':note.date.isoformat(), 'course':note.course.id} for note in Note.objects.filter(course__in=user.courses.all())],
			'tasks': [{'guid':task.id, 'name':task.name, 'date':task.date.isoformat(), 'course':task.course.id, 'isComplete':(task in user.taskscompleted.all())} for task in user.tasks.all()]
		}
		data = {'courses':courses, 'events':events}
		return HttpResponse(json.dumps(data))
	else:
		data = [{'guid':course.id, 'name':course.name} for course in Course.objects.filter(teacher=user)]
		return HttpResponse(json.dumps(data))

@login_required
def course(request, course_id):
	course = Course.objects.get(pk=course_id)
	data = {
		'guid': course.id,
		'name': course.name,
		'teacher': str(course.teacher),
		'assignments': [assignment.id for assignment in Assignment.objects.filter(course=course)],
		'tests': [test.id for test in Test.objects.filter(course=course)],
		'notes': [note.id for note in Note.objects.filter(course=course)]
	}
	return HttpResponse(json.dumps(data))

@login_required
def events(request):
	user = getUser(request.user)
	if user.is_student:
		data = {
			'assignments': [{'guid':assignment.id, 'name':assignment.name, 'description':assignment.description, 'dateAssigned':assignment.date_assigned.isoformat(), 'dateDue':assignment.date_due.isoformat(), 'course':assignment.course.id, 'isComplete':(assignment in user.completed.all())} for assignment in Assignment.objects.filter(course__in=user.courses.all())],
			'tests': [{'guid':test.id, 'name':test.name, 'description':test.what_to_study, 'date':test.date.isoformat(), 'course':test.course.id} for test in Test.objects.filter(course__in=user.courses.all())],
			'notes': [{'guid':note.id, 'name':note.name, 'description':note.description, 'date':note.date.isoformat(), 'course':note.course.id} for note in Note.objects.filter(course__in=user.courses.all())],
			'tasks': [{'guid':task.id, 'name':task.name, 'date':task.date.isoformat(), 'course':task.course.id, 'isComplete':(task in user.taskscompleted.all())} for task in user.tasks.all()]
		}
		return HttpResponse(json.dumps(data))
	else:
		return HttpResponse()

@login_required
def poll(request):
	user = getUser(request.user)
	response = HttpResponse()
	if 'timeUpdated' in request.COOKIES:
		timeUpdated = datetime.strptime(request.COOKIES['timeUpdated'], '%Y-%m-%d %H:%M:%S.%f')
		data = {
			'new': {
				'assignments': [{'guid':assignment.id, 'name':assignment.name, 'description':assignment.description, 'dateAssigned':assignment.date_assigned.isoformat(), 'dateDue':assignment.date_due.isoformat(), 'course':assignment.course.id, 'isComplete':(assignment in user.completed.all())} for assignment in Assignment.objects.filter(course__in=user.courses.all(), timestamp__gt=timeUpdated)],
				'tests': [{'guid':test.id, 'name':test.name, 'description':test.what_to_study, 'date':test.date.isoformat(), 'course':test.course.id} for test in Test.objects.filter(course__in=user.courses.all(), timestamp__gt=timeUpdated)],
				'notes': [{'guid':note.id, 'name':note.name, 'description':note.description, 'date':note.date.isoformat(), 'course':note.course.id} for note in Note.objects.filter(course__in=user.courses.all(), timestamp__gt=timeUpdated)],
				'tasks': [{'guid':task.id, 'name':task.name, 'date':task.date.isoformat(), 'course':task.course.id, 'isComplete':(task in user.taskscompleted.all())} for task in user.tasks.filter(timestamp__gt=timeUpdated)]
			},
			'updated': {
				'assignments': [{'guid':assignment.id, 'name':assignment.name, 'description':assignment.description, 'dateAssigned':assignment.date_assigned.isoformat(), 'dateDue':assignment.date_due.isoformat(), 'course':assignment.course.id, 'isComplete':(assignment in user.completed.all())} for assignment in Assignment.objects.filter(course__in=user.courses.all(), updated__gt=timeUpdated)],
				'tests': [{'guid':test.id, 'name':test.name, 'description':test.what_to_study, 'date':test.date.isoformat(), 'course':test.course.id} for test in Test.objects.filter(course__in=user.courses.all(), updated__gt=timeUpdated)],
				'notes': [{'guid':note.id, 'name':note.name, 'description':note.description, 'date':note.date.isoformat(), 'course':note.course.id} for note in Note.objects.filter(course__in=user.courses.all(), updated__gt=timeUpdated)],
				'tasks': [{'guid':task.id, 'name':task.name, 'date':task.date.isoformat(), 'course':task.course.id, 'isComplete':(task in user.taskscompleted.all())} for task in user.tasks.filter(updated__gt=timeUpdated)]
			}
		}
		response = HttpResponse(json.dumps(data))
	response.set_cookie('timeUpdated', datetime.now())
	return response

@login_required
def assignment(request, assignment_id):
	assignment = Assignment.objects.get(pk=assignment_id)
	data = {
		'guid': assignment.id,
		'name': assignment.name,
		'description': assignment.description,
		'dateAssigned': assignment.date_assigned.isoformat(),
		'dateDue': assignment.date_due.isoformat(),
		'course': assignment.course.id
	}
	return HttpResponse(json.dumps(data))

@login_required
def test(request, test_id):
	test = Test.objects.get(pk=test_id)
	data = {
		'guid': test.id,
		'name': test.name,
		'description': test.what_to_study,
		'date': test.date.isoformat(),
		'course': test.course.id
	}
	return HttpResponse(json.dumps(data))

@login_required
def note(request, note_id):
	note = Note.objects.get(pk=note_id)
	data = {
		'guid': note.id,
		'name': note.name,
		'description': note.description,
		'date': note.date.isoformat(),
		'course': note.course.id
	}
	return HttpResponse(json.dumps(data))

@login_required
def task(request, task_id):
	task = Task.objects.get(pk=task_id)
	data = {
		'guid': task.id,
		'name': task.name,
		'date': task.date.isoformat(),
		'course': task.course.id
	}
	return HttpResponse(json.dumps(data))

def assignmentCreation(request):
	user = getUser(request.user)
	if user.is_student:
		return HttpResponse()
	else:
		data = request.POST
		name = data['name']
		description = data['description']
		course = Course.objects.get(pk=data['course'])
		date_assigned = datetime.strptime(data['dateAssigned'], '%Y-%m-%d')
		date_due = datetime.strptime(data['dateDue'], '%Y-%m-%d')
		assignment = Assignment.objects.create(name=name, description=description, course=course, date_assigned=date_assigned, date_due=date_due)
		assignment.save()

		data = {
			'status': 1
		}
		return HttpResponse(json.dumps(data))

@login_required
def testCreation(request):
	user = getUser(request.user)
	if user.is_student:
		return HttpResponseRedirect('/')
	else:
		name = request.POST.get('name')
		what_to_study = request.POST.get('description')
		course = request.POST.get('course')
		date = request.POST.get('date')
		test = Test.objects.create(name=name, what_to_study=what_to_study, course=course, date=date)
		test.save()

		data = {
			'status': 1
		}
		return HttpResponse(json.dumps(data))

@login_required
def noteCreation(request):
	user = getUser(request.user)
	if user.is_student:
		return HttpResponseRedirect('/')
	else:
		name = request.POST.get('name')
		description = request.POST.get('description')
		course = request.POST.get('course')
		date = request.POSt.get('date')
		note = Note.objects.create(name=name, description=description, course=course, date=date)
		note.save()

		data = {
			'status': 1
		}
		return HttpResponse(json.dumps(data))

def taskCreation(request):
	data = json.loads(request.POST['data'])
	user = getUser(request.user)
	name = data['name']
	course = Course.objects.get(pk=data['course'])
	date = datetime.strptime(data['date'], '%Y-%m-%d')
	newTask = Task.objects.create(name=name, course=course, date=date)
	user.tasks.add(newTask)
	user.save()

	data = {
		'status': 1
	}
	return HttpResponse(json.dumps(data))

@csrf_exempt
def updateAssignment(request, assignment_id):
	user = getUser(request.user)
	assignment = Assignment.objects.get(pk=assignment_id)

	status = 400
	if user.is_student:
		if request.POST['isComplete'] == 'true' and assignment not in user.completed.all():
			user.completed.add(assignment)
			user.save()
			status = 200
		elif request.POST['isComplete'] == 'false' and assignment in user.completed.all():
			user.completed.remove(assignment)
			user.save()
			status = 200
	else:
		# Handle the teacher editing of assignments
		pass

	if status == 200:
		assignment.updated = datetime.now()
		assignment.save()

	return HttpResponse(json.dumps({'status':status}))

@csrf_exempt
def updateTask(request, task_id):
	user = getUser(request.user)
	task = Task.objects.get(pk=task_id)

	status = 400
	if user.is_student:
		if request.POST['isComplete'] == 'true' and task not in user.taskscompleted.all():
			user.taskscompleted.add(task)
			user.save()
			status = 200
		elif request.POST['isComplete'] == 'false' and task in user.taskscompleted.all():
			user.taskscompleted.remove(task)
			user.save()
			status = 200
	else:
		# Handle teacher editing of tasks
		pass

	if status == 200:
		task.updated = datetime.now()
		task.save()

	return HttpResponse(json.dumps({'status':status}))