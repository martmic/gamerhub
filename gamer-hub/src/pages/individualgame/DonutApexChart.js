import React from 'react';
import ReactApexChart from 'react-apexcharts';

class DonutApexChart extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
      
        series: [44, 55, 41, 17, 15],
        options: {
          chart: {
            type: 'donut',
          },
          labels: ['Pass', 'Wait For Sale', 'Reasonable', 'Great Deal', 'Worth Every'],
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        },
      
      
      };
    }

  

    render() {
      return (
        

  <div id="chart">
<ReactApexChart options={this.state.options} series={this.state.series} type="donut" />
</div>


      );
    }
  }

  export default DonutApexChart;
