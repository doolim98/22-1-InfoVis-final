export class Histogram {
  margin = {
    top: 10,
    right: 10,
    bottom: 40,
    left: 40,
  };
  getNode() {
    return this.svg.node();
  }

  constructor(width = 250, height = 250) {
    this.svg = d3.create("svg").classed("histogram", true);
    this.root = this.svg;
    this.width = width;
    this.height = height;

    this.container = this.svg.append("g");
    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");
    this.legend = this.svg.append("g");

    this.xScale = d3.scaleBand();
    this.yScale = d3.scaleLinear();

    this.svg
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.container.attr(
      "transform",
      `translate(${this.margin.left}, ${this.margin.top})`
    );
  }

  update(database, xVar, yVar) {
    let data = database.data;
    let xDomain = database.getDomain(xVar);
    let yDomain = database.getDomain(yVar);

    this.xScale.domain(xDomain).range([0, this.width]).padding(0.3);
    this.yScale.domain([0, d3.max(yDomain)]).range([this.height, 0]);

    // DONE: draw a histogram
    this.container
      .selectAll("rect")
      .data(data)
      .join("rect")
      .transition()
      .attr("x", (d) => this.xScale(d[xVar]))
      .attr("y", (d) => this.yScale(d[yVar]))
      .attr("width", this.xScale.bandwidth())
      .attr("height", (d) => this.height - this.yScale(d[yVar]))
      // .attr("fill", "lightgray");
      .attr(
        "fill",
        d3.scaleOrdinal().range(d3.schemeCategory10).domain(xDomain)
      );

    this.xAxis
      .attr(
        "transform",
        `translate(${this.margin.left}, ${this.margin.top + this.height})`
      )
      .call(d3.axisBottom(this.xScale));

    this.yAxis
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .call(d3.axisLeft(this.yScale));
  }
}
