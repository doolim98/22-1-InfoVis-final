export class Scatterplot {
  margin = {
    top: 10,
    right: 40,
    bottom: 40,
    left: 40,
  };
  padding = 10;

  disabled = {
    drawXAxis: false,
    drawYAxis: false,
    drawLegend: false,
  };
  ticks = 50;

  constructor(width = 250, height = 250) {
    let svg = d3.create("svg");
    let margin = this.margin;
    this.svg = svg;
    this.width = width;
    this.height = height;

    this.handlers = {};
    this.container = this.svg.append("g");
    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");
    this.xGrid = this.svg.append("g").classed("plot-grid-line", true);
    this.yGrid = this.svg.append("g").classed("plot-grid-line", true);
    this.legend = this.svg.append("g");
    this.grids = this.svg.append("g");
    this.text = this.svg.append("g");

    this.xScale = d3.scaleLinear();
    this.yScale = d3.scaleLinear();
    this.zScale = d3.scaleOrdinal().range(d3.schemeSet1);

    this.svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    this.container.append("rect").attr("class", "plot-border");

    this.brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("start brush end", (event) => {
        this.brushCircles(event);
      });
  }

  update(database, xVar, yVar, zVar) {
    let width = this.width;
    let height = this.height;
    let margin = this.margin;
    let data = database.data;
    this.xVar = xVar;
    this.yVar = yVar;

    this.brush.extent([
      [0, 0],
      [width, height],
    ]);

    this.svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    this.container.attr(
      "transform",
      `translate(${margin.left}, ${margin.top})`
    );

    function extent(data, targetVar, scale = 1.1) {
      let e = d3.extent(data, (d) => d[targetVar]);
      let m = (e[1] + e[0]) / 2;
      let s = (e[1] - e[0]) * scale;
      return [m - s / 2, m + s / 2];
    }

    this.xScale.domain(extent(data, xVar)).range([0, width]);
    this.yScale.domain(extent(data, yVar)).range([height, 0]);
    this.zScale.domain(database.getDomain(zVar));

    let zMean = database.mean(zVar);

    let axisBottom = d3
      .axisBottom()
      .ticks(width / this.ticks)
      .scale(this.xScale);
    let axisLeft = d3
      .axisLeft()
      .ticks(height / this.ticks)
      .scale(this.yScale);

    this.circles = this.container.selectAll("circle").data(data).join("circle");

    this.circles
      .transition()
      .attr("cx", (d) => this.xScale(d[xVar]))
      .attr("cy", (d) => this.yScale(d[yVar]))
      .attr("fill", (d) => this.zScale(d[zVar]))
      .attr("opacity", 0.6)
      // .attr("onFocus", null)
      // .attr("onmouseover", () => {})
      .attr("data-x", (d) => d[xVar])
      .attr("data-y", (d) => d[yVar])
      .attr("r", 3);
    // Axis
    [this.xGrid, this.xAxis].map((v) => {
      v.attr("transform", `translate(${margin.left}, ${height + margin.top})`)
        .transition()
        .attr("onmouseover", () => {});
    });
    [this.yGrid, this.yAxis].map((v) => {
      v.attr("transform", `translate(${margin.left}, ${margin.top})`)
        .transition()
        .attr("onmouseover", () => {});
    });

    axisBottom(this.xAxis);
    axisLeft(this.yAxis);
    axisBottom.tickFormat("").tickSize(-height)(this.xGrid);
    axisLeft.tickFormat("").tickSize(-width)(this.yGrid);

    // Axis Visibility
    this.xAxis.attr(
      "visibility",
      this.disabled.drawXAxis ? "hidden" : "visible"
    );
    this.yAxis.attr(
      "visibility",
      this.disabled.drawYAxis ? "hidden" : "visible"
    );

    this.legend
      .style("display", "inline")
      .style("font-size", ".8em")
      .style("float", "left")
      .attr("transform", `translate(${margin.left * 2}, ${margin.top * 5})`)
      .call(d3.legendColor().scale(this.zScale));

    // Legend Visibility
    if (this.disabled.drawLegend) {
      this.legend.attr("visibility", "hidden");
    }

    this.container
      .selectAll(".plot-border")
      .attr("width", width)
      .attr("height", height);

    this.text
      .attr("transform", `translate(${margin.left * 2},${margin.top * 3})`)
      .selectAll("text")
      .data([`${xVar} / ${yVar}`])
      .join("text")
      .text((d) => d);
    this.brush(this.container);
  }

  isBrushed(d, selection = this.selection) {
    if (!selection) return false;
    let [[x0, y0], [x1, y1]] = selection; // destructuring assignment

    // DONE: return true if d's coordinate is inside the selection
    let x = this.xScale(d[this.xVar]);
    let y = this.yScale(d[this.yVar]);
    return x0 <= x && x <= x1 && y0 <= y && y <= y1;
  }

  // this method will be called each time the brush is updated.
  brushCircles(event) {
    let selection = event.selection;
    let circles = this.circles;
    this.selection = selection;

    circles.classed("brushed", (d) => this.isBrushed(d, selection));

    if (this.handlers.onBrush && event.type == "brush")
      this.handlers.onBrush(event);

    if (this.handlers.onStart && event.type == "start")
      this.handlers.onStart(event);

    if (this.handlers.onEnd && event.type == "end") this.handlers.onEnd(event);
  }

  getBrushed(database) {
    let selection = this.selection;
    return database.filter((d) => this.isBrushed(d, selection));
  }

  clearBrush() {
    this.brush.move(this.container, null);
  }

  on(eventType, handler) {
    this.handlers[eventType] = handler;
  }
}
