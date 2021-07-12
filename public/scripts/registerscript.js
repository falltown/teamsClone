const form = document.querySelector("#reg-form")

//calling registeruser function on submission of registration form
form.addEventListener('submit',registeruser)

async function registeruser(event) {

    //preventing page from reloading
    event.preventDefault()

    //getting username and password from form
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    //resetting the values in the form
    document.getElementById('username').value="";
    document.getElementById('password').value="";

    //making a fetch request to registration API
    const result = await fetch('/api/register', {
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
        //generating alert in case of succcessful registration
        alert("Registration Successful")
    }
    else
    {
        //generating alert in case of error
        alert(result.error)
    }
    
    

}