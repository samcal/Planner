from django.db import models
from django.contrib.auth.models import User, UserManager

class Teacher(User):
	TITLE_CHOICES = (
		('Mr.', 'Mr.'),
		('Mrs.', 'Mrs.'),
		('Ms.', 'Ms.'),
		('Miss', 'Miss'),
	)
	title = models.CharField(max_length=4, choices=TITLE_CHOICES)

	is_student = models.BooleanField(default=False)
	tasks = models.ManyToManyField('Task', blank=True)

	logins = models.IntegerField(default=0)
		
	objects = UserManager()
	
	def get_absolute_url(self):
		return '/classes/%s' % self.username
	
	def __unicode__(self):
		return self.title + ' ' + self.last_name

class Course(models.Model):
	name = models.CharField(max_length=30)
	teacher = models.ForeignKey(Teacher)

	def get_absolute_url(self):
		return '/classes/%s/%i/' % (self.teacher.username, self.id)
	
	def __unicode__(self):
		return self.name

class Task(models.Model):
	name = models.CharField(max_length=30)
	course = models.ForeignKey(Course)
	date = models.DateField()
	timestamp = models.DateTimeField(auto_now=True)
	updated = models.DateTimeField(auto_now=True)

	def get_absolute_url(self):
		return '/tasks/%i/' % (self.id)
	
	def __unicode__(self):
		return self.name

class Assignment(models.Model):
	name = models.CharField(max_length=30)
	course = models.ForeignKey(Course)
	description = models.CharField(max_length=1000)
	date_assigned = models.DateField()
	date_due = models.DateField()
	file = models.FileField(upload_to='user_uploads/', blank=True)
	timestamp = models.DateTimeField(auto_now=True)
	updated = models.DateTimeField(auto_now=True)

	def get_absolute_url(self):
		return '/assignments/%i/' % (self.id)
	
	def __unicode__(self):
		return self.name

class Test(models.Model):
	name = models.CharField(max_length=30)
	course = models.ForeignKey(Course)
	what_to_study = models.CharField(max_length=1000)
	date = models.DateField()
	timestamp = models.DateTimeField(auto_now=True)
	updated = models.DateTimeField(auto_now=True)

	def get_absolute_url(self):
		return '/tests/%i/' % (self.id)
	
	def __unicode__(self):
		return self.name

class Note(models.Model):
	name = models.CharField(max_length=50)
	course = models.ForeignKey('Course')
	filename = models.FileField(upload_to='note_files/', null=True, blank=True)
	date = models.DateField()
	description = models.TextField(max_length=2000)
	timestamp = models.DateTimeField(auto_now=True)
	updated = models.DateTimeField(auto_now=True)

	def get_absolute_url(self):
		return '/notes/%s/' % (self.id)

	def __unicode__(self):
		return self.name

class Student(User):
	courses = models.ManyToManyField(Course, blank=True, through='Period')
	tasks = models.ManyToManyField(Task, blank=True)
	classmates = models.ManyToManyField('self', symmetrical=False, blank=True)
	logins = models.IntegerField()
	
	is_student = models.BooleanField(default=True)
	
	APPEAR_CHOICES = (
		('d', 'Date Due'),
		('a', 'Date Assigned'),
		('b', 'Date before Due'),
	)

	appear = models.CharField(max_length=1, choices=APPEAR_CHOICES)
	reminder = models.BooleanField()
	completed = models.ManyToManyField(Assignment, blank=True)
	taskscompleted = models.ManyToManyField(Task, related_name='Tasks Completed', blank=True)

	deleted_messages = models.ManyToManyField('Message', blank=True)

	
	objects = UserManager()

	def first_initial(self):
		return '%s %s.' % (self.first_name, self.last_name[0])
	
	def get_absolute_url(self):
		return '/students/%i/' % (self.id)
	
	def __unicode__(self):
		return self.get_full_name()

class Message(models.Model):
	to_user = models.ForeignKey(User, related_name='to')
	from_user = models.ForeignKey(User, related_name='from')
	subject = models.CharField(max_length=50)
	message = models.TextField(max_length=2000)
	attachment = models.FileField(upload_to='message_attachments/', blank=True)
	time_sent = models.DateTimeField(auto_now=True)

	read = models.ManyToManyField(Student, related_name='read', blank=True)

	def get_absolute_url(self):
		return '/messages/%i/' % (self.id)

	def __unicode__(self):
		return self.subject

class Project(models.Model):
	name = models.CharField(max_length=30)
	course = models.ForeignKey(Course)
	students = models.ManyToManyField(Student)
	description = models.TextField(max_length=2000, blank=True)
	date_created = models.DateField(auto_now=True)
	date_due = models.DateField()

	def get_absolute_url(self):
		return '/projects/%i/' % self.id

	def __unicode__(self):
		return self.name

class Post(models.Model):
	name = models.CharField(max_length=30)
	project = models.ForeignKey(Project)
	student = models.ForeignKey(Student)
	date = models.DateTimeField(auto_now=True)
	description = models.TextField(max_length=2000, blank=True)
	attachment = models.FileField(upload_to='post_files/', blank=True)

	def get_absolute_url(self):
		return '/projects/%i/posts/%i/' % (self.project.id, self.id)

	def __unicode__(self):
		return self.name

class Period(models.Model):
	
	PERIOD_CHOICES = [(i,i) for i in range(7)]
	
	number = models.IntegerField(max_length=6, choices=PERIOD_CHOICES)
	student = models.ForeignKey(Student)
	course = models.ForeignKey(Course)

	timestamp = models.DateTimeField(auto_now=True)
	
	def __unicode__(self):
		return str(self.number)