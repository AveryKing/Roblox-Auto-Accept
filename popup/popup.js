import notAllowed from '../data.js';

const notAllowedList = document.querySelector('#notAllowedList');
notAllowed[notAllowed.length - 2] = 'and';
notAllowedList.innerText = `${notAllowed.join(', ')}`;

let pendingRequests = [];
let acceptableUsers = [];
let deniedUsers = [];
let status;

const checkPendingRequests = async () => {
    await fetch("https://groups.roblox.com/v1/groups/5074189/join-requests?cursor=&limit=100&sortOrder=Asc", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://www.roblox.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    })
        .then(res => {
            status = res.status;
            return res.json();
        })
        .then(data => {
            if (status === 429) {
                alert('Roblox server has temporarily limited you for sending too many requests. Please wait a couple minutes and try again.')
            } else if (data.data.length) {
                pendingRequests = data.data
            } else {
                pendingRequests = [];
            }
            ;
        });
}

const processUser = async (accepted, userId) => {
    let method = accepted ? "DELETE" : "POST"
    await fetch(`https://groups.roblox.com/v1/groups/5074189/join-requests/users/${userId}`, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"100\", \"Google Chrome\";v=\"100\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-csrf-token": "1Py4geXWTr4h"
        },
        "referrer": "https://www.roblox.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": method,
        "mode": "cors",
        "credentials": "include"
    });
}


document.querySelector('#submitButton').addEventListener('click', async (e) => {
    const poofItems = document.getElementsByClassName('poof');
    for (let i = 0; i < poofItems.length; i++) {
        poofItems[i].style.display = 'none';
    }
    document.querySelector('#loading').style.display = 'flex';
    await checkPendingRequests();
    for (let i = 0; i < pendingRequests.length; i++) {
        for (let j = 0; j < notAllowed.length; j++) {
            let displayName = pendingRequests[i].requester.displayName.toLowerCase();
            if (!displayName.includes(notAllowed[j])) {
                if (!acceptableUsers.some(x => x.requester.displayName === pendingRequests[i].requester.displayName)) {
                    acceptableUsers.push(pendingRequests[i]);
                }
            } else {
                if (!deniedUsers.some(x => x.requester.displayName === pendingRequests[i].requester.displayName)) {
                    deniedUsers.push(pendingRequests[i])
                }
            }

        }
       // await checkPendingRequests();
    }
    for (let i = 0; i < acceptableUsers.length; i++) {
        setTimeout(() => {
            processUser(true, acceptableUsers[i].requester.userId)
        }, 500)
    }

    for (let i = 0; i < deniedUsers.length; i++) {
        setTimeout(() => {
            processUser(false, deniedUsers[i].requester.userId);
        }, 500)
    }

    console.log('denied');
    console.log(deniedUsers);
    console.log('accepted');
    console.log(acceptableUsers);
    document.querySelector('#loading').style.display = 'none';


})