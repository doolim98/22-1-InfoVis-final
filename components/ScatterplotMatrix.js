import { Scatterplot } from "./Scatterplot.js";

export class ScatterplotMatrix {
  zVar;
  getNode() {
    return this.container.node();
  }
  constructor(xyVars, zVar) {
    let container = d3.create("div").attr("class", "plot-matrix");
    let spm = this;
    this.zVar = zVar;
    this.xyVars = xyVars;

    let cellData = xyVars.map(function (yVar, y_pos) {
      return xyVars.map(function (xVar, x_pos) {
        let plot = new Scatterplot();
        plot.svg.on("mousedown", () => {
          spm.onPlotClick(plot);
        });
        Object.assign(plot.margin, {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        });
        Object.assign(plot.disabled, {
          drawXAxis: true,
          drawYAxis: true,
          drawLegend: true,
        });
        if (y_pos == 0) {
          plot.margin.top = 10;
          if (x_pos == 0) {
            plot.disabled.drawLegend = false;
          }
        }
        if (x_pos == 0) {
          plot.disabled.drawYAxis = false;
          plot.margin.left = 30;
        }
        if (y_pos == xyVars.length - 1) {
          plot.disabled.drawXAxis = false;
          plot.margin.bottom = 30;
        }
        return {
          xVar: xVar,
          yVar: yVar,
          plot: plot,
        };
      });
    });
    this.cellData = cellData;
    this.container = container;
  }

  update(database, zVar = this.zVar) {
    let container = this.container;
    let cellData = this.cellData;
    this.zVar = zVar;
    this.cells = container
      .selectAll("div .row")
      .data(cellData)
      .join((enter) => enter.append("div").classed("row", true))
      .selectAll(".plot-matrix-cell")
      .data((d) => d)
      .join("div")
      .classed("col plot-matrix-cell", true)
      .each(function (d) {
        this.appendChild(d.plot.svg.node());
      });

    this.cells.each(function (d) {
      let margin = d.plot.margin;
      d.plot.width = this.clientWidth - margin.left - margin.right;
      d.plot.height = this.clientHeight - margin.top - margin.bottom;
      d.plot.update(database, d.xVar, d.yVar, zVar);
    });
  }

  onPlotClick(plot) {
    this.cells.each((d) => {
      if (d.plot != plot) {
        d.plot.clearBrush();
        d.plot.container.selectAll(".plot-border").attr("stroke-width", 1);
      } else {
        d.plot.container.selectAll(".plot-border").attr("stroke-width", 5);
        d.plot.on("onEnd", (event) => {
          if (event.selection) {
            return this.onSelection(d.plot);
          }
        });
      }
    });
  }
}
