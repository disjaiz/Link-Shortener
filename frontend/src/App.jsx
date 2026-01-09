import './App.css'
import {createBrowserRouter,RouterProvider,} from "react-router-dom";
import Login from './components/Login';
import DashboardLander from './components/DashboardLander';
import Links from './components/Links';
import Analytics from './components/Analytics';
import Dashboard from './components/DashboardLander';


function App() {
  const routerdata = createBrowserRouter([
    {
    path: "/",
    element: <Login />,
    },
    {
      path: "/dashboardlander",
      element: <DashboardLander />,
    },
    {
      path: "/dashboardlander/links",
      element: <Links />,
    },
    {
      path: "/dashboardlander/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/dashboardlander/analytics",
      element: <Analytics />,
    },
])

  return (
    <>
    <RouterProvider router={routerdata} />
    </>
  )
}

export default App

