"use strict";
const basket_count = document.querySelector(".uxskpx");
const loginText = document.querySelector(".nav-log-in").lastElementChild;
const listElement = document.querySelector(".items");
const items = document.querySelectorAll(".parent")
const proceed_btn = document.querySelector(".proceed");
const middle_part_overlay = document.querySelector(".middle-part-overlay")
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
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
  if (listElement.textContent == '') {
    listElement.innerHTML =
    "<div class='empty-cart'>Your Cart is Empty</div>";
    proceed_btn.style.display = "none";
  }
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
    basket_count.textContent = JSON.parse(
      localStorage.getItem("user_name")
    ).length;
  }
};


function detailApiProcessor(api) {
  listElement.innerHTML =
  "<div class='empty-cart' style='display: None;'>Your Cart is Empty</div>";
  fetch(api)
    .then((response) => response.json())
    .then((data) => {
      createSlideTest(data);
      proceed_btn.style.display = "flex"
    });
}

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

function authorizedApiProcessorDelete(api) {
  fetch(api, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    },
  }).catch((error) => console.error("Error:", error));
}

function apiProcessor(api) {
  let access_token = localStorage.getItem("access_token");
  fetch(api, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  }).then(async (response) => {
    if (response.ok) {
      response.json().then((data) => {
        for (let item of data["results"]) {
          let product_id = Number(item["product"]);
          let url = `http://127.0.0.1:8000/all_items/${product_id}/`;
          detailApiProcessor(url);
        }
      });
    } else {
      console.log("Access token expired. Attempting to refresh token...");
      let refresh_token = localStorage.getItem("refresh_token");
      const newAccessToken = await refreshAccessToken(refresh_token);
      if (newAccessToken) {
        await fetch(api, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newAccessToken}`,
          },
        })
          .then((secondresponse) => {
            if (secondresponse.ok) {
              apiProcessor("http://127.0.0.1:8000/cart_view/");
            } else {
              alert("Failed to log out even after token refresh.");
            }
          })
          .catch((error) => {
            console.error("Error during logout after token refresh:", error);
            alert("An error occurred while logging out.");
          });
      } else {
        alert("Unable to refresh access token. Please log in again.");
      }
    }
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

function createSlideTest(info) {
  let listItems = document.querySelectorAll(".parent");
  let productID = CSS.escape(info.product_id);
  let input_value = document.querySelector(
    `#${productID} .box .box-lower-part .description .item-amount`
  );
  let price_value = document.querySelector(
    `#${productID} .box .box-lower-part .description .price`
  );
  if (listItems) {
    let element = Array.from(listItems).find(
      (item) => Number(item.id) == info.product_id
    );
    if (element) {
      if (element.id == info.product_id) {
        input_value.value = Number(input_value.value) + 1;
        price_value.textContent = info.price * input_value.value + " $";
      }
    } else {
      createSlide(info);
    }
  } else {
    createSlide(info);
  }
}

function createSlide(info) {
  const li = document.createElement("li");
  li.className = "parent";
  li.innerHTML = `
        <div class="box">
            <a href="http://127.0.0.1:5501/collection/jewel-page/index.html?product_id=${
                info.product_id
                }&id=${id}" class="img">
                <img src="${info.img}" alt="" class="first_img">
                <img src="${info.img_alternative}" alt="" class="second_img">
            </a>
            <div class="box-lower-part">
                <div class="description" href="">
                    <span>${info.product_title}</span>
                    <span>${info.product_description}</span>
                    <input type="number" class="item-amount" value=1 max=${info.product_amount}>
                    <div class="price">${info.price} $</div>
                </div>
            </div>
            <div class="cross"> 
                <div class="line1"></div>
                <div class="line2"></div>
            </div>
        </div>`;
  li.id = `${info.product_id}`;
  listElement.appendChild(li);
  let productID = CSS.escape(info.product_id);
  let input_value = document.querySelector(
    `#${productID} .box .box-lower-part .description .item-amount`
  );
  let price_value = document.querySelector(
    `#${productID} .box .box-lower-part .description .price`
  );
  if (localStorage.getItem("access_token")) {
    authorizedApiProcessorGet(`http://127.0.0.1:8000/cart_view/`).then(
      (data) => {
        let filtered = data["results"].filter(
          (product) => product.product === info.product_id
        );
        input_value.value = filtered[0]["product_amount"];
        price_value.textContent = input_value.value * info.price +'$';
      }
    );
  }

  input_value.addEventListener("input", function () {
    let parent = document.querySelector(`#${productID}`);
    let basket = JSON.parse(localStorage.getItem("user_name"));
    let filtered = basket.filter((item) => item !== Number(info.product_id));
    let new_user_name = filtered;
    if (input_value.value >= 1) {
      for (let i = 0; i < input_value.value; i++) {
        new_user_name.push(info.product_id);
        localStorage.setItem("user_name", JSON.stringify(new_user_name));
      }
    } else {
      localStorage.setItem("user_name", JSON.stringify(new_user_name));
    }
    if (input_value.value >= 1) {
      let sum = input_value.value * info.price;
      price_value.textContent = sum + '$';
      if (localStorage.getItem("access_token")) {
        authorizedApiProcessorPatch(
            `http://127.0.0.1:8000/cart/${info.product_id}/basket_update/`,
            { product_amount: Number(input_value.value) }
          );
      }
    } else {
      parent.remove();
      if (localStorage.getItem("access_token")) {
        authorizedApiProcessorDelete(
          `http://127.0.0.1:8000/cart/item/${Number(info.product_id)}/delete/`
        );
      }
    }
    if (listElement.children.length == 1){
      listElement.innerHTML =
      "<div class='empty-cart'>Your Cart is Empty</div>";
      proceed_btn.style.display = "none";
    }
    basket_count.textContent = JSON.parse(localStorage.getItem("user_name")).length
  });
}


listElement.addEventListener("click", function (event) {
  if (event.target && event.target.closest(".cross")) {
    let cross = event.target.closest(".cross");
    let parent = cross.closest(".box");
    let grandParent = parent.closest(".parent");
    let grandgrandParent = grandParent.closest(".items");
    let grandParent_id = grandParent.id;
    const url = `http://127.0.0.1:8000/cart/item/${Number(
      grandParent_id
    )}/delete/`;
    let access_token = localStorage.getItem("access_token");
    let basket = JSON.parse(localStorage.getItem("user_name"));
    let filtered = basket.filter((item) => item !== Number(grandParent_id));
    localStorage.setItem("user_name", JSON.stringify(filtered));
    if (access_token) {
      authorizedApiProcessorDelete(url);
    }       
    if (grandgrandParent.children.length == 2) {
      grandParent.remove();
      grandgrandParent.innerHTML =
        "<div class='empty-cart'>Your Cart is Empty</div>";
      proceed_btn.style.display = "none";
    } else {
      grandParent.remove();
    }
    basket_count.textContent = JSON.parse(localStorage.getItem("user_name")).length
  }
});


proceed_btn.addEventListener("click", proceedToAddress)

let speacial_array = []

async function proceedToAddress() {
  if (localStorage.getItem("access_token")){
    try {
      const cartResponse = await authorizedApiProcessorGet("http://127.0.0.1:8000/cart_view/");
      const cartItems = cartResponse.results;
      const stockChecks = await Promise.all(cartItems.map(async (item) => {
          const productResponse = await authorizedApiProcessorGet(`http://127.0.0.1:8000/all_items/${item.product}/`);
          return { item, productData: productResponse };
      }));

      const errors = [];
      stockChecks.forEach(({ item, productData }) => {
          if (!productData.product_amount) {
              errors.push({ img: productData.img, message: 'მარაგი ამოიწურა' });
          } else if (productData.product_amount < item.product_amount) {
              errors.push({
                  img: productData.img,
                  message: `${productData.product_title} მითითებული რაოდენობით არ არის ხელმისაწვდომი. ხელმისაწვდომი რაოდენობა: ${productData.product_amount}.`
              });
          }
      });

      if (errors.length > 0) {
          middle_part_overlay.style.display = "flex";
          middle_part_overlay.innerHTML = '';
          errors.forEach(error => {
              const specialDiv = document.createElement("div");
              specialDiv.className = "specialDiv";
              specialDiv.innerHTML = `<img src="${error.img}"><div>${error.message}</div>`;
              middle_part_overlay.appendChild(specialDiv);
          });
          return;
      }

      await Promise.all(stockChecks.map(({ item, productData }) => {
          const calculatedAmount = productData.product_amount - item.product_amount;
          return authorizedApiProcessorPatch(
              `http://127.0.0.1:8000/all_items/${item.product}/update/`,
              { product_amount: calculatedAmount }
          );
      }));

      window.location.href = `http://127.0.0.1:5501/address/index.html?id=${id}`;
  } catch (error) {
      console.error('Error:', error);
      middle_part_overlay.style.display = "flex";
      middle_part_overlay.innerHTML = `<div class="specialDiv">An error occurred: ${error.message}</div>`;
  }
  } else {
    middle_part_overlay.style.display = 'flex'
    middle_part_overlay.textContent = "Please Log In!"
  }

}


function overlayClick(div){
    div.style.display = "none"
}

if (localStorage.getItem("access_token")) {
  apiProcessor("http://127.0.0.1:8000/cart_view/");
} else {
  let local_storage_info = JSON.parse(localStorage.getItem("user_name"));
  for (let i = 0; i < local_storage_info.length; i++) {
    detailApiProcessor(
      `http://127.0.0.1:8000/all_items/${local_storage_info[i]}/`
    );
  }
}
