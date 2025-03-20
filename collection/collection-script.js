"use strict";

const uppers = document.querySelectorAll(".upper");
const collection_slides = document.querySelectorAll(".collection-slide");
const page_size = document.querySelector(".page-size");
const pagination = document.querySelector(".pagination");
const go = document.querySelector(".go");
const basket_count = document.querySelector(".uxskpx");
const min_price = document.querySelector(".min-price");
const max_price = document.querySelector(".max-price");
const min_size = document.querySelector(".min-size");
const max_size = document.querySelector(".max-size");
const material = document.querySelectorAll(".material-type");
const loginText = document.querySelector(".nav-log-in").lastElementChild;
const filter_btn = document.querySelector(".filter-btn");
const filter_left = document.querySelector(".left");
const filter_right = document.querySelector(".right");
const category = document.querySelector(".category");
const category_checkbox = document.querySelectorAll(".category-checkbox");
const filter_boxes = document.querySelectorAll(".filter-box");
const listElement = document.querySelector(".item-list");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const home = document.querySelector(".home")
const collection = document.querySelector(".collection")
const blog = document.querySelector(".blog")
const contact = document.querySelector(".contact")
const nav_basket = document.querySelector(".nav-basket")
const logIn = document.querySelector(".nav-log-in")

uppers.forEach((upper) => {
  upper.addEventListener("click", function () {
    const index = Array.from(uppers).indexOf(upper);
    let filter_box = upper.parentElement;
    let cross_line = upper.lastElementChild.lastElementChild;
    if (filter_box.classList.contains("active")) {
      filter_box.style.animation =
        "filterBox-anim-backwards 0.5s linear forwards";
      cross_line.classList.remove("display-none");
      filter_box.classList.remove("active");
    } else {
      filter_box.style.animation = "filterBox-anim 0.5s linear forwards";
      filter_box.classList.add("active");
      cross_line.classList.add("display-none");
    }
    for (let item of filter_boxes) {
      let current_index = Array.from(filter_boxes).indexOf(item);
      let active_cross =
        item.firstElementChild.lastElementChild.lastElementChild;
      if (current_index != index && item.classList.contains("active")) {
        item.classList.remove("active");
        item.style.animation = "filterBox-anim-backwards 0.5s linear forwards";
        active_cross.classList.remove("display-none");
      }
    }
  });
});


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

let index = 1;
collection_slides[0].classList.add("active");
function startSlider() {
  setInterval(() => {
    appear_slide(collection_slides, collection_slides[index]);
    index = (index + 1) % collection_slides.length;
  }, 3000);
}

function appear_slide(slides, slide) {
  slides.forEach((s) => s.classList.remove("active"));
  slide.classList.add("active");
}

startSlider();

////////////// LOWER - PART; API-STARTS //////////////////////////////////////////////////////////////////////////
let item = [];
let new_itemList = [];
function apiProcessor(api, input, value) {
  if (input) {
    fetch(api)
      .then((response) => response.json())
      .then((object) => {
        processData(api, object, input, value)
      });
  } else {
    fetch(api)
      .then((response) => response.json())
      .then((object) => 
        {
          processData(api, object, 100, value)
        });
  }
}


function processData(api, object, input, value) {
  if (value == true) {
    item.push(object);
    createPagination(object["results"]);
  } else {
    createSlide(object["results"]);
    for (let i = 1; i <= Math.ceil(object["count"] / input); i++) {
      const li = document.createElement("li");
      li.innerHTML = `${i}`;
      li.addEventListener("click", () => {
        changePage(api, i, input);
      });
      li.style.cursor = "pointer";
      li.style.color = "rgb(3, 3, 96)";
      pagination.appendChild(li);
    }
  }
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

function createPagination(array) {
  let chunkedArray = chunkArray(array, 4);
  createSlide(chunkedArray[0]);
  pagination.innerHTML = "";
  for (let i = 1; i <= Math.ceil(array.length / 4); i++) {
    const li = document.createElement("li");
    li.innerHTML = `${i}`;
    li.addEventListener("click", () => {
      createSlide(chunkedArray[i - 1]);
    });
    li.style.cursor = "pointer";
    li.style.color = "rgb(3, 3, 96)";
    pagination.appendChild(li);
  }
}

function changePage(api, value) {
  fetch(`${api}&page=${value}`)
    .then((response) => response.json())
    .then((data) => createSlide(data["results"]));
}

function createSlide(info) {
  listElement.innerHTML = "";
  info.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
            <div class="box" id=${item.product_id}>
                <a href="http://127.0.0.1:5501/collection/jewel-page/index.html?product_id=${item.product_id}&id=${id}" class="img"><img src="${item.img}" alt="" class="first_img"><img src="${item.img_alternative}" alt="" class="second_img"></a>
                <div class="box-lower-part">
                    <input type="number" class="item-amount" min=1 max=${item.product_amount} value=1 data-product-id="${item.product_id}" data-price="${item.price}">
                    <a class="description" href="http://127.0.0.1:5501/collection/jewel-page/index.html?product_id=${item.product_id}&id=${id}">
                        <span>${item.product_title}</span>
                        <span>${item.product_description}</span>
                        <div class="price">${item.price}$</div>
                    </a>
                    <div class="overlay" style="display: none;" onclick="overlayClick(this)"></div>
                </div>
                <div class="click" onclick="basket_click(${item.product_id})">Add To Basket</div>
            </div>
        `;

    listElement.appendChild(li);
  });

  let amounts = document.querySelectorAll(".item-amount");
  amounts.forEach((amount) => {
    let productId = amount.getAttribute("data-product-id");
    let ID = CSS.escape(productId);
    let price = amount.getAttribute("data-price");
    amount.addEventListener("input", () =>
      inputFunction(amount, productId, price)
    );
  });

  let imges = document.querySelectorAll(".img");
  imges.forEach((img) => {
    mouse_over_Img(img);
  });
  imges.forEach((img) => {
    mouse_leave_Img(img);
  });
}

function overlayClick(div) {
  div.style.display = "none";
}

function inputFunction(activediv, product_id, price) {
  let id = CSS.escape(product_id);
  let amount = activediv.value;
  let price_value = document.querySelector(
    `#${id} .box-lower-part .description .price`
  );
  let sum = Number(amount) * Number(price);
  price_value.innerHTML = sum + "$";
}

function basket_click(id) {
  let productID = CSS.escape(id);
  let input_value = document.querySelector(
    `#${productID} .box-lower-part .item-amount`
  );
  if (input_value.max > 0 && parseFloat(input_value.value) <= parseFloat(input_value.max)) {
    let basket = JSON.parse(localStorage.getItem("user_name"));
    for (let i = 0; i < input_value.value; i++) {
        basket.push(id);
        localStorage.setItem("user_name", JSON.stringify(basket));
    }

    if (localStorage.getItem("access_token")) {
      authorizedApiProcessorPatch(`http://127.0.0.1:8000/cart/${id}/update/`, {
        product_amount: Number(input_value.value),
      });
    }
    basket_count.textContent = JSON.parse(
      localStorage.getItem("user_name")
    ).length;
    
  } else if (parseFloat(input_value.value) > parseFloat(input_value.max) && input_value.max > 0) {
      let overlay = document.querySelector(
        `#${productID} .box-lower-part .overlay`
      );
      overlay.style.display = "flex";
      overlay.textContent = `${input_value.max} ცალია ხელმისაწვდომი.`;
  } else if (input_value.max < 1) {
    let overlay = document.querySelector(
      `#${productID} .box-lower-part .overlay`
    );
    overlay.style.display = "flex";
    overlay.textContent = `მარაგი ამოიწურა`;
  }
}

function mouse_over_Img(img) {
  img.addEventListener("mouseover", function () {
    let first_img = img.firstElementChild;
    let second_img = img.lastElementChild;
    first_img.style.display = "none";
    second_img.style.display = "flex";
  });
}

function mouse_leave_Img(img) {
  img.addEventListener("mouseleave", function () {
    let first_img = img.firstElementChild;
    let second_img = img.lastElementChild;
    first_img.style.display = "flex";
    second_img.style.display = "none";
  });
}


let search_fields = [];
let material_content = "";

filter_btn.addEventListener("click", function () {
  item = [];
  category_checkbox.forEach((category) => {
    let category_type = category.nextElementSibling;
    let type = checkCategory(category_type.textContent);
    let category_content = `category=${type}`;
    if (category.checked) {
      search_fields.push(category_content);
    }
  });
  let min_price_content = `min_price=${Number(min_price.value)}`;
  let max_price_content = `max_price=${Number(max_price.value)}`;
  if (min_price.value) {
    search_fields.push(min_price_content);
  }
  if (max_price.value) {
    search_fields.push(max_price_content);
  }
  let min_size_content = `min_size=${Number(min_size.value)}`;
  let max_size_content = `max_size=${Number(max_size.value)}`;
  if (min_size.value) {
    search_fields.push(min_size_content);
  }
  if (max_size.value) {
    search_fields.push(max_size_content);
  }
  let end_point = "";
  material.forEach((type) => {
    let material_type = type.nextElementSibling;
    let content = material_type.textContent.trim().toLowerCase();
    material_content = `material=${content}`;
    if (type.checked) {
      search_fields.push(material_content);
    }
  });
  for (let item of search_fields) {
    end_point += item + "&";
  }
  let final_end_point = end_point.substring(0, end_point.length - 1);
  apiProcessor(
    `http://127.0.0.1:8000/item_search/?${final_end_point}&page_size=`,
    '',
    true
  );
  end_point = "";
  search_fields = [];
  min_price.value = "";
  max_price.value = "";
  category_checkbox.forEach((item) => (item.checked = false));
  material.forEach((item) => (item.checked = false));
});

function checkCategory(georgian_text) {
  if (georgian_text == "საყურე") {
    return "earring";
  } else if (georgian_text == "სამაჯური") {
    return "bracelet";
  } else if (georgian_text == "ყელსაბამი") {
    return "necklace";
  } else if (georgian_text == "ბეჭედი") {
    return "ring";
  }
}

function createPage() {
  let chunkedArray = chunkArray(item, 4);
  pagination.innerHTML = "";
  createSlide(chunkedArray[0]);
  for (let i = 1; i < Math.ceil(item[0]["results"].length / 4); i++) {
    const li = document.createElement("li");
    li.innerHTML = `<li onclick="createSlideTest(${chunkedArray[i - 1]})" class="page-number">${i}</li>`;
    pagination.appendChild(li);
  }
}

go.addEventListener("click", function () {
  if (item.length == 0) {
    pagination.innerHTML = "";
    apiProcessor(
      `http://127.0.0.1:8000/all_items/?page_size=${page_size.value}`,
      page_size.value,
      false
    );
  } else if (item.length > 0 && !page_size.value) {
    createSlide(item[0]);
  } else {
    let item_arr = item[0]["results"];
    let chunkedArray = chunkArray(item_arr, Number(page_size.value));
    pagination.innerHTML = "";
    createSlide(chunkedArray[0]);
    for (
      let i = 1;
      i <= Math.ceil(item_arr.length / Number(page_size.value));
      i++
    ) {
      const li = document.createElement("li");
      li.innerHTML = `${i}`;
      li.addEventListener("click", () => {
        createSlide(chunkedArray[i - 1]);
      });
      li.style.cursor = "pointer";
      li.style.color = "rgb(3, 3, 96)";
      pagination.appendChild(li);
    }
  }
});

function chunkArray(arr, chunkSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
}

apiProcessor(`http://127.0.0.1:8000/all_items/?page_size=8`, 8, false);

const special_cross = document.querySelector(".special-cross");

