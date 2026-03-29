/* eslint-disable react/prop-types */
import style from './Dashboard.module.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList
} from "recharts";

function Dashboard({ links }) {
    const safeLinks = Array.isArray(links) ? links : [];

    const deviceData = Object.entries(
      safeLinks
        .flatMap(link => Array.isArray(link.analytics) ? link.analytics : [])
        .reduce((acc, item) => {
          const device = item.device || "unknown";
          acc[device] = (acc[device] || 0) + 1;
          return acc;
        }, {})
    ).map(([device, clicks]) => ({
      name: device,
      clicks
    }));

    const dateData = Object.entries(
    safeLinks
      .flatMap(link => Array.isArray(link.analytics) ? link.analytics : [])
      .reduce((acc, item) => {
        const date = item.timestamp
          ? new Date(item.timestamp).toLocaleDateString()
          : "unknown";

        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {})
  ).map(([date, clicks]) => ({
    name: date,
    clicks
  }));

  dateData.sort((a, b) => new Date(a.name) - new Date(b.name));

  return (
    <div className={style.container}>
      <p id={style.clicksCount}>
        Total Clicks :{" "}
        <span style={{ color: "blue" }}>
          {(Array.isArray(links) ? links : []).reduce(
            (total, link) => total + (link.clicks || 0),
            0
          )}
        </span>
      </p>
      
      <div className={style.barChartContainer} >

        <div className={style.barDiv}>
          <p className={style.barHeading}>Date-wise Clicks</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart
                  data={dateData}
                  layout="vertical"
                  margin={{ top: 10, right: 60, left: 20, bottom: 10 }}
                >
                
                  <XAxis type="number" hide domain={[0, "dataMax + 2"]} />
                
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
              
                  <Tooltip />
                
                  <Bar dataKey="clicks" fill="#82ca9d">
                    <LabelList dataKey="clicks" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
        
        </div>

        <div className={style.barDiv}>
          <p className={style.barHeading}>Click Devices</p>
           <ResponsiveContainer width="100%" height={100} >
              <BarChart 
              data={deviceData} 
              layout="vertical"
               margin={{ top: 10, right: 60, left: 20, bottom: 10 }} >
              
                <XAxis type="number" hide />

                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar dataKey="clicks" fill="#8884d8">
                  <LabelList dataKey="clicks" position="right" />
                </Bar>

              </BarChart>
            </ResponsiveContainer>
        </div>

      </div>
    
    </div>
  )
}
export default Dashboard




  


