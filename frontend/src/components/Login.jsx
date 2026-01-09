import { useState } from 'react';
import style from './Login.module.css'
import main_image from '../images/main.png'
import trimlyLogo from '../images/trimly.png'
import { useNavigate} from 'react-router-dom';
import openEye from '../images/openEye.png'
import closedEye from '../images/closeEye.png'
import signup, {login} from '../FetchMaker';

function Login() {
  const [isSignup, setIsSignup] = useState(true); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    mobilenum: '',
    password: '',
    confirmPassword: '',
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  };
 const handleLoginChange = (e) => {
      const { name, value } = e.target;
      setLoginData({ ...loginData, [name]: value });
    };

  //=========================================== handle signup=======================================
    const handleSignup = async (e) => {
      e.preventDefault();

      if (signupData.password !== signupData.confirmPassword) {
        console.log('Passwords do not match.');
        return;
      }
    
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(signupData.mobilenum)) {
        console.log('Mobile number must be exactly 10 digits.');
        return;
      }

      try {
        const response = await signup(signupData);
        if (response.ok) {
          // const data = await response.json();
          console.log('Signed up successfully!');

          navigate('/dashboardlander', { state: { username: signupData.username} });
        }
        else {
          const errorData = await response.json();
          console.error('Error:', errorData);
    
          if (response.status === 400) {
            console.log(`Error: ${errorData.msg || 'Invalid input data'}`);
          } else {
            console.log('An error occurred. Please try again later.');
          }
        }
      }
      catch (error) {
        console.error('Network Error:', error);
        console.log('Network error. Please check your connection and try again.');
      }
    };

  // ===========================================handle login==============================================================
    const handleLogin = async (e) => {
      e.preventDefault();
  
      try{
        const response = await login(loginData);
        const text = await response.text();
        console.log('raw response:', text);
        const data = text ? JSON.parse(text) : {};

        
        if (response.status === 200) {
          console.log('logged in successfully');
          navigate('/dashboardlander', { state: { username: data.existingUser.name} });
        }                                       
        else if (response.status === 400) {
          console.log(data.msg);
          console.log(data);
        }                                     
        else {
          console.log('Error adding data!');
          console.error(data);
        }
      }
      catch (error) {
        console.error('Network Error:', error);
        console.log('Network error. Please check your connection and try again.');
      }
    };

// ===========================================================================================================================================
  return (
    <div className={style.container}>
        <img src={trimlyLogo} alt="trimly_logo" className={style.trimly_logo} /> 

    
        <div className={style.right_side}>
            <img src={main_image} alt='main_image' className={style.main_image} /> 
        </div>

        <div className={style.left_side}>
            <button className={style.topRightBtns} style={{top: '1.5rem', right:'8rem'}} 
             onClick={() => setIsSignup(true)}>SignUp</button>

            <button className={style.topRightBtns} style={{top: '1.5rem', right:'2rem'}}  
            onClick={() => setIsSignup(false)}>Login</button>

{isSignup ? (
      <>
      {/* Signup Form */}
      <p className={style.heading}>Join us Today!</p>

      <form className={style.form_container} onSubmit={handleSignup}>        
            <input
              type="text"
              placeholder="Name"
              className={style.input}
              name="username"
              value={signupData.username}
              onChange={handleSignupChange}
            />
            <input
              type="email"
              placeholder="Email Id"
              className={style.input}
              name="email"
              value={signupData.email}
              onChange={handleSignupChange}
            />
            <input
              type="number"
              placeholder="Mobile no."
              className={style.input}
              name="mobilenum"
              value={signupData.mobilenum}
              onChange={handleSignupChange}
            />
            <div className={style.inputWrapper} style={{ marginBottom: "0.7rem" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={style.passwordInputContainer}
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
              />
              <img className={style.eyeIcon} onClick={() => setShowPassword(!showPassword)} src={showPassword ? closedEye : openEye }  />
            </div>
          
            <div className={style.inputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className={style.passwordInputContainer}
                name="confirmPassword"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
              /> 
              <img className={style.eyeIcon} onClick={() => setShowConfirmPassword(!showConfirmPassword)} src={showConfirmPassword ? closedEye : openEye }  />
            </div>
            
            <button className={style.registerBtn}>Register</button>
                
            <p style={{fontSize: '0.9rem', color: '#3B3C51', fontWeight: '600px'}}>
              Already have an account? &nbsp;
              <span style={{color: 'blue'}}  onClick={() => setIsSignup(false)}>Login</span>
            </p>
      </form>
      </>
      ) : (
           
      <>
      {/* Login Form */}
       <p className={style.heading} style={{marginBottom: '5rem'}}>Login</p>
       <form className={style.form_container} onSubmit={handleLogin}>
            
            <input
              type="email"
              placeholder="Email Id"
              className={style.input}
              name="email"
              value={loginData.email}
              onChange={handleLoginChange}
            />

            <div className={style.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={style.passwordInputContainer}
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
              />
              <img className={style.eyeIcon} onClick={() => setShowPassword(!showPassword)} src={showPassword ? closedEye : openEye }  />
            </div>

            <button className={style.registerBtn}>Register</button>

            <p style={{fontSize: '0.9rem', color: '#3B3C51', fontWeight: '600px'}}>
               Already have an account? &nbsp;
              <span style={{color: 'blue'}}  onClick={() => setIsSignup(true)}>Signup</span>
            </p>

            </form>
          </>
         )}

        </div>
    </div>
  )
}

export default Login

