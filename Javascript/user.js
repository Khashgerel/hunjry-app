const { response } = require("express")

document.addEventListener("DOMContentLoaded", () => {
    fetch('/json/user.json')
        .then(response => response.json())
        .then(data => {
            if(data && data.users){
                usersData = data.users;
            } else {
                console.error('Data format error: No "users" array in JSON');
            }
        })
})