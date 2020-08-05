var getJSON = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'json';
  xhr.onload = function () {
    var status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};
var palette = ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"]
var getColor = function (i) {
  return palette[i % 8]
}

getJSON('/data/system_monitor_log.json', function (err, raw_data) {
  if (err !== null) {
    console.log('Something went wrong: ' + err);
    return
  }
  var data = raw_data.slice(-60)
  var available_keys = Object.keys(data[0]);
  var cpu_count = available_keys.filter(item => /cpu_usage_\d/.test(item)).length
  var cpuCoresChart = new Chart(document.getElementById('cpuCores').getContext('2d'), {
    type: 'line',
    data: {
      datasets: Array.from({length: cpu_count}, (_, i) => ({
        label: 'Usage of CPU #' + (i + 1),
        backgroundColor: getColor(i),
        borderColor: getColor(i),
        fill: false,
        data: data.map(item => ({
          x: new Date(item.timestamp),
          y: item['cpu_usage_' + (i + 1)]
        })),
      })),
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'CPU per core usage'
      },
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
          ticks: {
            major: {
              fontStyle: 'bold',
              fontColor: '#FF0000'
            }
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Usage perc.'
          }
        }]
      }
    }
  });
  var cpuOverallChart = new Chart(document.getElementById('cpuOverall').getContext('2d'), {
    type: 'line',
    data: {
      datasets: [1, 5, 15].map((interval, i) => ({
        label: 'Average usage last ' + interval + ' minutes',
        backgroundColor: getColor(i * 3),
        borderColor: getColor(i * 3),
        fill: false,
        data: data.map(item => ({
          x: new Date(item.timestamp),
          y: item["cpu_average_" + interval + "_minute"] || item["cpu_average_" + interval + "_minutes"]
        })),
      })),
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'CPU average usage'
      },
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
          ticks: {
            major: {
              fontStyle: 'bold',
              fontColor: '#FF0000'
            }
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Usage perc.'
          }
        }]
      }
    }
  });
  var ramChart = new Chart(document.getElementById('ram').getContext('2d'), {
    type: 'line',
    data: {
      datasets: [{
        label: "Ram usage",
        backgroundColor: getColor(4),
        borderColor: getColor(4),
        fill: false,
        data: data.map(item => ({
          x: new Date(item.timestamp),
          y: item["ram_usage_percentage"]
        })),
      }],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Ram average usage'
      },
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
          ticks: {
            major: {
              fontStyle: 'bold',
              fontColor: '#FF0000'
            }
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Usage perc.'
          }
        }]
      }
    }
  });
  var disks_count = available_keys.filter(item => /disk_\d_device/.test(item)).length
  var diskUsagePercChart = new Chart(document.getElementById('diskUsagePerc').getContext('2d'), {
    type: 'line',
    data: {
      datasets: Array.from({length: disks_count}, (_, i) => ({
        label: data[0]["disk_" + (i + 1) + "_device"],
        backgroundColor: getColor(i * 3),
        borderColor: getColor(i * 3),
        fill: false,
        data: data.map(item => ({
          x: new Date(item.timestamp),
          y: item['disk_' + (i + 1) + '_usage']
        })),
      })),
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Disk usage perc.'
      },
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
          ticks: {
            major: {
              fontStyle: 'bold',
              fontColor: '#FF0000'
            }
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Usage perc.'
          }
        }]
      }
    }
  });
  var diskSpaceLeftChart = new Chart(document.getElementById('diskSpaceLeft').getContext('2d'), {
    type: 'line',
    data: {
      datasets: Array.from({length: disks_count}, (_, i) => ({
        label: data[0]["disk_" + (i + 1) + "_device"],
        backgroundColor: getColor(i * 3),
        borderColor: getColor(i * 3),
        fill: false,
        data: data.map(item => ({
          x: new Date(item.timestamp),
          y: item['disk_' + (i + 1) + '_available'] / (10 ** 9)
        })),
      })),
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Disk space left (GB)'
      },
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
          ticks: {
            major: {
              fontStyle: 'bold',
              fontColor: '#FF0000'
            }
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Usage GB.'
          }
        }]
      }
    }
  });
  var nets_count = available_keys.filter(item => /net_\d_name/.test(item)).length;
  var networkChart = new Chart(document.getElementById('network').getContext('2d'), {
    type: 'line',
    data: {
      datasets: [].concat.apply([], Array.from({length: nets_count}, (_, i) => [
          ({
          label: "Download: " + data[0]["net_" + (i + 1) + "_name"],
          backgroundColor: getColor(i * 2),
          borderColor: getColor(i * 2),
          fill: false,
          data: data.map(item => ({
            x: new Date(item.timestamp),
            y: item['net_' + (i + 1) + '_bytes_recv'] / (10 ** 9)
          })),
        }), ({
          label: "Upload: " + data[0]["net_" + (i + 1) + "_name"],
          backgroundColor: getColor(i * 2),
          borderColor: getColor(i * 2),
          fill: false,
          data: data.map(item => ({
            x: new Date(item.timestamp),
            y: item['disk_' + (i + 1) + '_bytes_sent'] / (10 ** 9)
          })),
        })
      ])),
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Network usage (GB)'
      },
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
          ticks: {
            major: {
              fontStyle: 'bold',
              fontColor: '#FF0000'
            }
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Usage GB.'
          }
        }]
      }
    }
  });
  var temp_keys = available_keys.filter(item => /temp_\d_temp_\d_current/.test(item));
  var temperaturesChart = new Chart(document.getElementById('temperatures').getContext('2d'), {
    type: 'line',
    data: {
      datasets: temp_keys.map((key, i) => {
        var key_split = key.split('_')
        var label = data[0]['temp_' + key_split[1] + '_name']
        var sub = data[0]['temp_' + key_split[1] + '_temp_' + key_split[3] + '_label']
        if(sub) {
          label += ' - ' + sub
        }
        return ({
          label: label,
          backgroundColor: getColor(i),
          borderColor: getColor(i),
          fill: false,
          data: data.map(item => ({
            x: new Date(item.timestamp),
            y: item[key]
          })),
        })
      }),
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Temperature sensors'
      },
      scales: {
        xAxes: [{
          type: 'time',
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
          ticks: {
            major: {
              fontStyle: 'bold',
              fontColor: '#FF0000'
            }
          }
        }],
        yAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: 'Temp. deg. C'
          }
        }]
      }
    }
  });
});

