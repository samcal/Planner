from planner.models import Teacher, Course, Student, Assignment, Test, Message, Project, Post, Task, Note
from django.contrib import admin

class CourseInline(admin.StackedInline):
	model = Course
	extra = 1

class TeacherAdmin(admin.ModelAdmin):
	inlines = [CourseInline]

admin.site.register(Teacher, TeacherAdmin)
admin.site.register(Student)
admin.site.register(Message)
admin.site.register(Project)
admin.site.register(Post)
admin.site.register(Task)
admin.site.register(Assignment)
admin.site.register(Test)
admin.site.register(Note)