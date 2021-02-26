import * as React from 'react';
import { getCovidData } from '../Utils/CovidData';
import * as d3 from 'd3';
import {event as currentEvent} from 'd3';
import '../App.css';
import { useD3 } from '../Utils/UseD3';

const CircularPacking = ({ data }) => {
  const ref = useD3(
    (svg) => {
      const height = 800;
      const width = 800;

      svg.attr("width", width)
         .attr("height", height)

      d3.csv('https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/11_SevCatOneNumNestedOneObsPerGroup.csv').then((data) => {

        // Filter a bit the data -> more than 1 million inhabitants
        data = data.filter((d) => { return d.value>10000000 });

        let color = d3.scaleOrdinal()
                      .domain(["Asia", "Europe", "Africa", "Oceania", "Americas"])
                      .range(d3.schemeSet1);

        let size = d3.scaleLinear()
                     .domain([0, 1400000000])
                     .range([7,55])  // circle will be between 7 and 55 px wide

        // create a tooltip
        let Tooltip = svg.append("div")
                         .style("opacity", 0)
                         .attr("class", "tooltip")
                         .style("background-color", "white")
                         .style("border", "solid")
                         .style("border-width", "2px")
                         .style("border-radius", "5px")
                         .style("padding", "5px")
      
        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(e, d) {
          Tooltip.style("opacity", 1)
        }
        var mousemove = function(m, d) {
          Tooltip
            .html('<u>' + d.key + '</u>' + "<br>" + d.value + " inhabitants")
            .style("left", (m.pageX + 20) + "px")
            .style("top", m.pageY + "px")
        }
        var mouseleave = function(e, d) {
          Tooltip
            .style("opacity", 0)
        }
    
        // Initialize the circle: all located at the center of the svg area
        var node = svg.append("g")
          .selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
            .attr("class", "node")
            .attr("r", function(d){ return size(d.value)})
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .style("fill", function(d){ return color(d.region)})
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", 1)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .call(d3.drag().on("start", dragstarted)
                           .on("drag", dragged)
                           .on("end", dragended));
      
        // Features of the forces applied to the nodes:
        var simulation = d3.forceSimulation()
                           .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
                           .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
                           .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.value)+3) }).iterations(1)) // Force that avoids circle overlapping
      
        simulation.nodes(data)
                  .on('tick', function(d) {
                    node.attr("cx", function(d){ return d.x; })
                        .attr("cy", function(d){ return d.y; })
                  });
      
        // What happens when a circle is dragged?
        function dragstarted(e, d) {
          if (!e.active)
            simulation.alphaTarget(.03).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(e, d) {
          d.fx = e.x;
          d.fy = e.y;
        }

        function dragended(e, d) {
          if (!e.active)
            simulation.alphaTarget(.03);
          d.fx = null;
          d.fy = null;
        }
      });
    },
    [data.length]
  );

  return (
    <div>
      <svg
        ref={ref}
      />
    </div>
  );
}

export default CircularPacking;