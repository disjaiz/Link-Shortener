const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ;

//=============================== signup fetch ======================================
async function signup(formdata){

  try{
    const response = await fetch(`${BACKEND_URL}user/signup`, {
    method: "POST",
    headers: {
        'Content-Type': 'application/json', 
      },
    body: JSON.stringify(formdata),
    credentials: "include",
  });
  return response
}

  catch (err) {
    console.log('Signup error:', err);
    throw err; 
} 
}
export default signup;

//=============================== login fetch ======================================
async function login(formdata){
  
  try{
      const response = await fetch(`${BACKEND_URL}user/login`, {
      method: "POST",
      headers: {
          'Content-Type': 'application/json', 
        },
      body: JSON.stringify(formdata),
      credentials: "include",
  });
    return response
  }

  catch (err) {
      console.log('Login error:', err);
      throw err;  
    }
  }

export {login}

// ============================create new link fetch =================================
async function createLink(formdata){
  try{
    const response = await fetch(`${BACKEND_URL}links/create-link`, {
      method: 'POST',
      credentials: 'include', 
      headers: {  'Content-Type': 'application/json'},
      body: JSON.stringify(formdata),
      });
    return response
  }
  catch (err) {
    console.log('Login error:', err);
    throw err;  
  }
}
export {createLink}

// ============================delete a link fetch =================================
async function deleteLink(linkId){
  try{
    const response = await fetch(`${BACKEND_URL}links/${linkId}`, {
  method: 'DELETE',
  credentials: 'include',
  headers: {
      'Content-Type': 'application/json'
  }
});
return response
}
catch (err) {
  console.log('Login error:', err);
  throw err;  
}
}

export {deleteLink}
