'use strict';
app.controller('calendarController', function($scope) {
	$scope.calTimeRange = {
		'timeRange' : [ 1412533800000, 1413311400000 ],
		'maxTimeRange' : [ (moment().unix() * 1e3 - 864e5), 1419964200000 ]
	};
	$scope.timeSpanOption = 'monthly';
	$scope.dates4 = {
		startDate : moment().subtract(1, 'day'),
		endDate : moment().subtract(1, 'day')
	};
	$scope.predefinedRanges = [ {
		'label' : 'Last 7 days',
		'value' : 7
	}, {
		'label' : 'Last 15 days',
		'value' : 15
	}, {
		'label' : 'Last 30 days',
		'value' : 30
	} ];
	$scope.ranges = {
		'Today' : [ moment(), moment() ],
		'Yesterday' : [ moment().subtract('days', 1),
				moment().subtract('days', 1) ],
		'Last 7 days' : [ moment().subtract('days', 7), moment() ],
		'Last 30 days' : [ moment().subtract('days', 30), moment() ],
		'This month' : [ moment().startOf('month'), moment().endOf('month') ]
	};

	$scope.uiClasses = {
		'selectedDateClass' : 'cal-selected',
		'datePickerCellClass' : 'cal-cell',
		'predefinedRangeList' : 'cal-date-list',
		'predefinedRangeListItems' : 'cal-list-item',
		'disabledDatePicked' : 'cal-disabled',
		'disabledInnerText' : 'inner-text',
		'datePickerTable' : 'cal-table',
		'previousOutside' : 'prev-outside',
		'nextOutside' : 'next-outside',
		'currentDisabled' : 'current-disabled',
		'current' : 'current'

	};

	$scope.buttonObject = {
		'apply' : 'Apply',
		'cancel' : 'Cancel',
		'applyClass' : 'apply',
		'cancelClass' : 'cancel'
	};

	$scope.localeObject = {
		'es' : {
			'Last' : 'Última',
			'days' : 'días',
			'apply' : 'aplicar',
			'cancel' : 'cancelar'
		}
	};
});