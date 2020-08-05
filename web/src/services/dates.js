export function getTimeDiffAndPrettyText(startDate, endDate) {

  var oResult = {};

  var nDiff = endDate.getTime() - startDate.getTime();

  // Get diff in days
  oResult.days = Math.floor(nDiff / 1000 / 60 / 60 / 24);
  nDiff -= oResult.days * 1000 * 60 * 60 * 24;

  // Get diff in hours
  oResult.hours = Math.floor(nDiff / 1000 / 60 / 60);
  nDiff -= oResult.hours * 1000 * 60 * 60;

  // Get diff in minutes
  oResult.minutes = Math.floor(nDiff / 1000 / 60);
  nDiff -= oResult.minutes * 1000 * 60;

  // Get diff in seconds
  oResult.seconds = Math.floor(nDiff / 1000);

  // Render the diffs into friendly duration string

  // Days
  var sDays = '00';
  if (oResult.days > 0) {
      sDays = String(oResult.days);
  }
  if (sDays.length === 1) {
      sDays = '0' + sDays;
  }

  // Format Hours
  var sHour = '00';
  if (oResult.hours > 0) {
      sHour = String(oResult.hours);
  }
  if (sHour.length === 1) {
      sHour = '0' + sHour;
  }

  //  Format Minutes
  var sMins = '00';
  if (oResult.minutes > 0) {
      sMins = String(oResult.minutes);
  }
  if (sMins.length === 1) {
      sMins = '0' + sMins;
  }

  //  Format Seconds
  var sSecs = '00';
  if (oResult.seconds > 0) {
      sSecs = String(oResult.seconds);
  }
  if (sSecs.length === 1) {
      sSecs = '0' + sSecs;
  }

  //  Set Duration
  var sDuration = sDays + ':' + sHour + ':' + sMins + ':' + sSecs;
  oResult.duration = sDuration;

  // Set friendly text for printing
  if(oResult.days === 0) {

      if(oResult.hours === 0) {

          if(oResult.minutes === 0) {
              var sSecHolder = oResult.seconds > 1 ? 'Seconds' : 'Second';
              oResult.friendlyNiceText = oResult.seconds + ' ' + sSecHolder;
          } else {
              var sMinutesHolder = oResult.minutes > 1 ? 'Minutes' : 'Minute';
              oResult.friendlyNiceText = oResult.minutes + ' ' + sMinutesHolder;
          }

      } else {
          var sHourHolder = oResult.hours > 1 ? 'Hours' : 'Hour';
          oResult.friendlyNiceText = oResult.hours + ' ' + sHourHolder;
      }
  } else {
      var sDayHolder = oResult.days > 1 ? 'Days' : 'Day';
      oResult.friendlyNiceText = oResult.days + ' ' + sDayHolder;
  }

  return oResult;
}