var currentMonth = null;
var currentDay   = null;

var PossibleDates = [
  ["May", 15], ["May", 16], ["May", 19],
  ["June", 17], ["June", 18],
  ["July", 14], ["July", 16],
  ["August", 14], ["August", 15], ["August", 17]
];

var DaysForMonth = { "May": [15, 16, 19], "June": [17, 18], "July": [14, 16], "August": [14, 15, 17] };
var MonthsForDay = { 14: ["July", "August"], 15: ["May", "August"], 16: ["May", "July"], 17: ["June", "August"], 18: ["June"], 19: ["May"] };

var aPossibles  = {};
var bPossibles  = {};

var clauses     = [];

$(document).ready(function() {

  $('#options button').click(function() {
    currentMonth = $(this).data('month');
    currentDay   = $(this).data('day');

    $('#options button').removeClass('currentDay');
    $(this).addClass('currentDay');
    $(this).blur();
    $('.setdate').text( $(this).text() );

    simulateProblem();
  });

  $('p, span').hover(function() {
    if ($(this).data('reference')) {
      // $("#" + $(this).data('reference')).addClass('cause');
      $("#" + $(this).data('reference')).animate({ 'background-color': '#ffffaa' }, 600);
    }
  }, function() {
    // $('.cause').removeClass('cause');
    $("#" + $(this).data('reference')).animate({ 'background-color': 'rgba(0,0,0,0)' }, 600);
  });
});

function displayOutput(str) {
  $('#statement').text(str);
}

function displayMind(id, mind) {
  var str = '';

  $.each(PossibleDates, function(idx2, val) {
    var k = val.join('_');
    var text = val.join('&nbsp;');

    if (mind[k] === true) {
      str += "<span class='valid'>" + text + "</span>";
    } else {
      str += "<span class='invalid' title='" + mind[k] + "'>" + text + "</span>";
    }
  });

  $("#" + id).html(str);
}

function simulateProblem() {
  clearProblem();
  tellAMonth();
  tellBDay();

  validateClause(1);
  validateClause(2);

  if (!(clauses[1] && clauses[2])) {
    $('#statement2, #statement3').addClass('skip');
    $('#conclusion0').show();
    return;
  }

  validateClause(3);

  processStatement1();

  validateClause(4);

  if (!(clauses[3] && clauses[4])) {
    $('#statement3').addClass('skip');
    $('#conclusion1').show();
    return;
  }

  processStatement2();

  validateClause(5);

  if (clauses[5]) {
    $('#conclusion3').show();
  } else {
    $('#conclusion2').show();
  }
}

function clearProblem() {
  aPossibles = {};

  $.each(PossibleDates, function(idx, val) {
    aPossibles[val.join('_')] = true;
    bPossibles[val.join('_')] = true;
  });

  $('#bSummary, #bConclusion, #aSummary, #aConclusion, .finalConclusion').hide();
  $('span').removeAttr('data-valid');
  $('span').removeAttr('data-invalid');
  $(".aDaysNotKnow, .aDaysKnow, .bMonthsNotHear, .bMonthsHear, .aDaysJuly, .aDaysAugust").hide();
  $(".aSay, .bSay").removeClass('skip');
}

function tellAMonth() {
  $.each(PossibleDates, function(idx, val) {
    var k = val.join('_');

    if (aPossibles[k] === true) {
      if (val[0] != currentMonth) {
        aPossibles[k] = "Wrong month";
      }
    }
  });

  $('#toldA').html("I was born in <b>" + currentMonth + "</b> &raquo; ");

  $('#aDays').html("Cheryl's birthday is in " + currentMonth + ", so Bernard heard " + DaysForMonth[currentMonth].join(" <i>or</i> ") + ".");
  $('#aDays').show();

  $.each(DaysForMonth[currentMonth], function(idx, val) {
    $('#aDays' + val).show();
  });
}

function tellBDay() {
  $.each(PossibleDates, function(idx, val) {
    var k = val.join('_');

    if (bPossibles[k] === true) {
      if (val[1] != currentDay) {
        bPossibles[k] = "Wrong day";
      }
    }
  });

  $('#toldB').html("&laquo; I was born on the <b>" + currentDay + "</b>th");
}

function processStatement1() {
  $.each(PossibleDates, function(idx, val) {
    var k = val.join('_');

    if (bPossibles[k] === true) {
      if (val[0] != 'July' && val[0] != 'August') {
        bPossibles[k] = "month could lead Albert to think I have a unique solution";
      }
    }
  });

  $('#bSummary').html("Cheryl's birthday is on the " + currentDay + "th, so Albert heard " + MonthsForDay[currentDay].join(" <i>or</i> ") + ".");

  $.each(MonthsForDay[currentDay], function(idx, val) {
    $('#bMonths' + val).show();
  });

  if (validDateCount(bPossibles) == 1) {
    $('#bConclusion').html("I know Cheryl's birthday is <b>" + onlyDate(bPossibles) + "</b>.");
  } else {
    $('#bConclusion').html("Cheryl's birthday is " + validDates(bPossibles).join(" <i>or</i> ") + ".");
  }

  $('#bConclusion').show();
}

function validMonthsOnDate(mind, day) {
  var months = [];

  $.each(PossibleDates, function(idx, val) {
    var k = val.join('_');

    if (mind[k] === true && val[1] == day && months.indexOf(val[0]) == -1) { months.push(val[0]); }
  });

  return months;
}

function processStatement2() {
  $('.aDays' + currentMonth).show();

  $('#aSummary').show();

  $.each(PossibleDates, function(idx, val) {
    var k = val.join('_');

    if (aPossibles[k] === true) {
      if (val[1] == 14) {
        aPossibles[k] = "This day would not have led Bernard to a unique day.";
      }
    }
  });

  if (validDateCount(aPossibles) == 1) {
    $('#aConclusion').html("I know Cheryl's birthday is <b>" + onlyDate(aPossibles) + "</b>.");
  } else {
    $('#aConclusion').html("Cheryl's birthday is " + validDates(aPossibles).join(" <i>or</i> ") + ".");
  }

  $('#aConclusion').show();

}

function validateClause(clauseno) {
  var valid  = this['clause' + clauseno + 'Valid']();
  var clause = $('#clause' + clauseno);

  clauses[clauseno] = (valid === true);

  if (clauses[clauseno]) {
    clause.attr('data-valid', true);
    clause.removeAttr('data-invalid');
    clause.removeData('reference');
    clause.removeAttr('data-reference');
  } else {
    clause.removeAttr('data-valid');
    clause.attr('data-invalid', true);
    clause.data('reference', valid);
    clause.attr('data-reference', valid);
  }
}

function validDates(mind) {
  var valids = [];

  $.each(PossibleDates, function(idx, val) {
    var k = val.join('_');
    if (mind[k] === true) { valids.push(val.join(' ') + "th"); }
  });

  return valids;
}

function validDateCount(mind) {
  return validDates(mind).length;
}

function onlyDate(mind) {
  return validDates(mind)[0];
}

function clause1Valid() {
  // return validDateCount(aPossibles) > 1;
  return true;
}

function clause2Valid() {
  var valid = true;

  $.each(DaysForMonth[currentMonth], function(idx, day) {
    if (MonthsForDay[day].length == 1) {
      valid = "aDays" + day;
      // "If the day was " + day + ", then Bernard would know it is " + currentMonth + " " + currentDay;
    }
  });

  return valid;
}

function clause3Valid() {
  // var count = validDateCount(bPossibles);

  // if (count > 1) {
  //   return true;
  // } else {
  //   return "It could only have been " + onlyDate(bPossibles).join(' ');
  // }
  return true;
}

function clause4Valid() {
  if (validDateCount(bPossibles) == 1) {
    return true;
  } else {
    return "bConclusion";
    // "It could be " + validDates(bPossibles).join(" or ") + ".";
  }
}

function clause5Valid() {
  if (validDateCount(aPossibles) == 1) {
    return true;
  } else {
    return "aConclusion";
    // "It could be " + validDates(aPossibles).join(" or ") + ".";
  }
}

