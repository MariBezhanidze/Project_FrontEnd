const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const loginText = document.querySelector(".nav-log-in").lastElementChild;
const address_form = document.querySelector(".address-form");
let country = document.querySelector(".country");
let city = document.querySelector(".city");
let address = document.querySelector(".homeAddress");
let phone = document.querySelector(".phone");
let card = document.querySelector(".card");
const basket_count = document.querySelector(".uxskpx");
const home = document.querySelector(".home");
const collection = document.querySelector(".collection");
const blog = document.querySelector(".blog");
const contact = document.querySelector(".contact");
const nav_basket = document.querySelector(".nav-basket");
const logIn = document.querySelector(".nav-log-in");

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

authorizedApiProcessorGet("http://127.0.0.1:8000/address_view/").then(
  (data) => {
    if (!data?.results?.length) {
      address_form.addEventListener("submit", function (event) {
        event.preventDefault();
        addressFormSubmit(event, id);
      });
    } else {
      const firstAddress = data.results[0];
      country.value = firstAddress.country;
      city.value = firstAddress.city;
      address.value = firstAddress.address;
      phone.value = firstAddress.phone;
      card.value = firstAddress.card;

      address_form.addEventListener("submit", function (event) {
        addressFormChange(event, firstAddress.id, firstAddress.user);
      });
    }
  }
);

function addressFormSubmit(event, user_id) {
  event.preventDefault();
  const formData = {
    user: user_id,
    country: document.querySelector(".country").value,
    city: document.querySelector(".city").value,
    address: document.querySelector(".homeAddress").value,
    phone: document.querySelector(".phone").value,
    card: document.querySelector(".card").value,
  };
  fetch("http://127.0.0.1:8000/address_create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = `/check_out/index.html?id=${user_id}`;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while processing the request.");
    });
}

function addressFormChange(event, address_id, user_id) {
  event.preventDefault();
  const formData = {
    user: user_id,
    country: document.querySelector(".country").value,
    city: document.querySelector(".city").value,
    address: document.querySelector(".homeAddress").value,
    phone: document.querySelector(".phone").value,
    card: document.querySelector(".card").value,
  };
  fetch(`http://127.0.0.1:8000/address/${address_id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = `/check_out/index.html?id=${id}`;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while processing the request.");
    });
}
