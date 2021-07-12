const form = document.querySelector("#login-form")

//calling "loginuser" fuction on submmission of form
form.addEventListener('submit',loginuser)

async function loginuser(event) {

    //preventing page from reloading
    event.preventDefault()

    //getting username and password from form
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    //resetting the values in the form
    document.getElementById('username').value="";
    document.getElementById('password').value="";

    //making a fetch request to the login API
    const result = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    }).then((res)=>res.json())
    
    //checking result of login request
    if(result.status ==='ok')
    {
        //storing jwt token in local storage
        localStorage.setItem('token',result.data)

        //storing username in local storage
        localStorage.setItem('username',result.username)
        
        //redirecting to home page
        window.location.href = "/home"
        
    }
    else
    {
        //generating alert in case of unsuccessful login
        alert(result.error)
    }
}