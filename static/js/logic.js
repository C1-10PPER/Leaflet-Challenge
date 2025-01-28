// Created a Satellite tile layer
let satellite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
});

// Created a street tile layer as a second background of the map
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Created a Outdoor tile layer as a third background of the map
let outdoor = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors, © OpenTopoMap'
});

// Created the map object with center and zoom options.
let map = L.map('map', {
  center: [20, 0], // Global center
  zoom: 2,
  layers: [satellite] // Default to Satellite
});

// Added the 'basemap' tile layer to the map.
satellite.addTo(map);

// Created the layer groups for earthquakes and tectonic plates
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();

// Created base maps and overlays for control
let baseMaps = {
  "Satellite": satellite,
  "Street": streetmap,
  "Outdoor": outdoor
};

let overlays = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Added layer control to the map that will allow the user 
// to change which layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

// Made a request that retrieves the earthquake geoJSON data.
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(earthquakeUrl).then(function (data) {
  // Created a function that returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]), // Depth
      color: "#000000",
      radius: getRadius(feature.properties.mag), // Magnitude
      stroke: true,
      weight: 0.5
  };
  }

  // Created a function that determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    return depth > 90 ? "red" :
    depth > 70 ? "darkorange" :
    depth > 50 ? "gold" :
    depth > 30 ? "yellow" :
    depth > 10 ? "yellowgreen" :
                 "green";
  }

  // Created a function that determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude === 0 ? 1 : magnitude * 2.5;
  }

  // Added a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // Turned each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Created a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
        layer.bindPopup(
            `Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}`
        );
    }
  // Added the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquakes);

  earthquakes.addTo(map);
  // Created a legend control object.
  let legend = L.control({
    position: "bottomright"
  });

  // Added the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialized depth intervals and colors for the legend
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["green", "yellowgreen", "yellow", "gold", "darkorange", "red"];


    // Looped through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
          `<i style="background: ${colors[i]}; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i> ` +
          `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>`;
  }
    return div;
  };

  // Added the legend to the map.
  legend.addTo(map);
});

  // OPTIONAL: Step 2
  // Made a request to get our Tectonic Plate geoJSON data.
  let tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
  d3.json(tectonicUrl).then(function (plateData) {
  
    // Saved the geoJSON data, along with style information, to the tectonic_plates layer.
    L.geoJson(plateData, {
      style: {
          color: "orange",
          weight: 2
      }
  }).addTo(tectonicPlates);

  // Addedthe tectonic_plates layer to the map.

    tectonicPlates.addTo(map);
  });
