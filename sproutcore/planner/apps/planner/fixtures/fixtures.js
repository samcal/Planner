sc_require('models/course');

Planner.Course.FIXTURES = [
	{	guid: 1,
		period: 1,
		name: 'AP Computer Science',
		assignments: [1, 2],
		tests: [],
		notes: [],
		tasks: [],
		teacher: 'Mr. Dumanske'},
	{	guid: 2,
		period: 2,
		name: 'Western Civilizations',
		assignments: [],
		tests: [],
		notes: [],
		tasks: [],
		teacher: 'Mrs. Shloss'},
	{	guid: 3,
		period: 3,
		assignments: [],
		tests: [],
		notes: [],
		tasks: [],
		teacher: 'Miss Trent'},
	{	guid: 4,
		period: 4,
		assignments: [],
		tests: [],
		notes: [],
		tasks: [],
		teacher: 'Ms. Nerssesian'},
	{	guid: 5,
		period: 5,
		assignments: [],
		tests: [],
		notes: [],
		tasks: [],
		teacher: 'Ms. Jacobs'},
	{ guid: 6,
		period: 6,
		assignments: [],
		tests: [],
		notes: [],
		tasks: [],
		teacher: 'Ms. Osborn'}
];

var monday = SC.DateTime.create({day: 11})
var tuesday = SC.DateTime.create({day: 12})

Planner.Assignment.FIXTURES = [
	{	guid:1,
		name: 'Workbook pgs.1-3',
		description: 'DO IT!',
		dateAssigned: monday,
		dateDue: monday,
		isComplete: false,
		course: 1},
	{	guid:2,
		name: 'Lab 11A',
		description: 'This is not hard',
		dateAssigned: tuesday,
		dateDue: tuesday,
		isComplete: true,
		course: 1}
]