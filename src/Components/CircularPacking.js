import * as React from 'react';
import { getCovidData } from '../Utils/CovidData';
import * as d3 from 'd3';
import {event as currentEvent} from 'd3';
import '../App.css';
import { useD3 } from '../Utils/UseD3';
import * as moment from 'moment';

const CircularPacking = () => {
  const ref = useD3(
    (svg) => {
      const height = 800;
      const width = 800;

      svg.attr('width', width)
         .attr('height', height);

      const csv_link = 'https://data.humdata.org/hxlproxy/api/data-preview.csv?url=https%3A%2F%2Fraw.githubusercontent.com%2FCSSEGISandData%2FCOVID-19%2Fmaster%2Fcsse_covid_19_data%2Fcsse_covid_19_time_series%2Ftime_series_covid19_confirmed_global.csv&filename=time_series_covid19_confirmed_global.csv';
      const example_link = 'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/11_SevCatOneNumNestedOneObsPerGroup.csv';
      let dataDate = new Date();
      dataDate.setDate(dataDate.getDate() - 1);
      dataDate = moment(dataDate).format('M/D/YY');
      // READING CSV /////////////////////////////////////////////////
      d3.csv(csv_link).then((data) => {
        let contries = data.map(d => d['Country/Region']); 
        let color = d3.scaleOrdinal()
                      .domain(contries)
                      .range(d3.schemeSet1);

        let size = d3.scaleLinear()
                     .domain([0, 30_000_000])
                     .range([2,100]);

        let Tooltip = d3.select('#box')
                        .append('div')
                        .style('opacity', 0)
                        .attr('class', 'tooltip')
                        .style('background-color', 'white')
                        .style('border', 'solid')
                        .style('border-width', '2px')
                        .style('border-radius', '5px')
                        .style('padding', '5px');
      
        let mouseover = (e, d) => {
          Tooltip.style('opacity', 1);
        }

        let mousemove = (m, d) => {
          Tooltip.html(`<u> ${d['Country/Region']} </u> <br> ${d[dataDate]} cases`)
                 .style('left', (m.pageX + 20) + 'px')
                 .style('top', m.pageY + 'px');
        }

        let mouseleave = (e, d) => {
          Tooltip.style('opacity', 0);
        }

        var node = svg.append('g')
                      .selectAll('circle')
                      .data(data)
                      .enter()
                      .append('circle')
                        .attr('class', 'node')
                        .attr('r', (d) => size(Number(d[dataDate])))
                        .attr('cx', width / 2)
                        .attr('cy', height / 2)
                        .style('fill', (d) => color(d['Country/Region']))
                        .style('fill-opacity', 0.8)
                        .attr('stroke', 'black')
                        .style('stroke-width', 1)
                        .on('mouseover', mouseover)
                        .on('mousemove', mousemove)
                        .on('mouseleave', mouseleave)
                        .call(d3.drag().on('start', dragstarted)
                                       .on('drag', dragged)
                                       .on('end', dragended));

        var simulation = d3.forceSimulation()
                           .force('center', d3.forceCenter().x(width / 2).y(height / 2))
                           .force('charge', d3.forceManyBody().strength(.1))
                           .force('collide', d3.forceCollide().strength(.2).radius((d) => size(d[dataDate])+3).iterations(1));
      
        simulation.nodes(data)
                  .on('tick', (d) => {
                    node.attr('cx', (d) => d.x)
                        .attr('cy', (d) => d.y);
                  });

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
    []
  );

  return (
    <div id='box'>
      <svg
        ref={ref}
      />
    </div>
  );
}

export default CircularPacking;