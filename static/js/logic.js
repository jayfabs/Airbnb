var maps = L.map('maps').setView([-37.8136, 144.9631], 12);

// Add a tile layer for the map
var tileLayer = L.tileLayer('https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, Imagery © <a href="https://hot.openstreetmap.org">Humanitarian OpenStreetMap Team</a>'
}).addTo(maps);
maps.invalidateSize();

d3.json(queryurl).then(function(data) {

  var markers = L.layerGroup();

  function updateMarkers() {
    // Get the selected price range from the dropdown
    var price = document.getElementById("price").value;

    // Filter the data based on the selected price range
    var filteredData = data.features.filter(function(feature) {
      if (price === "all") {
        return true;
      } else if (price === "1") {
        return feature.properties.price >= 1 && feature.properties.price < 50;
      } else if (price === "2") {
        return feature.properties.price >= 50 && feature.properties.price <= 100;
      } else if (price === "3") {
        return feature.properties.price >= 101 && feature.properties.price <= 200;
      } else if (price === "4") {
        return feature.properties.price >= 201 && feature.properties.price <= 300;
      } else if (price === "5") {
        return feature.properties.price >= 301 && feature.properties.price <= 400;
      } else if (price === "6") {
        return feature.properties.price >= 401;
      } else {
        return false;
      }
    });
    
    // Remove the old markers
    markers.clearLayers();

    // Add new markers for the filtered data
    filteredData.forEach(function(feature) {
      var color;
      if (feature.properties.price >= 1 && feature.properties.price < 50) {
        color = "#4a4e4d"; // red
      } else if (feature.properties.price >= 50 && feature.properties.price <= 100) {
        color = "#0e9aa7"; // green
      } else if (feature.properties.price >= 101 && feature.properties.price <= 200) {
        color = "#4b86b4"; // orange
      } else if (feature.properties.price >= 201 && feature.properties.price <= 300) {
        color = "#f6cd61"; // pink
      } else if (feature.properties.price >= 301 && feature.properties.price <= 400) {
        color = "#0000FF"; // blue  
      } else {
        color = "#fe8a71"; // yellow
      }
      var popupContent = "<b>Name: </b>" + feature.properties.name + "<br>" +
                         "<b>Host: </b>" + feature.properties.host_name + "<br>" +
                         "<b>Price: </b>$" + feature.properties.price + "<br>" +
                         "<b>Availability: </b>" + feature.properties.has_availability + "<br>" +
                         "<b>Review Rating: </b>" + feature.properties.review_scores_rating;

      var marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
        radius: feature.properties.review_scores_rating / 1.5,
        fillColor: color,
        fillOpacity: 0.8,
        color: "#fff",
        weight: 1,
      }).bindPopup(popupContent); // Bind popup to marker

      markers.addLayer(marker);
    });
  }

  // Add initial markers
  updateMarkers();
  maps.addLayer(markers);

  // Listen for the change event on the select element
  document.getElementById("price").addEventListener("change", function() {
    updateMarkers();
  });
});


var legend = L.control({position: 'bottomright'});

legend.onAdd = function () {

  var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 50, 100, 200, 300, 400],
      colors = ["#4a4e4d", "#0e9aa7", "#4b86b4", "#f6cd61", "#0000FF", "#fe8a71"],
      labels = [];
  var legendInfo = "<h3 style='margin-top: 0;'>Price</h3>"
  div.innerHTML = legendInfo

  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + colors[i] + '"></i> ' +
          "$" + grades[i] + (grades[i + 1] ? '&ndash;' + "$" + grades[i + 1] + '<br>' : '+');
  }

  // Add CSS for the legend's <i> element
  div.querySelectorAll('i').forEach(function (el) {
    el.style.width = '20px';
    el.style.height = '15px';
    el.style.display = 'inline-block';
    el.style.marginRight = '5px';
  });

  return div;
};

legend.addTo(maps);

let myMap = L.map("map", {
  center: [-37.8136, 144.9631],
  zoom: 12
});

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(myMap);

let heat;

// Load the data and create a heat map layer
d3.json(queryurl).then(function(data) {

  let heatArray = [];

  data.features.forEach(function(feature) {

    let location = feature.geometry;
    if (location) {
      heatArray.push([location.coordinates[1], location.coordinates[0]]);
    }

  });
  console.log('heatArray length:', heatArray.length);
  console.log('heatArray length:', heatArray.length);


  heat = L.heatLayer(heatArray, {
    radius: 20,
    blur: 35,
    canvas: {
      width: document.getElementById('map').clientWidth,
      height: document.getElementById('map').clientHeight,
      willReadFrequently: true
    }
  }).addTo(myMap);
  myMap.whenReady(function() {
    console.log("Map is ready!");
    heat.redraw();
  });
}).catch(function(error) {
  console.log(error);
});


const mapSelector = document.querySelector('#mapSelector');
mapSelector.addEventListener('change', (event) => {
  const selectedMap = event.target.value;
  if (selectedMap === 'maps') {
    myMap.invalidateSize();
    document.getElementById('maps').hidden = false;
    document.getElementById('map').hidden = true;
    myMap.whenReady(() => myMap.invalidateSize());
  } else if (selectedMap === 'map') {
    myMap.invalidateSize();
    document.getElementById('map').hidden = false;
    document.getElementById('maps').hidden = true;
    myMap.whenReady(() => myMap.invalidateSize());
  }
});





// Get the data for the chart
d3.json(queryurl).then(function(data) {
  var prices = data.features.map(function(feature) {
    return feature.properties.price;
  });

  // Create a data object for the chart
  var chartData = {
    labels: ["0-50", "51-100", "101-200", "201-300", "301-400", "401+"],
    datasets: [{
      label: "Price Per Airbnb",
      data: [0, 0, 0, 0, 0, 0],
      backgroundColor: [
        "#4a4e4d",
        "#0e9aa7",
        "#4b86b4",
        "#f6cd61",
        "#0000FF",
        "#fe8a71"
      ]
    }]
  };

  // Update the data object with the actual data
  for (var i = 0; i < prices.length; i++) {
    if (prices[i] >= 1 && prices[i] < 50) {
      chartData.datasets[0].data[0]++;
    } else if (prices[i] >= 50 && prices[i] <= 100) {
      chartData.datasets[0].data[1]++;
    } else if (prices[i] >= 101 && prices[i] <= 200) {
      chartData.datasets[0].data[2]++;
    } else if (prices[i] >= 201 && prices[i] <= 300) {
      chartData.datasets[0].data[3]++;
    } else if (prices[i] >= 301 && prices[i] <= 400) {
      chartData.datasets[0].data[4]++;
    } else {
      chartData.datasets[0].data[5]++;
    }
  }

  // Create the chart
  var ctx = document.getElementById("acquisitions").getContext("2d");
  var acquisitions = new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      indexAxis: 'y',
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });
});


d3.json(queryurl).then(function(data) {
  
  var counts = {};
  
  // Loop through the features and count the number of superhots and none
  data.features.forEach(function(feature) {
    var host = feature.properties.host_is_superhost;
    if (host in counts) {
      counts[host]++;
    } else {
      counts[host] = 1;
    }
  });
  
  // Convert the counts object into an array of objects suitable for the chart
  var chartData = {
    labels: Object.keys(counts),
    datasets: [{
      label: "Is Superhost?",
      data: Object.values(counts),
      backgroundColor: ["#009688", "#65c3ba"],
    }]
  };
  
  // Create the chart
  var ctx = document.getElementById("host").getContext("2d");
var listings = new Chart(ctx, {
  type: "doughnut",
  data: chartData,
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Host is Superhost?'
      }
    },
    legend: {
      display: false
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }
});

});

d3.json(queryurl).then(function(data) {
  
  var chartData = {
    datasets: [{
      label: "Review Scores Rating",
      data: data.features.map(function(feature) {
        return {
          y: feature.properties.number_of_reviews,
          x: feature.properties.review_scores_rating
        };
      }),
      backgroundColor: "#005b96"
    }]
  };
  
  // Create the chart
  var ctx = document.getElementById("ratings").getContext("2d");
  var ratingsChart = new Chart(ctx, {
    type: "scatter",
    data: chartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Review Scores Rating vs. Number of Reviews'
        }
      },
      scales: {
        xAxes: [{
          type: 'linear',
          position: 'bottom',
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: '# of Reviews'
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true
          },
          scaleLabel: {
            display: true,
            labelString: 'Review Scores Rating'
          }
        }]
      }
    }
  });
});


d3.json(queryurl).then(function(data) {

  // Create an object to store the counts for each year
  var counts = {};

  // Loop through the features and count the number of hosts for each year
  data.features.forEach(function(feature) {
    var year = feature.properties.host_since.split("/")[2];
    if (year in counts) {
      counts[year]++;
    } else {
      counts[year] = 1;
    }
  });

  // Convert the counts object into an array of objects suitable for the chart
  var chartData = {
    labels: Object.keys(counts),
    datasets: [{
      label: "Number of Hosts",
      data: Object.values(counts),
      fill: false,
      borderColor: "#009688",
      pointRadius: 4,
      pointHoverRadius: 8,
      lineTension: 0.3
    }]
  };

  // Create the chart
  var ctx = document.getElementById("neighborhoods").getContext("2d");
  var newchart = new Chart(ctx, {
    type: "line",
    data: chartData,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Number of Hosts by Host Since Year'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Host Since Year'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Number of Hosts'
          },
          ticks: {
            beginAtZero: true
          }
        }
      }
    }
  });
});


