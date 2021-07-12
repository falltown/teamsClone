const form = document.querySelector("#login-form")
        form.addEventListener('submit',registeruser)

        async function registeruser(event) {
            event.preventDefault()
            const username = document.getElementById('username').value
            const password = document.getElementById('password').value


            document.getElementById('username').value="";
            document.getElementById('password').value="";

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
            
            if(result.status ==='ok')
            {
                // alert("token recieved")
                // console.log('got the token:',result.data)
                localStorage.setItem('token',result.data)
                localStorage.setItem('username',result.username)
                window.location.href = "/home"
                
            }
            else
            {
                alert(result.error)
            }
            

        }