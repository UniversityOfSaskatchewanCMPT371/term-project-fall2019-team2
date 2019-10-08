import React, {Component} from 'react';
import {Bar} from 'react-chartjs-2';
import * as chartjs from 'react-chartjs-2';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-grid.css';
import CSVReader from "react-csv-reader";
import * as d3 from "d3";
import {Container} from "reactstrap";
import d3tip from "d3-tip";
import d3transition from "d3-transition";



function r50() {
    return Math.floor(Math.random() * 2);
}

//50/50 chance of returning 1 or -1
function pn() {
    return (r50() == 1 ? 1 : -1);
}

function randInts(n) {
    let rets = [];
    for (let i = 0; i < n; i++) {
        rets.push(Math.floor((Math.random() * 100)) * (Math.floor(Math.random() * 2) == 1 ? 1 : -1));
    }
    return rets;
}

function dynamicColors() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);

    return {
        'r': r,
        'g': g,
        'b': b
    };
    //return "rgb(" + r + "," + g + "," + b + "," + a + ")";
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


export class d3test extends Component {
    static displayName = d3test.name;

    constructor(props) {
        super(props);
        this.state = {
            data: [12, 5, 6, 6, 9, 10],
            width: 1000,
            height: 1000,
            id: "d3test"
        };

        this.csvParse = this.csvParse.bind(this);
        this.d3csv = this.d3csv.bind(this);
    }

    componentDidMount() {
        //this.drawChart();
    }

    drawChart() {
        let t0 = performance.now();
        //const data = [12, 5, 6, 6, 9, 10];
        const data = this.state.points;

        let max = data.reduce(function(a, b) {
            return Math.max(a, b);
        });

        let heightScale = this.state.height / max;
        let width = Math.floor(this.state.width / data.length);

        const svg = d3.select("#svgtarget")
            .append("svg")
            .attr("width", this.state.width)
            .attr("height", this.state.height);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => width * i)
            .attr("y", (d, i) => this.state.height - (d * heightScale))
            .attr("width", width)
            .attr("height", (d, i) => d * heightScale)
            .attr("fill", "green");

        let t1 = performance.now();
        console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
    }

    drawBars()
    {
        let barWidth = 40;
        let csvData = this.state.csvData.slice(4500);
        let data = csvData.slice(0, 100);
        console.log(data);
        let margin = {top: 40, right: 20, bottom: 100, left: 40},
            width = 960 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        let x = d3.scaleBand()
            .domain(csvData.slice(0, 2000).map(function(d) { return d.Date; }))
            .rangeRound([0, csvData.slice(0, 2000).length * barWidth]);

        let y = d3.scaleLinear()
            .domain([d3.min(csvData, (d) => {return d.Temp;}),
                    d3.max(csvData, (d) => {return d.Temp;})])
            .range([height, 0]);

        let xAxis = d3.axisBottom(x);
        let yAxis = d3.axisLeft(y);

        let tip = d3tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Date:</strong> <span style='color:red'>" + d.Date + "</span>" +
                    "<br /><strong>Temp:</strong> <span style='color:red'>" + d.Temp + "</span>";
            });

        let svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(tip);

        //x.domain(data.map(function(d) { return Date.parse(d.Date); }));

        let clip = svg
            .append('defs')
            .append('clipPath')
            .attr('id', 'barsBox')
            .append('rect')
            .attr('width', width)
            .attr('height', height + margin.top + margin.bottom)
            .attr('x', 0)
            .attr('y', 0);

        //Create layers in order so that the bars will disapear under the axis
        let barsLayer = svg.append('g')
            .attr("clip-path", "url(#barsBox)")
            .append('g')
            .attr('id', 'barsLayer');

        let axisLayer = svg.append('g')
            .attr('id', 'axisLayer');

        axisLayer.append("g")
            .style('color', 'red')
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style('color', 'red')
            .text("Temp");

        //console.log(y(0));

        //Create bars
        let plot = barsLayer.append("g")
            .attr('class', 'plot')
            .attr("id", "bars");

        let bars = plot.selectAll(".bar")
            .data(data);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            //.attr("x", (d, i) => x(parseFloat(d.Period)))
            .attr("x", (d, i) => barWidth * i)
            .attr("width", barWidth)
            //.attr("width", x.bandwidth())
            .attr("y", d => y(d.Temp))
            .attr("height", d => (height - y(d.Temp)))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        bars.exit().remove();

        barsLayer.append("g")
            .attr('id', 'xaxis')
            .style('color', 'red')
            .attr("class", "x axis")
            //.attr('y', height)
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)");

        let barsX = 0;
        let inc = 1000;
        let dataIdx = 0;

        setInterval(function(){
            d3.selectAll('.bar').filter(function(d,i)  {
                let x = parseInt(d3.select(this).attr('x'));
                let result = ((x + barWidth + barsX) < 0);
                if(result) {
                    dataIdx++;
                }
                return result;
            }).remove();

            data = csvData.slice(dataIdx, 100 + dataIdx);

            plot.selectAll(".bar")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                //.attr("x", (d, i) => x(parseFloat(d.Period)))
                .attr("x", (d, i) => barWidth * (i + dataIdx))
                .attr("width", barWidth)
                //.attr("width", x.bandwidth())
                .attr("y", d => y(d.Temp))
                .attr("height", d => (height - y(d.Temp)))
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            console.log(dataIdx);

            // x = d3.scaleBand()
            //     .domain(data.map(function(d) { return d.Date; }))
            //     .rangeRound([0, data.length * barWidth]);
            //
            // xAxis = d3.axisBottom(x);
            //
            // d3.select('xaxis')
            //     .call(xAxis);
            //
            // barsLayer.append("g")
            //     .style('color', 'red')
            //     .attr("class", "x axis")
            //     //.attr('y', height)
            //     .attr("transform", "translate(0," + height + ")")
            //     .call(xAxis)
            //     .selectAll("text")
            //     .style("text-anchor", "end")
            //     .attr("dx", "-.8em")
            //     .attr("dy", ".15em")
            //     .attr("transform", "rotate(-90)");
        }, 1000)

        setInterval(function () {
            barsX -= inc;
            d3.select("#barsLayer")
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("transform", (d) => {
                    return `translate(${barsX},0)`
                })
        }, 1000);


    }

    render() {
        return (
            <div>
                <Container>
                    <div className="row">
                        <div className="col-12">
                            <CSVReader
                                cssClass="react-csv-input"
                                label="Select CSV "
                                onFileLoaded={this.csvParse}
                            />
                        </div>
                        <div className="col-12">
                            <input type="file" onChange={this.d3csv} />
                        </div>
                    </div>
                </Container>

                <div id="svgtarget">
                </div>
            </div>
        );
    }

    async d3csv(event) {

        let csvfile = event.target.files[0];
        let fileReader = new FileReader();

        const handleFileRead = (e) => {
            let content = d3.csvParse(fileReader.result , function(d) {
                    return {
                        Date: d['Date/Time'],
                        Temp: ~~parseFloat(d['Temp (C)'])
                    }
                });

            // let content = d3.csvParse(fileReader.result, function(d) {
            //     return {
            //         Period: parseFloat(d.Period),
            //         Data_value: parseInt(d.Data_value)
            //     }
            // });

            // content = content.sort((a, b) => {
            //     return a.Period - b.Period;
            // });

            console.log(content);
            this.setState((state) => {return {csvData: content}});
            this.drawBars();
        };

        fileReader.onloadend = handleFileRead;
        fileReader.readAsText(csvfile);
    }

    async csvParse(csv) {
        let ps = [];
        let ls = [];

        csv = csv.sort(function(a, b) {
            return a[1] - b[1];
        });

        console.log(csv);

        let len = csv.length;

        let i = 1;
        let n = 1;
        //let inc = 1000;
        let inc = Math.ceil(len / this.state.width);
        let temp = 0.0;

        for (i = 1; i < len; ) {
            let lsavg = 0;
            let psavg = 0;

            for(n = i; n < (i+inc) && n < len; n++)
            {
                //console.log(csv[n][1]);
                temp = parseFloat(csv[n][1]);
                lsavg += Number.isNaN(temp) ? 0.0 : temp;

                //console.log("lsavg: " + lsavg);
                if(Number.isNaN(lsavg))
                {
                    console.log("lsavg NaN at index: " + n);
                    break;
                }

                temp = parseInt(csv[n][2]);
                psavg += Number.isNaN(temp) ? 0.0 : temp;

                //console.log("psavg: " + psavg);
                if(Number.isNaN(psavg))
                {
                    console.log("psavg NaN at index: " + n);
                    break;
                }
            }
            if(Number.isNaN(lsavg))
            {
                break;
            }
            if(Number.isNaN(psavg))
            {
                break;
            }
            ls.push(lsavg / (n - i));
            ps.push(psavg / (n - i));

            i += inc;
        }
        console.log(ps);
        console.log(ls);

        this.setState({
            csvData: csv,
            points: ps,
            labels: ls
        });

        this.drawChart();
    }
}
