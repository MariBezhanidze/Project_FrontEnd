let post_test = document.querySelector(".post-test");
const textarea = document.querySelector('.post-text');
let logInText = document.querySelector(".logInText");
const overlay = document.querySelector(".overlay");
let comment_box = document.querySelector(".comment");
const basket_count = document.querySelector(".uxskpx");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const home = document.querySelector(".home")
const collection = document.querySelector(".collection")
const blog = document.querySelector(".blog")
const contact = document.querySelector(".contact")
const nav_basket = document.querySelector(".nav-basket")
const logIn = document.querySelector(".nav-log-in")
const loginText = document.querySelector(".nav-log-in").lastElementChild


function disappear(element){
    element.style.display = "none"
}


post_test.addEventListener("submit", postSubmit);


async function authorizedApiProcessorGet(api) {
  try {
    let response = await fetch(api, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (response.status === 401) {
      logIn.setAttribute(
        "href",
        `http://127.0.0.1:5501/login&registration/index.html`
      );
      const refresh_token = localStorage.getItem("refresh_token");
      const newAccessToken = await refreshAccessToken(refresh_token);

      if (newAccessToken) {
        response = await fetch(api, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        if (response.ok) {
          return await response.json();
        } else {
          console.error("Failed to proceed after token refresh.");
          return null; 
        }
      } else {
        console.error("Unable to refresh the access token.");
        return null; 
      }
    }

    if (response.ok) {
      return await response.json();
    } else {
      console.error("API request failed:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return null;
  }
}

function isTokenExpired(token) {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const exp = payload.exp;
  const now = Math.floor(Date.now() / 1000);

  return exp < now;
}

window.onload = function () {
  if (
    localStorage.getItem("access_token") && !isTokenExpired(localStorage.getItem("refresh_token"))
  ) {
    home.setAttribute("href", `http://127.0.0.1:5501/index.html?id=${id}`);
    collection.setAttribute(
      "href",
      `http://127.0.0.1:5501/collection/index.html?id=${id}`
    );
    contact.setAttribute(
      "href",
      `http://127.0.0.1:5501/contact/index.html?id=${id}`
    );
    blog.setAttribute("href", `http://127.0.0.1:5501/blog/index.html?id=${id}`);
    nav_basket.setAttribute(
      "href",
      `http://127.0.0.1:5501/basket/index.html?id=${id}`
    );
    logIn.setAttribute(
      "href",
      `http://127.0.0.1:5501/user_page/index.html?id=${id}`
    );
    authorizedApiProcessorGet(`http://127.0.0.1:8000/user/${id}/`).then(
      (data) => {
        let first_name = data["first_name"];
        loginText.textContent = `Hello, ${first_name}`;
      }
    );
    basket_count.textContent = JSON.parse(
      localStorage.getItem("user_name")
    ).length;
  } else {
    home.setAttribute("href", `http://127.0.0.1:5501/index.html`);
    collection.setAttribute(
      "href",
      `http://127.0.0.1:5501/collection/index.html`
    );
    contact.setAttribute("href", `http://127.0.0.1:5501/contact/index.html`);
    blog.setAttribute("href", `http://127.0.0.1:5501/blog/index.html`);
    nav_basket.setAttribute("href", `http://127.0.0.1:5501/basket/index.html`);
    logIn.setAttribute(
      "href",
      `http://127.0.0.1:5501/login&registration/index.html`
    );
  }
};

function scrollToBottom(div) {
    div.scrollTop = div.scrollHeight;
}



async function refreshAccessToken(refreshToken) {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }
  
      const data = await response.json();
      localStorage.setItem("access_token", data.access);
      return data.access;
    } catch (error) {
      console.error("Error refreshing token:", error);
      alert("Session expired. Please log in again.");
      return null;
    }
  }

async function postSubmit(e) {
    e.preventDefault();
    if (localStorage.getItem("access_token")){
        let access_token = localStorage.getItem("access_token");
        let refresh_token = localStorage.getItem("refresh_token");
        let content = document.querySelector(".post-text").value;
        try {
            let response = await fetch('http://127.0.0.1:8000/comment_post/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    content: content
                }),
            });
    
            if (response.status === 401) {
                console.log("Access token expired. Attempting to refresh token...");
                const newAccessToken = await refreshAccessToken(refresh_token);
    
                if (newAccessToken) {
                    response = await fetch('http://127.0.0.1:8000/comment_post/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${newAccessToken}`,
                        },
                        body: JSON.stringify({
                            content: content
                        }),
                    });
                } else {
                    alert('Unable to refresh access token. Please log in again.');
                    return;
                }
            }
    
            const data = await response.json();
            createPost(data.data.user_name, data.data.content, data.data.created_at);
    
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing the request.');
        }
    } else {
        overlay.style.display = "flex"
    }
}

async function refreshAccessToken(refreshToken) {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return data.access;
    } catch (error) {
        console.error('Error refreshing token:', error);
        alert('Session expired. Please log in again.');
        return null;
    }
}



function getPosts(){
    fetch('http://127.0.0.1:8000/comment_view/')
    .then(response => response.json())
    .then(data => {
        for (let item of data.results){
            createPost(`${item.user.first_name} ${item.user.last_name}`, item.content, item.created_at)
        }
        }
    )
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing the request.');
    })
}

function createPost(user, data, time){
    let current_post = document.createElement("li")
    current_post.innerHTML = `<span class="userTitle">${user}:</span>
                            <span class="userText">${data}</span>
                            <span class="date">Date: ${time}</span>`
    comment_box.appendChild(current_post)
    comment_box.scrollTop = comment_box.scrollHeight;
}

textarea.addEventListener('input', function () {
    this.style.height = 'auto'; 
    this.style.height = (this.scrollHeight) + 'px';
});

getPosts()
