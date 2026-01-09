import { useState, useEffect , useRef} from "react";
import { useLocation } from 'react-router-dom';
import Dashboard from "./Dashboard";
import Links from "./Links";
import Analytics from "./Analytics";
import trimlyLogo from '../images/trimly.png'
// import settings from '../images/settings.png'
import settings_grey from '../images/settings_grey.png'
import dashboard from '../images/dashboard.png'
import dashboard_grey from "../images/dashboard_grey.png";
import linksIcon from '../images/links.png'
import linksIcon_grey from '../images/links_grey.png'
import analytics_grey from '../images/analytics_grey.png'
import analytics from '../images/analytics.png'
import plus from '../images/plus.png'
import close from '../images/close.png'
import style from './DashboardLander.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSun, faCloudSun, faCloudMoon, faMoon } from '@fortawesome/free-solid-svg-icons';
import {createLink} from '../FetchMaker';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ;

const DashboardLander = () => {
  const [remarkInputText, setRemarkInputText] = useState('');
  const formRef = useRef(null); 
  const [activeComponent, setActiveComponent] = useState("links"); 
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState('');
  const [iconColor, setIconColor] = useState('#f5cf0f');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const location = useLocation();
  const username = location.state?.username || 'Guest';
  const shortUsername = username.slice(0, 2).toUpperCase();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expiration, setExpiration] = useState(false);


  // ================================ fetch links===========================================
  const [links, setLinks] = useState([]);

  const fetchLinks = async () => {
    const res = await fetch(`${BACKEND_URL}links/all-links`, {
      credentials: 'include'
    });
    const data = await res.json();
    setLinks(data);
     localStorage.setItem('links', JSON.stringify(data));
  };

  const filteredLinks = links.filter(link =>link.remark.toLowerCase().includes(remarkInputText.toLowerCase()));

  // ================================ =======================================

  useEffect(() => {
    const currentHour = new Date().getHours();

    const day= new Date().toLocaleDateString('en-IN', { weekday: 'short'}); 
    const month = new Date().toLocaleDateString('en-IN', { month: 'short'});
    const year = new Date().toLocaleDateString('en-IN', { year: '2-digit'});
    
    if (currentHour < 12) {
      setGreeting('Good Morning');
      setGreetingIcon(faSun);
      setIconColor('#f5cf0f'); 
    } else if (currentHour < 17) {
      setGreeting('Good Afternoon');
      setGreetingIcon(faCloudSun);
      setIconColor('#f4a236'); 
      
    } else if (currentHour < 21) {
      setGreeting('Good Evening');
      setGreetingIcon(faCloudMoon);
      setIconColor('#ff8c00'); 
    } else {
      setGreeting('Good Night');
      setGreetingIcon(faMoon);
      setIconColor('#4a5c9f'); 
    }
    setDay(day);
    setMonth(month);
    setYear(year);
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem('links');
    if (cached) setLinks(JSON.parse(cached)) ;
    else fetchLinks();
  }, []);


  const handleCreateNewLink = () => {
    setIsModalOpen(true); 
  };
  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
  };
  const handleClear = () => {
    setFormData({ destinationUrl: "", remarks: "", expiration: "" });
  };

  const [formData, setFormData] = useState({
    destinationUrl: "",
    remarks: "",
    expiration: "",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateLink = async (e) => {
    e.preventDefault();
    
    const linkData = {
      ...formData,
      expiration: expiration ? formData.expiration : null, // Set expiration only if toggler is on
    };
    console.log("Link Submitted:", linkData);

    // 🔍 1. Check if shortUrl already exists
    // const checkRes = await fetch(`http://localhost:3000/links/check?shortUrl=${linkData.destinationUrl}`);
    // const checkData = await checkRes.json();
    
    // if (checkData.exists) {
    //   alert("This short link already exists. Please try again.");
    //   return; // ⛔ stop creation
    // }

    // ✅ 2. If NO duplicate, create the link
    try{
      const response = await createLink(linkData);
      const data = await response.json();
      console.log("link created data", data);
      
      if (response.status === 200) {
        console.log(data);
        console.log('link created succcessfully');
        await fetchLinks();   // 🔥 refresh links
        handleClear();
        handleCloseModal();
      }                                       
      else if (response.status === 400) {
        alert(data.msg);
        console.log(data);
      }                                     
      else {
        alert('Error adding data!');
        console.error(data);
      }
    }
    catch (error) {
      console.error('Network Error:', error);
      console.log('Network error. Please check your connection and try again.');
    }
  };

 const handleLogout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}user/logout`, {
        method: 'POST',
        credentials: 'include',
      });   
      if (response.ok) {
        window.location.href = '/'; // Redirect to home page
      } else {
        console.error('Logout failed\n', "response status:", response.status);
      }   
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };


// ==================================================================================================================================
  return (
    <div className={style.container}>
          <div className={style.leftpanel}>
              {/* <img src={cuvette_logo} alt="cuvette_logo" className={style.cuvetteLogo}/> */}
              <img src={trimlyLogo} alt="trimly_logo" className={style.trimly_Logo}/>

              {/* Navigation Buttons */}
                <p 
                  onClick={() => setActiveComponent("dashboard")}
                  className={style.toggleBtns}
                  style={{ backgroundColor: activeComponent === "dashboard" ? "#F3F7FD" : "white",
                           color: activeComponent === "dashboard" ? '#1B48DA' : 'black'
                   }}
                  >
                    <img 
                        src={activeComponent === "dashboard" ? dashboard : dashboard_grey} 
                        style={{marginLeft: '17px', height: '20px' 
                        }}/>
                     Dashboard
                </p>

                <p 
                  onClick={() => setActiveComponent("links")}
                  className={style.toggleBtns}
                  style={{ backgroundColor: activeComponent === "links" ? "#F3F7FD" : "white", 
                      color: activeComponent === "links" ? '#1B48DA' : 'black'
                   }}>
                      <img 
                        src={activeComponent === "links" ? linksIcon : linksIcon_grey} 
                        style={{marginLeft: '17px', height: '20px'}}/>
                       Links
                </p>

                <p 
                  onClick={() => setActiveComponent("analytics")} 
                  className={style.toggleBtns}
                  style={{ backgroundColor: activeComponent === "analytics" ? "#F3F7FD" : "white",
                      color: activeComponent === "analytics" ? '#1B48DA' : 'black'
                   }}>
                    <img 
                      src={activeComponent === "analytics" ? analytics : analytics_grey} 
                     style={{marginLeft: '17px', height: '20px'}}/> 
                    Analytics
                </p>

              <p className={style.settings}>
                <img src={settings_grey} alt="settings" style={{marginLeft: '17px', height: '20px'}}/>
                Settings
              </p>
          </div>
         
          {/* Render the selected component */}
          <div className={style.rightpanel}>

          <div className={style.navbar}>

            <div className={style.greeting}>
              <p style={{color: '#181820', fontSize: '1.1rem', fontWeight: '600'}}> 
                <FontAwesomeIcon icon={greetingIcon} style={{color: iconColor}} /> {greeting}, {username}
              </p>
              <p style={{color: '#878BA9', fontSize: '0.8rem', marginLeft: '20px'}}>{day}, {month} {year}</p>
            </div>

            <div className={style.rightSection}>
            <button onClick={handleCreateNewLink}><img src={plus} /> Create new</button>
            <input type="text" placeholder="Search by remarks" className={style.inputwithicon} value={remarkInputText} onChange={(e) => setRemarkInputText(e.target.value)}/>
            <p className={style.userName} onClick={handleLogout}>{shortUsername}</p>
            <div className={style.logoutDiv}>Logout</div>
            
            </div>
         </div>

            {activeComponent === "dashboard" && <Dashboard />}

            {/* {activeComponent === "links" && <Links />} */}
            {activeComponent === "links" && ( <Links links={filteredLinks} refreshLinks={fetchLinks} />)}

            {/* {activeComponent === "analytics" && <Analytics />} */}
            {activeComponent === "analytics" && ( <Analytics links={links} />)}
          </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div className={style.backdrop}></div> {/* Dimming effect */}
          <div className={style.modalContent}>
            <p className={style.mHeading}>New Link</p>
            <img onClick={handleCloseModal} src={close} className={style.closeimg}/>
            <form  ref={formRef} onSubmit={handleCreateLink} className={style.form}>

              <label htmlFor="destinationUrl" >Destination Url <span style={{color: 'red'}}>*</span></label>
              <input 
              type="url" 
              name="destinationUrl" 
              placeholder="https://web.whatsapp.com/"
              value={formData.destinationUrl}
              onChange={handleChange}
              />

              <label htmlFor="remarks">Remarks<span style={{color: 'red'}}>*</span></label>
              <textarea 
              name="remarks"
              rows={5} 
              placeholder="Add remarks"
              value={formData.remarks}
              onChange={handleChange}
          />

              <div className={style.expirationBox}>
                <label htmlFor="expiration">Link Expiration </label>

                <div className={style.toggler}>   
                    <button 
                    type="button" 
                    className={style.switchStyle} 
                    style={{backgroundColor: expiration? '#3b82f6' : '#e5e7eb'}} 
                    onClick={() => setExpiration(!expiration)} 
                     >
               <div className={style.circleStyle} style={{ left: expiration ? '31px' : '5px'}} />
               </button>
          </div>

              </div>
              
              <input 
              type="datetime-local" 
              name="expiration" 
              value={formData.expiration}
              onChange={handleChange}
              disabled={!expiration} 
              />
            </form>

            <div className={style.bottom}>
              <button className={style.clearBtn} onClick={handleClear}>Clear</button>
              <button className={style.createBtn} onClick={() => formRef.current.requestSubmit()}>Create New</button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default DashboardLander;
