class ScatterPlotMatrix {
  constructor(svg, data, width = 250, height = 250) {
    this.svg = svg;
    this.data = data;
    this.width = width;
    this.height = height;

    this.handlers = {};
  }
  initialize() {
    this.svg = d3.select(this.svg);
  }
}
