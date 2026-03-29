import { useState, useContext} from 'react'
import style from './Settings.module.css'
import { deleteAccount, updateAccount } from '../FetchMaker';
import UserContext  from './UserContext.js';

function Settings() {
    const { setUser } = useContext(UserContext);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        mobilenum: '',
      });

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        console.log(formData)

        const res = await updateAccount(formData);
        const data = await res.json();
        if(res.status === 200){
            setUser(data.user.name);
            console.log(data.user);
        }   
        else if(res.status === 404){
            console.log(data.msg);
        }
        else {
            console.log(data.msg);
        }
    }   

    const handleDeleteAccount = async (e) => {
        e.preventDefault(); 

        const res = await deleteAccount(formData);
        const data = await res.json();

        if(res.status === 200){
            console.log(data.msg);
        }   
        else if(res.status === 404){
            console.log(data.msg);
        }
        else {
            console.log(data.msg);
        }

        console.log(data);
    }

    return (
      <div className={style.container}>
          <form className={style.settingsForm}>
             <div>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder='Name'  value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})   }/>
             </div>

             <div>
                <label htmlFor="email">Email id</label>
                <input type="email" id="email" placeholder='Email'  value={formData.email}
                    onChange={(e)=> setFormData({...formData, email : e.target.value})}/>
             </div>

            <div style={{marginBottom: "60px"}}>
                <label htmlFor="mobile">Mobile No.</label>
                <input type="number" id="mobile" placeholder='Mobile Number' value={formData.mobilenum}
                    onChange={(e) => setFormData({...formData, mobilenum: e.target.value})}/>
            </div>

              <button style={{backgroundColor: "#1B48DA"}} onClick={handleSaveChanges}>Save Changes</button><br />
              <button style={{backgroundColor: "#EB0D0D"}}  onClick={handleDeleteAccount}>Delete Account</button>
          </form>
      </div>
    )
}

export default Settings