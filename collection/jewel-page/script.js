const urlParams = new URLSearchParams(window.location.search);
const product_id = urlParams.get("product_id");
const id = urlParams.get("id");
const product_part = document.querySelector(".product-part");
const basket_count = document.querySelector(".uxskpx");
const loginText = document.querySelector(".nav-log-in").lastElementChild
const home = document.querySelector(".home")
const collection = document.querySelector(".collection")
const blog = document.querySelector(".blog")
const contact = document.querySelector(".contact")
const nav_basket = document.querySelector(".nav-basket")
const logIn = document.querySelector(".nav-log-in")

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

function apiProcessor(api) {
  fetch(api)
    .then((response) => response.json())
    .then((object) => createSlide(object));
}

async function authorizedApiProcessorPatch(api, bodyinfo) {
  try {
    let response = await fetch(api, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(bodyinfo),
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
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(bodyinfo),
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
  

function createSlide(info) {
  const box = document.createElement("div");
  box.className = "box";
  box.innerHTML = `
                  <a href="http://127.0.0.1:5501/collection/jewel-page/index.html?id=${info.product_id}" class="img"><img src="${info.img}" alt="" class="first_img"><img src="${info.img_alternative}" alt="" class="second_img"></a>
                  <div class="box-lower-part">
                      <input type="number" class="item-amount" min=1 value=1 data-product-id="${info.product_id}" data-price="${info.price}">
                      <div class="price">${info.price}$</div>
                      <div class="description" href="http://127.0.0.1:5501/collection/jewel-page/index.html?id=${info.product_id}">
                          <span class="title">${info.product_title}</span>
                          <span class="description">${info.product_description}</span>
                          <span class="size">SIZE: ${info.size}</span>
                      </div>
                  </div>
                  <div class="click" onclick="basket_click(${info.product_id})">Add To Basket</div>
          `;
  product_part.appendChild(box);
  let amount = document.querySelector(".item-amount");
  let price = document.querySelector(".price");
  amount.addEventListener(
    "input",
    () => (price.textContent = amount.value * info.price + "$")
  );
}

function basket_click(product_id) {
    let input_value = document.querySelector(".item-amount");
    let basket = JSON.parse(localStorage.getItem("user_name"));
    for (let i = 0; i < input_value.value; i++) {
      basket.push(product_id);
      localStorage.setItem("user_name", JSON.stringify(basket));
    }
    if (localStorage.getItem("access_token") && !isTokenExpired(localStorage.getItem("access_token"))) {
      authorizedApiProcessorPatch(`http://127.0.0.1:8000/cart/${product_id}/update/`, {
        product_amount: Number(input_value.value),
      });
    } else {
      ple
    }
    basket_count.textContent = JSON.parse(localStorage.getItem("user_name")).length
  }


apiProcessor(`http://127.0.0.1:8000/all_items/${product_id}/`);
