'use strict';
app.directive('calendar',function($parse, $timeout){
	return {
        restrict: 'C',
        templateUrl: 'js/app/templates/calendar.html',
        link: function(scope, element, attrs) {
        	console.log('this @ start', this);
        	var _this = this;
            var translator = {
                'fr': {
                    'Last': 'dernier',
                    'days': 'journées'
                },
                'hi': {
                    'Last': 'पिछले',
                    'days': 'दिन',
                    'apply': 'लागू',
                    'cancel': 'रद्द',
                    'symbolMap': {
                        '1': '१',
                        '2': '२',
                        '3': '३',
                        '4': '४',
                        '5': '५',
                        '6': '६',
                        '7': '७',
                        '8': '८',
                        '9': '९',
                        '0': '०'
                    },
                    'numberMap': {
                        '१': '1',
                        '२': '2',
                        '३': '3',
                        '४': '4',
                        '५': '5',
                        '६': '6',
                        '७': '7',
                        '८': '8',
                        '९': '9',
                        '०': '0'
                    }
                }
            };
            var startDayOfWeek = 1;
            var diff;
            var date;
            var lastSelectedDaysEle = element.find('.last-days-text');
            var visibleDateFormat = attrs.visibleDateFormat;
            scope.numberOfCalendar = parseInt(attrs.noOfCal);
            attrs.$observe('predefinedRanges', function(val) {
                scope.predefinedDateRanges = JSON.parse(val);
            });
            attrs.$observe('timeRangeObject', function(val) {
                val = JSON.parse(val);
                var calTimeRange = val.timeRange;
                var maxTimeRange = val.maxTimeRange;
                date = moment(calTimeRange[0]);
                scope.startTime = calTimeRange[0] / 1e3;
                scope.endTime = calTimeRange[1] / 1e3;
                scope.calendarStartDate = maxTimeRange[0];
                scope.calendarEndDate = maxTimeRange[1];
            });
            attrs.$observe('timeSpanOption', function(val) {
                scope.timeSpanOption = val;
            });
            attrs.$observe('uiClasses', function(val) {
                scope.uiClassObject = JSON.parse(val);
            });
            attrs.$observe('buttonObject', function(val) {
                scope.buttonObject = JSON.parse(val);
            });
            attrs.$observe('append', function(val){
               val = JSON.parse(val);
               scope.append = val;
            });
            scope.noOfMonths = [];
            scope.datePicker = (attrs.datePicker) ? true : false;
            console.log('this',_this);
            console.log('scope',scope);
            //this
            scope.getMonthObject = function(date) {
                var weekDay = date.startOf('month').weekday();
                var monthObject = {
                    'firstWeekDayNumber': weekDay,
                    'numberOfDaysInLastMonth': date.clone().day(-1).daysInMonth(),
                    'daysInMonth': date.daysInMonth(),
                    'weekEndingIndex': (7 - weekDay + startDayOfWeek),
                    'currentMonth': date.month(),
                    'nextMonthStartingIndex': 1,
                    'dateIndex': 1
                }
                if((date.clone().month() === moment(scope.calendarStartDate).clone().month()) && (date.clone().year() === moment(scope.calendarStartDate).clone().year())) {
                    scope.disablePreviousMonth = true;
                }
                if((date.clone().month() === moment(scope.calendarEndDate).clone().month()) && (date.clone().year() === moment(scope.calendarEndDate).clone().year())) {
                    scope.disableNextMonth = true;
                }
                return monthObject;
            }
            //this
            scope.createCalendar = function(monthObject) {
                scope.months = [{
                    'week': []
                }, {
                    'week': []
                }, {
                    'week': []
                }, {
                    'week': []
                }, {
                    'week': []
                }, {
                    'week': []
                }];
                var dayOffset;
                if((monthObject.firstWeekDayNumber - startDayOfWeek) > 0) {
                    dayOffset = (monthObject.firstWeekDayNumber - startDayOfWeek);
                } else {
                    var previousDate = date.clone().month(monthObject.currentMonth - 1).endOf('month');
                    var previousMonthDays = date.clone().month(monthObject.currentMonth - 1).daysInMonth();
                    diff = previousDate.clone().day() - startDayOfWeek;
                    if(diff < 0) {
                        diff = (7 + diff);
                    }
                    dayOffset = previousMonthDays - previousDate.clone().subtract(diff, 'day').date() + 1;
                }
                monthObject.numberOfDaysInLastMonth -= (dayOffset - 1);
                for(var i = 0; i < dayOffset; i++) {
                    scope.months[0].week.push({
                        'date': date.clone().month(monthObject.currentMonth - 1).date(monthObject.numberOfDaysInLastMonth),
                        'cssClass': scope.uiClassObject.previousOutside
                    });
                    monthObject.numberOfDaysInLastMonth++;
                }
                for(var j = dayOffset; j <= 6; j++) {
                    var currentDate = date.clone().date(monthObject.dateIndex);
                    scope.months[0].week.push({
                        'date': currentDate,
                        'cssClass': ((currentDate.unix() < scope.calendarStartDate / 1e3) || (currentDate.unix() > scope.calendarEndDate / 1e3)) ? scope.uiClassObject.currentDisabled : scope.uiClassObject.current
                    });
                    monthObject.dateIndex++;
                }
                angular.forEach(scope.months, function(childData, index) {
                    if(index !== 0) {
                        for(var i = 0; i < 7; i++) {
                            if(monthObject.dateIndex > monthObject.daysInMonth) {
                                scope.months[index].week.push({
                                    'date': date.clone().month(monthObject.currentMonth + 1).date(monthObject.nextMonthStartingIndex),
                                    'cssClass': scope.uiClassObject.nextOutside
                                });
                                monthObject.nextMonthStartingIndex++;
                            } else {
                                var currentDate = date.clone().date(monthObject.dateIndex);
                                scope.months[index].week.push({
                                    'date': currentDate,
                                    'cssClass': ((currentDate.unix() < scope.calendarStartDate / 1e3) || (currentDate.unix() > scope.calendarEndDate / 1e3)) ? scope.uiClassObject.currentDisabled : scope.uiClassObject.current
                                });
                            }
                            monthObject.dateIndex++;
                        }
                    }
                });
                scope.noOfMonths.push(scope.months);
                //scope.refreshRangeSelection();
            }
            scope.selectDate = function(selectedDay) {
                if(scope.isCellSelectable(selectedDay) && (attrs.datePicker === void 0 || attrs.datePicker === 'false')) {
                    var selectedTimeStamp = selectedDay.date.unix();
                    var selectedDate = moment(selectedTimeStamp * 1e3);
                    var weekStartDay = selectedDate.clone().weekday(0);
                    var weekEndDay = selectedDate.clone().weekday(6);
                    var monthStartDay = selectedDate.clone().date(1);
                    var monthEndDay = selectedDate.clone().date(selectedDate.daysInMonth());
                    if(selectedTimeStamp <= scope.startime) {
                        scope.getStartTimeForWeekAndMonth(selectedTimeStamp, weekStartDay, monthStartDay);
                    } else if(selectedTimeStamp >= scope.endTime) {
                        scope.getEndTimeForWeekAndMonth(selectedTimeStamp, weekEndDay, monthEndDay);
                    } else {
                        if((selectedTimeStamp - scope.startTime) >= (scope.endTime - selectedTimeStamp)) {
                            scope.getEndTimeForWeekAndMonth(selectedTimeStamp, weekEndDay, monthEndDay);
                        } else {
                            scope.getStartTimeForWeekAndMonth(selectedTimeStamp, weekStartDay, monthStartDay);
                        }
                    }
                } else {
                    scope.startTime = scope.endTime = selectedDay.date.unix();
                }
                scope.setModelVal();
            }
            scope.goToPreviousMonth = function() {
                var curMonth = date.month();
                var previousMonthNumber = Math.abs(date.clone().month() - (scope.numberOfCalendar));
                var previousMonth = (previousMonthNumber > 11) ? (previousMonthNumber % 12) : previousMonthNumber;
                var previousYear = date.clone().month(previousMonth).year();
                var minStartMonth = moment(scope.calendarStartDate).clone().month();
                var minStartyear = moment(scope.calendarStartDate).clone().year();
                if((previousMonth <= minStartMonth) && (previousYear <= minStartyear)) {
                    return;
                }
                scope.disableNextMonth = false;
                scope.noOfMonths = [];
                date = date.clone().month(curMonth - (scope.numberOfCalendar + 1));
                for(var i = 0; i < scope.numberOfCalendar; i++) {
                	console.log('1');
                    scope.createCalendar(scope.getMonthObject(date));
                    var curMonth = date.month();
                    date = date.clone().month(curMonth + 1);
                }
            }
            scope.goToNextMonth = function() {
                var curMonth = date.month();
                var nextMonthNumber = date.clone().month(); // + (scope.numberOfCalendar - 1);
                var nextMonth = (nextMonthNumber > 11) ? (nextMonthNumber % 12) : nextMonthNumber;
                var nextYear = date.clone().month(nextMonth).year();
                var maxEndMonth = moment(scope.calendarEndDate).clone().month();
                var maxEndyear = moment(scope.calendarEndDate).clone().year();
                if(date.unix() > moment(scope.calendarEndDate).clone().unix()) {
                    return;
                }
                scope.disablePreviousMonth = false;
                scope.noOfMonths = [];
                date = date.clone().month(curMonth - (scope.numberOfCalendar - 1));
                for(var i = 0; i < scope.numberOfCalendar; i++) {
                	console.log('2');
                    scope.createCalendar(scope.getMonthObject(date));
                    var curMonth = date.month();
                    date = date.clone().month(curMonth + 1);
                }
            }
			
			scope.selectPredefinedDate = function(endTime, offset) {
                scope.lastDayCounter = offset;
                scope.endTime = endTime;
                scope.startTime = endTime - ((offset - 1) * 864e2);
            };
            scope.initializeCalendar = function() {
                for(var i = 0; i < scope.numberOfCalendar; i++) {
                	console.log('3');
                    scope.createCalendar(scope.getMonthObject(date));
                    var curMonth = date.month();
                    date = date.clone().month(curMonth + 1);
                }
            };
            scope.hoverDate = function(day) {
                if(scope.timeSpanOption === 'weekly') {
                    scope.hoveredObject = day.week();
                } else if(scope.timeSpanOption === 'monthly') {
                    scope.hoveredObject = day.month();
                }
            };
            scope.getEndTimeForWeekAndMonth = function(selectedTimeStamp, weekEndDay, monthEndDay) {
                if(scope.timeSpanOption === 'weekly') {
                    selectedTimeStamp = weekEndDay.unix();
                } else if(scope.timeSpanOption === 'monthly') {
                    selectedTimeStamp = monthEndDay.unix();
                }
                scope.endTime = selectedTimeStamp;
            };
            scope.getStartTimeForWeekAndMonth = function(selectedTimeStamp, weekStartDay, monthStartDay) {
                if(scope.timeSpanOption === 'weekly') {
                    selectedTimeStamp = weekStartDay.unix();
                } else if(scope.timeSpanOption === 'monthly') {
                    selectedTimeStamp = monthStartDay.unix();
                }
                scope.startTime = selectedTimeStamp;
            };
            scope.hoverOutTable = function() {
                scope.hoveredObject = 'daily';
            };
            scope.isCellSelectable = function(selectedDay) {
                return([scope.uiClassObject.previousOutside, scope.uiClassObject.nextOutside, scope.uiClassObject.currentDisabled].indexOf(selectedDay.cssClass) === -1);
            };
            scope.getClassName = function(day) {
                var selectedClassArray = [];
                if(day.date.unix() >= scope.startTime && day.date.unix() <= scope.endTime && scope.isCellSelectable(day)) {
                    selectedClassArray.push(scope.uiClassObject.selectedDateClass);
                }
                if((scope.timeSpanOption == 'monthly' && scope.hoveredObject == day.date.month() && day.cssClass == 'current') || (scope.timeSpanOption == 'weekly' && scope.hoveredObject == day.date.week() && day.cssClass == 'current')) {
                    selectedClassArray.push('hovered');
                }
                return selectedClassArray;
            };
            scope.getDisabledMonth = function() {
                return(scope.disablePreviousMonth) ? scope.uiClassObject.disabledDatePicker : '';
            };
            scope.addCustomRange = function() {
                var lastDayCounter = scope.translateDate(scope.lastDayCounter, 'numberMap');
                if(lastDayCounter && parseInt(lastDayCounter) > 0 && !find(scope.predefinedDateRanges, 'value', lastDayCounter)) {
                    scope.predefinedDateRanges.push({
                        'label': 'Last ' + scope.translateDate(scope.lastDayCounter, 'numberMap') + ' days',
                        'value': parseInt(lastDayCounter),
                        'custom': true,
                        'hovered': false
                    });
                    if(attrs.locale) {
                        scope.predefinedDateRanges = translateCalendar(scope.predefinedDateRanges, attrs.locale, 'true');
                    }
                }
            };
            scope.removeListItem = function(index) {
                scope.predefinedDateRanges.splice(index, 1);
            };
            scope.hoverListItem = function(index) {
                if(scope.predefinedDateRanges[index].hovered !== void 0) {
                    scope.predefinedDateRanges[index].hovered = true;
                }
            };
            scope.hoverOutList = function() {
                angular.forEach(scope.predefinedDateRanges, function(val) {
                    if(val.hovered !== void 0) {
                        val.hovered = false;
                    }
                });
            };
            lastSelectedDaysEle.on('blur', function() {
                $timeout(function() {
                    scope.selectPredefinedDate(scope.endTime, scope.lastDayCounter);
                });
            });
            scope.test = function() {
                scope.lastDayCounter = scope.translateDate(angular.element('.last-days-text').val(), 'symbolMap');
            };
            $timeout(function() {
                if(attrs.datePicker === 'true') {
                    scope.startTime = scope.endTime = moment().hour(0).minute(0).second(0).millisecond(0).unix();
                    date = moment(scope.startTime * 1e3);
                }
                scope.setupObjects();
                scope.tanslateButtonText();
                scope.setModelVal();
                scope.initializeCalendar();
            }, 0);
            scope.setModelVal = function() {
                scope.calDateRange = moment(scope.startTime * 1e3).format(visibleDateFormat) + ((attrs.datePicker === void 0 || attrs.datePicker === 'false') ? (' - ' + moment(scope.endTime * 1e3).format(visibleDateFormat)) : '');
            };
			scope.translateDate = function(date, map) {
                if(attrs.locale) {
                    date = date.toString();
                    var dateString = '';
                    angular.forEach(date.split(''), function(val) {
                        if(translator[attrs.locale][map] && translator[attrs.locale][map].hasOwnProperty(val)) {
                            dateString += translator[attrs.locale][map][val];
                        } else {
                            dateString += val;
                        }
                    });
                    return dateString;
                } else {
                    return date;
                }
            };
            
            scope.tanslateButtonText = function(){
                if(attrs.locale !== void 0 && attrs.locale !== 'en-gb') {
                    angular.forEach(scope.buttonObject, function(value, key) {
                        if(translator[attrs.locale].hasOwnProperty(key)) {
                            scope.buttonObject[key] = translator[attrs.locale][key];
                        }
                    });
                }  
            };
            
            scope.setupObjects = function(){
                (attrs.locale) ? moment.locale(attrs.locale): moment.locale('en-gb');
                scope.locale = (attrs.locale) ? attrs.locale : 'en-gb';
                scope.weekDays = moment.weekdaysMin();
                scope.Last = (attrs.locale !== void 0 && attrs.locale !== 'en-gb' && translator[attrs.locale]['Last']) ? translator[attrs.locale].Last : 'Last';
                scope.days = (attrs.locale !== void 0 && attrs.locale !== 'en-gb' && translator[attrs.locale]['days']) ? translator[attrs.locale].days : 'days';  
                for(var shiftIndex = 0; shiftIndex < startDayOfWeek; shiftIndex++) {
                    var a = scope.weekDays.shift();
                    scope.weekDays.push(a);
                }
                scope.predefinedDateRanges = (attrs.locale) ? translateCalendar(scope.predefinedDateRanges, attrs.locale) : scope.predefinedDateRanges;
            };
            
            scope.append = function(val){
                   angular.forEach(val, function(value, key){
                      translator[key] = val[key]; 
                   });
            };    
            

            function translateCalendar(val, locale, alreadyTranslated) {
                var tempArray;
                tempArray = (val.length > attrs.predefinedRanges.length) ? [val[val.length - 1]] : val;
                angular.forEach(tempArray, function(value, key) {
                    var key = '';
                    angular.forEach(value.label.split(' '), function(word) {
                        if(translator[locale].hasOwnProperty(word)) {
                            key += translator[locale][word] + ' ';
                        } else {
                            key += scope.translateDate(word, 'symbolMap') + ' ';
                        }
                    });
                    value.label = key;
                });
                if(val.length > attrs.predefinedRanges.length) {
                    val[val.length - 1] = tempArray[0];
                }
                return val;
            }

            function find(arr, key, val) { // Find array element which has a key value of val 
                for(var index = 0; index < arr.length; index++) {
                    if(parseInt(arr[index].value, 10) === parseInt(val, 10)) {
                        return true;
                    }
                }
                return false;
            }
        }
    };
});