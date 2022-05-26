import { Scatterplot } from "./components/Scatterplot.js";
import { ScatterplotMatrix } from "./components/ScatterplotMatrix.js";
import { Item, Database } from "./components/Database.js";
import { Histogram } from "./components/Histogram.js";
import * as ui from "./components/ui.js";

let database;
let focusedDatabase;
let spmDatabase;
let scatterplotMatrix;
let histogram;
let selectedLoc = "Map";
let width = document.getElementById("main-navbar").clientWidth;
let params = {
  csvUrl: "/vis_data.csv",
  spm: {
    xyVars: ["js_len", "url_len", "js_obf_len"],
    qVars: ["q_js_len", "q_url_len", "q_js_obf_len"],
    qNum: 50,
    zVars: ["https", "label", "who_is"],
  },
  hist: {
    xVars: [
      "tld",
      "geo_loc",
      "https",
      "label",
      "q_url_len",
      "q_js_obf_len",
      "q_js_len",
    ],
  },
  geo: {
    xVars: ["tld", "geo_loc", "https", "label"],
  },
};

database = new Database();
focusedDatabase = database;
spmDatabase = database;
scatterplotMatrix = new ScatterplotMatrix(params.spm.qVars, "tld");
scatterplotMatrix.onSelection = onSelection;
scatterplotMatrix.onNoSelection = onNoSelection;
histogram = new Histogram(width);

function geoMap() {
  let projection = d3.geoEquirectangular().scale(200);
  let geoGenerator = d3.geoPath().projection(projection);
  let geoJson;
  d3.json("/geo.json").then((json) => {
    geoJson = json;
    projection = d3.geoEquirectangular().scale(200);
    geoGenerator = d3.geoPath().projection(projection);
    update(geoJson);
  });

  function update(xVar = params.geo.xVars[0], yVar = "count") {
    let u = d3.select(".geo-map").selectAll("path").data(geoJson.features);
    let db = focusedDatabase.select(["geo_loc", xVar]).countReduce(yVar);
    let geo_dict = database;
    console.log(db);
    let xScale = d3
      .scaleOrdinal()
      .domain(db.select(["count"]).data)
      .range(d3.schemeBlues);
    let yScale = d3.scaleLinear().range(d3.schemeAccent);

    let path = u
      // .enter()
      .join("path")
      .attr("d", geoGenerator)
      .attr("stroke", "black")
      .each(function (d) {
        let geo_loc = d.properties.name;
        let g = d3.select(this);

        g.attr("fill", "white");

        g.on("mouseover", () => {
          d3.select("#map-title").text(geo_loc);
          g.attr("fill", "lightgray");
        });
        g.on("mouseleave", () => {
          d3.select("#map-title").text(selectedLoc);
          if (g.classed("path-selected")) {
            return;
          }
          g.attr("fill", "white");
        });
        g.on("click", () => {
          path.each(function () {
            d3.select(this)
              .attr("fill", "white")
              .classed("path-selected", false);
          });
          g.classed("path-selected", true);
          g.attr("fill", "lightgray");
          selectedLoc = geo_loc;
          focusedDatabase = database.filter((v) => v.geo_loc == selectedLoc);
          updateHistogram();
        });
      });
  }
  return { update };
}

appendScatterPlotMatrix();
appendHistogram();

joinInputs();
database.loadCsv(params.csvUrl, () => {
  quantizeDatabase(database);
  initComponents();
});

function quantizeDatabase(db) {
  params.spm.xyVars.map((q) => {
    db.quantize(q, params.spm.qNum);
  });
}

function initComponents() {
  updatePlot(params.spm.zVars[0]);
  updateHistogram(params.hist.xVars[0]);
  geoMap();
}

function onNoSelection(plot) {
  focusedDatabase = database;
  focusedDatabase = focusedDatabase.filter((v) => v.geo_loc == selectedLoc);
  updateHistogram();
}
function onSelection(plot) {
  focusedDatabase = database.filter((d) => plot.isBrushed(d));
  updateHistogram();
}

function appendScatterPlotMatrix() {
  d3.select("div.row.spm-view").node().appendChild(scatterplotMatrix.getNode());
}
function appendHistogram() {
  d3.select(".hist-view").node().appendChild(histogram.getNode());
}
function updatePlot(zVar = scatterplotMatrix.zVar) {
  scatterplotMatrix.update(
    spmDatabase.select([...params.spm.qVars, zVar]).reduce(),
    zVar
  );
}
function updateHistogram(xVar = histogram.xVar) {
  histogram.update(
    focusedDatabase.select([xVar]).countReduce("cnt").sort("cnt").slice(0, 20),
    // focusedDatabase.select([xVar]).countReduce("cnt"),
    xVar,
    "cnt"
  );
}

function joinInputs() {
  ui.radioRow(
    d3.select("div.row.hist-view"),
    "labelRow",
    params.hist.xVars,
    (item) => {
      histogram.xVar = item;
      updateHistogram(item);
    }
  );
  ui.radioRow(
    d3.select("div.row.spm-input"),
    "categoryRow",
    params.spm.zVars,
    (item) => {
      updatePlot(item);
    }
  ).classed("container-fluid", true);
  ui.radioRow(
    d3.select("div.row.spm-focus"),
    "tool",
    ["focus", "reset"],
    (item) => {
      if (item == "focus") {
        spmDatabase = focusedDatabase;
      } else {
        spmDatabase = database;
      }
      updatePlot();
    }
  ).classed("container-fluid", true);
}
