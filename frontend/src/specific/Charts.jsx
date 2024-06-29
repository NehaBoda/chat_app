import React from 'react'
import {Line, Doughnut, Chart} from 'react-chartjs-2'
import {Chart as ChartJS,
     CategoryScale,
     Tooltip,
      Legend,
      Filler,
      LineElement,
      PointElement,
      ArcElement,
      LinearScale,
      plugins, 
    } from 'chart.js'
import { orange, orangeLight, purple, purpleLight } from '../constants/Color';
import { getLast7Days } from '../lib/Features';


ChartJS.register(
    CategoryScale,
    Tooltip,
     Legend,
     Filler,
     LineElement,
     PointElement,
     ArcElement,
     PointElement,
     LinearScale
  
);

const labels=getLast7Days();

const lineChartOptions={
    responsive:true,
    plugins:{
        legend:{
           display:false,
        },
        title:{
            display:false,
           
        },
    },
   scales:{
    x:{
        grid:{
         display:false,
        }
     },
    y:{
        beginAtZero:true,
       grid:{
        display:false,
       }
    },
   }
};

const LineChart = ({value=[]}) => {
    const data={
        labels,
    datasets:[
        {
        data:value,
        label:"Revenue",
        fill:true,
        backgroundColor:purpleLight,
        borderColor:purple,
    },
   ]
    };
  return (
    <Line data={data} options={lineChartOptions}/>
  )
};


const doughnutChartOptions={
    responsive:true,
    plugins:{
        legend:{
           display:false,
        }
    }, 
    cutout:120,  
};
const DoughnutChart= ({value=[],labels=[]}) => {
    const data={
        labels,
    datasets:[
        {
        data:value,
        fill:true,
        backgroundColor:[purpleLight,orangeLight],
        borderColor:[purple,orange],
        hoverBackgroundColor:[purple,orange],
        offset:40,
    },
   ]
    };
    return (
      <Doughnut 
      style={{zIndex:10}}
      data={data} 
      options={doughnutChartOptions}/>
    )
  };

export  {LineChart, DoughnutChart}