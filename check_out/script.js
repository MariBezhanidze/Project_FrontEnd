const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const address = document.querySelector(".address-part")
let cart_part = document.querySelector(".cart-part")
const confirm_btn = document.querySelector(".confirm-btn")
const total = document.querySelector(".total")
const overlay = document.querySelector(".overlay")
const upper = document.querySelector(".upper")
const home = document.querySelector(".home")
const collection = document.querySelector(".collection")
const blog = document.querySelector(".blog")
const contact = document.querySelector(".contact")
const nav_basket = document.querySelector(".nav-basket")
const logIn = document.querySelector(".nav-log-in")
const loginText = document.querySelector(".nav-log-in").lastElementChild

let order_info = []
function detailApiProcessor(api) {
    return fetch(api)
      .then((response) => response.json())
}

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

fetch(`http://127.0.0.1:8000/cart_view/`,
    {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        }
      }
).then(response => response.json()).then(data => createCartPart(data["results"]))

fetch(`http://127.0.0.1:8000/address_view/`,
    {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        }
      }
).then(response => response.json()).then(data => createAddressPart(data["results"][0]))

function authorizedApiProcessorDelete(api) {
    fetch(api, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    }).catch((error) => console.error("Error:", error));
  }

function createCartPart(info) {
    let amount = 0;
    for (let item of info) {
        let cart_content = document.createElement("div");
        cart_content.className = 'cart-content'
        detailApiProcessor(`http://127.0.0.1:8000/all_items/${item.product}/`).then(data => {
            let price = data.price * item.product_amount;
            cart_content.innerHTML = `
                <img src="${data.img}" alt="">
                <div class="right">
                    <div class="title">${data.product_title}</div>
                    <div class="description">${data.product_description}</div>
                    <div class="amount">${item.product_amount} ცალი</div>
                    <div class="price">${price}$</div>
                </div>
            `;
            cart_part.appendChild(cart_content);
            amount += price;
            total.textContent = "სულ: " + amount + "$";
            order_info["customer"] = item.customer
            if (!order_info["product"]) {
                order_info["product"] = []; 
              }
            order_info["product"].push({
                product: item.product,
                amount: item.product_amount
            });
            order_info["total_price"] = amount
        });
    }
}


function createAddressPart(info){
    let content = document.createElement("div")
    content.className = 'content'
    content.innerHTML = `<div class="country">${info.country}</div>
        <div class="city">${info.city}</div>
        <div class="address">${info.address}</div>
        <div class="phone">${info.phone}</div>
        <div class="card">${info.card}</div>
    `
    address.appendChild(content)
    order_info["address"] = info.id
}


function proceedToCheckout(){
    let address = order_info['address']
    let customer = order_info['customer']
    let product = order_info['product']
    let total_price = order_info['total_price']
    fetch(`http://127.0.0.1:8000/order_create/`,
        {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("access_token"),
            },
            body: JSON.stringify({address: address, customer: customer, products: product, total_price: total_price})
        }
    )
    for (let item of order_info['product']){
        authorizedApiProcessorDelete(`http://127.0.0.1:8000/cart/item/${item['product']}/delete/`)
    }
    upper.style.display = "none"
    confirm_btn.style.display = "none"
    overlay.style.display = "flex"
}


function dissappear(div) {
    localStorage.setItem("user_name", JSON.stringify([]))
    window.location.href = `/user_page/index.html?id=${id}`
}


