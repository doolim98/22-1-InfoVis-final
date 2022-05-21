import { Scatterplot } from "./components/scatterplot.js";

// load data

let data = new Array();
d3.csv("/vis_data.csv").then((csvData) => {
  csvData.push(data);
});

let a = new Scatterplot(1, 2);

let e = document.createElement("p");
e.textContent = "hello";
e.textContent += csv_data[0] + "<br>";
e.textContent += csv_data[1] + "<br>";
document.body.appendChild(e);
