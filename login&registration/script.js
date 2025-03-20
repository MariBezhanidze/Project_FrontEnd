"use strict";

const slides = document.querySelectorAll(".login-slide");
const singIn = document.querySelector(".signin-form");
const signUp = document.querySelector(".signup-form");
const form_btn2 = document.querySelector(".form-btn2");
const right_btn = document.querySelector(".right-btn");
const left_btn = document.querySelector(".left-btn");
const right_children = right_btn.parentElement.children;
const left_children = left_btn.parentElement.children;
const sign_up_form = document.querySelector(".signup-form");
const sign_in_form = document.querySelector(".signin-form");
const loginText = document.querySelector(".nav-log-in").lastElementChild;
const basket_count = document.querySelector(".uxskpx");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const home = document.querySelector(".home");
const collection = document.querySelector(".collection");
const blog = document.querySelector(".blog");
const contact = document.querySelector(".contact");
const nav_basket = document.querySelector(".nav-basket");
const logIn = document.querySelector(".nav-log-in");

function isTokenExpired(token) {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const exp = payload.exp;
  const now = Math.floor(Date.now() / 1000);

  return exp < now;
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
    localStorage.getItem("access_token") &&
    !isTokenExpired(localStorage.getItem("refresh_token"))
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

let index = 1;
slides[0].classList.add("active");
function startSlider() {
  setInterval(() => {
    appear_slide(slides, slides[index]);
    index = (index + 1) % slides.length;
  }, 3000);
}

function appear_slide(slides, slide) {
  slides.forEach((s) => s.classList.remove("active"));
  slide.classList.add("active");
}

startSlider();

right_btn.addEventListener("click", () => {
  singIn.style.display = "none";
  signUp.style.display = "flex";
  for (let item of right_children) {
    item.classList.add("active");
  }
  for (let item of left_children) {
    item.classList.remove("active");
  }
});

left_btn.addEventListener("click", () => {
  signUp.style.display = "none";
  singIn.style.display = "flex";
  for (let item of right_children) {
    item.classList.remove("active");
  }
  for (let item of left_children) {
    item.classList.add("active");
  }
});

function authorizedApiProcessorGet(api) {
  return fetch(api, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
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

sign_up_form.addEventListener("submit", formSubmit);

function formSubmit(event) {
  event.preventDefault();
  const formData = {
    first_name: document.getElementById("firstName").value,
    last_name: document.getElementById("lastName").value,
    username: document.getElementById("userName").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };
  fetch("http://127.0.0.1:8000/register/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
      } else {
        alert("Error: " + JSON.stringify(data));
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while processing the request.");
    });
}

sign_in_form.addEventListener("submit", SignInformSubmit);
function SignInformSubmit(e) {
  e.preventDefault();
  let raw_cart = JSON.parse(localStorage.getItem("user_name"));
  let cart = [];
  if (!raw_cart) {
    cart = [];
  } else {
    for (let item of raw_cart) {
      cart.push(parseInt(item));
    }
  }
  const formData = {
    username: document.getElementById("user-name").value,
    password: document.getElementById("signIn-password").value,
    cart: cart,
  };
  fetch("http://127.0.0.1:8000/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.access != undefined && data.refresh != undefined) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        authorizedApiProcessorGet("http://127.0.0.1:8000/cart_view/").then(
          (newdata) => {
            let new_basket = [];
            for (let item of newdata["results"]) {
              for (let i = 0; i < item.product_amount; i++) {
                new_basket.push(item.product);
              }
            }
            localStorage.setItem("user_name", JSON.stringify(new_basket));
            basket_count.innerHTML = new_basket.length;
            window.location.href = `/user_page/index.html?id=${data.user_id}`;
          }
        );
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while processing the request.");
    });
}
