export function radioRow(g, name, labels, onChange) {
  let row = inputRow(g, "radio", name, labels, () =>
    onChange(row.selectAll("input[type=radio]:checked").attr("value"))
  );
  return row;
}
export function checkboxRow(g, name, labels, onChange) {
  let row = inputRow(g, "checkbox", name, labels, () => {
    onChange(row.selectAll("input:checked").attr("value"));
  });
  return row;
}

export function inputRow(g, type, name, labels, onChange) {
  return g
    .selectAll(`div.${name}.input-group`)
    .data([name])
    .join("div")
    .classed(name, true)
    .classed("input-group mb-3", true)

    .call((g) => {
      g.selectAll(".input-group-text")
        .data([name])
        .join("span")
        .classed("input-group-text", true)
        .text(name);

      g.selectAll(".input-col")
        .data([name])
        .join("div")
        .classed("input-col", true)

        .selectAll(".btn-group")
        .data(labels)
        .join("div")
        .classed("btn-group", true)
        .attr("role", "group")
        .attr("aria-label", `"Basic ${type} toggle button group`)
        .call((g) => {
          g.selectAll("input")
            .data((d) => [d])
            .join("input")
            .classed("btn-check", true)
            .attr("type", type)
            .attr("name", name)
            .attr("value", (d) => d)
            .attr("autocomplete", "off")
            .attr("id", (d) => `${name}-${d}`)
            .on("change", onChange);
          g.selectAll("label")
            .data((d) => [d])
            .join("label")
            .classed("btn btn-outline-primary", true)
            .attr("for", (d) => `${name}-${d}`)
            .text((d) => d);
        });

      return g;
    });
}

export function radioGroup() {}
