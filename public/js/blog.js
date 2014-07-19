var jumboHeight = $('.jumbotron').outerHeight();

$(window).scroll(function() {
  if(window.innerWidth < 480) {
    return;
  }

  //var scrolled = $(window).scrollTop();
    //$('.bg').css('height', (jumboHeight - scrolled) + 'px');
    //$('.bg').css('background-position', '0 ' + (0 - (scrolled / 2)) + 'px');
  //$('.jumbotron').css('background-position', '0 ' + (0 - (scrolled / 2)) + 'px');
});
/*
var setBackgroundImage = function(now) {
  var mapRange = function(from, to, s) {
    return to[0] + (s - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
  };

  var minutes = (now.getHours() * 60) + now.getMinutes();

  var maxRed = 0.2;
  var maxGreen = 0.4;
  var maxBlue = 0.90;
  var maxLightness = 0.8;

  var red = mapRange([0, 1440], [0, maxRed], minutes);
  var green = mapRange([0, 1440], [0, maxGreen], minutes);
  var blue = mapRange([0, 1440], [0, maxBlue], minutes);
  var lightness = mapRange([0, 1440], [0, maxLightness], minutes);

  if(now.getHours() > 12) {
    red = maxRed - red;
    green = maxGreen - green;
    blue = maxBlue - blue;
    lightness = maxLightness - lightness;
  }

  var colour = one.color('#808080').lightness(lightness).red(red).blue(blue).green(green).hex();
  $('.jumbotron').css('background-color', colour);
}

setBackgroundImage(new Date());
setInterval(function() {
  setBackgroundImage(new Date());
}, 60000);
*/
/*
var minute = 0;
var hour = 0;

setInterval(function() {
  var date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);

  minute++;

  if(minute == 60) {
    minute = 0;
    hour++;

    console.info(hour, "o'clock");
  }

  if(hour == 24) {
    hour = 0;
    minute = 0;
    console.info("night night")
  }

  setBackgroundImage(date);
}, 10);
*/
