const loginText = document.querySelector(".nav-log-in").lastElementChild;
const basket_count = document.querySelector(".uxskpx");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const home = document.querySelector(".home");
const collection = document.querySelector(".collection");
const blog = document.querySelector(".blog");
const contact = document.querySelector(".contact");
const nav_basket = document.querySelector(".nav-basket");
const orders = document.querySelector(".orders");
const logIn = document.querySelector(".nav-log-in");
const greeting = document.querySelector(".greeting");

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
        "http://127.0.0.1:5501/login&registration/index.html"
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
        let last_name = data["last_name"];
        loginText.textContent = `Hello, ${first_name}`;
        greeting.textContent = `Hello, ${first_name} ${last_name}`;
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

async function logOut() {
  let access_token = localStorage.getItem("access_token");
  let refresh_token = localStorage.getItem("refresh_token");
  let body = JSON.stringify({ refresh: refresh_token });
  localStorage.setItem("user_name", JSON.stringify([]));
  fetch("http://127.0.0.1:8000/logout/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    body: body,
  })
    .then(async (response) => {
      if (response.ok) {
        console.log("Logged out successfully.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login&registration/index.html";
      } else {
        if (response.status === 401) {
          console.log("Access token expired. Attempting to refresh token...");
          const newAccessToken = await refreshAccessToken(refresh_token);

          if (newAccessToken) {
            await fetch("http://127.0.0.1:8000/logout/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newAccessToken}`,
              },
              body: JSON.stringify({ refresh: refresh_token }),
            })
              .then((logoutResponse) => {
                if (logoutResponse.ok) {
                  console.log("Logged out after token refresh.");
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                  window.location.href = "/login&registration/index.html";
                } else {
                  alert("Failed to log out even after token refresh.");
                }
              })
              .catch((error) => {
                console.error(
                  "Error during logout after token refresh:",
                  error
                );
                alert("An error occurred while logging out.");
              });
          } else {
            alert("Unable to refresh access token. Please log in again.");
          }
        }
      }
    })
    .catch((error) => {
      console.error("Error during logout request:", error);
      alert("An error occurred while processing the request.");
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

authorizedApiProcessorGet(`http://127.0.0.1:8000/order_view/${id}/`).then(
  (data) => {
    console.log(data);
    for (let item of data["results"]) {
      let order = document.createElement("div");
      order.className = "order";
      let total = document.createElement("div");
      total.className = "total";
      order.innerHTML = `
        <span class="order-id">შეკვეთის ნომერი: ${item.id}</span>
        <div class="address">
          <span>მისამართი:</span>
          <div>${item.address["country"]}, ${item.address["city"]}, ${item.address["address"]}.</div>
        </div>
    `;
      for (let product of item["products"]) {
        let product_content = document.createElement("div");
        product_content.className = "product-content";
        product_content.innerHTML = `<img src=${product.product.img}>
    <div class="product-lower">
    <span>${product.product.product_title}</span>
    <span>ზომა: ${product.product.size}</span>
    <span>რაოდენობა: ${product.amount}</span>
    </div>
      `;
        order.appendChild(product_content);
      }
      total.innerHTML = `<span>ღირებულება: ${item.total_price}$</span>`;
      order.appendChild(total);
      orders.appendChild(order);
    }
  }
);
