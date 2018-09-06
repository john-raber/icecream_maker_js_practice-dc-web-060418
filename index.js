const ingredientUrl = "http://localhost:3000/ingredient";
const iceCreamUrl = "http://localhost:3000/ice_cream";
const iceCreamForm = document.querySelector("#iceCreamForm");
const iceCreamName = document.querySelector("#iceCreamName");
const iceCreamCheckboxes = document.querySelector("#iceCreamCheckboxes");
const iceCreamGrid = document.querySelector("#iceCreamGrid");
let allIngredients;

document.addEventListener("DOMContentLoaded", init);

function init() {
  getIngredients();
  addFormSubmitListener();
  getAllIceCream();
}

function addFormSubmitListener() {
  iceCreamForm.addEventListener("submit", e => {
    e.preventDefault();
    addNewIceCream();
    e.target.reset();
  });
}

function getIngredients() {
  fetch(ingredientUrl)
    .then(r => r.json())
    .then(json => {
      allIngredients = json;
      json.forEach(ingredient => renderIngredient(ingredient));
    });
}

function getAllIceCream() {
  fetch(iceCreamUrl)
    .then(r => r.json())
    .then(json =>
      json.forEach(iceCream => {
        renderNewIceCreamDiv(iceCream);
        renderIceCream(iceCream);
      })
    );
}

function editIceCream(event, id) {
  const data = grabDataForUpdate(event);

  fetch(`${iceCreamUrl}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })
    .then(r => r.json())
    .then(json => {
      const iceCreamDivElement = iceCreamGrid.querySelector(`#ice-cream-${id}`);
      iceCreamDivElement.innerHTML = "";
      renderIceCream(json);
    });
}

function deleteIceCream(id, event) {
  fetch(`${iceCreamUrl}/${id}`, {
    method: "DELETE"
  })
    .then(r => r.json())
    .then(json => event.path[2].remove());
}

function addNewIceCream() {
  const data = {
    name: iceCreamName.value,
    ingredients: []
  };

  iceCreamCheckboxes.querySelectorAll("input").forEach(cb => {
    if (cb.checked) {
      data.ingredients.push(cb.id.split("-")[1]);
    }
  });

  fetch(iceCreamUrl, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })
    .then(r => r.json())
    .then(iceCream => {
      renderNewIceCreamDiv(iceCream);
      renderIceCream(iceCream);
    });
}

function renderIngredient(ingredient) {
  const liElement = document.createElement("li");
  const checkboxElement = document.createElement("input");

  checkboxElement.type = "checkbox";
  checkboxElement.id = `ingredient-${ingredient.id}`;
  liElement.innerText = ingredient.name;

  liElement.appendChild(checkboxElement);
  iceCreamCheckboxes.appendChild(liElement);
}

function renderNewIceCreamDiv(iceCream) {
  const iceCreamDivElement = document.createElement("div");
  iceCreamDivElement.id = `ice-cream-${iceCream.id}`;
  iceCreamGrid.appendChild(iceCreamDivElement);
}

function renderIceCream(iceCream) {
  const iceCreamDivElement = iceCreamGrid.querySelector(
    `#ice-cream-${iceCream.id}`
  );
  const iceCreamNameElement = document.createElement("h3");
  const iceCreamImageElement = document.createElement("img");
  const iceCreamButtonDiv = document.createElement("div");
  const editButtonElement = document.createElement("button");
  const deleteButtonElement = document.createElement("button");
  const ingredientsTitle = document.createElement("h4");
  const ingredientsListElement = document.createElement("ul");

  iceCreamNameElement.innerText = iceCream.name;
  iceCreamImageElement.src = "./icecream.jpeg";
  editButtonElement.innerText = "Edit";
  editButtonElement.dataset.editIceCreamId = iceCream.id;
  addEditListener(editButtonElement);
  deleteButtonElement.innerText = "Delete";
  deleteButtonElement.dataset.deleteIceCreamId = iceCream.id;
  addDeleteListener(deleteButtonElement);
  ingredientsTitle.innerText = "Ingredients:";
  iceCream.ingredients.forEach(i => {
    const ingredientLiElement = createIceCreamIngredient(i);
    ingredientsListElement.appendChild(ingredientLiElement);
  });

  iceCreamDivElement.appendChild(iceCreamNameElement);
  iceCreamDivElement.appendChild(iceCreamImageElement);
  iceCreamDivElement.appendChild(iceCreamButtonDiv);
  iceCreamDivElement.appendChild(iceCreamButtonDiv);
  iceCreamButtonDiv.appendChild(editButtonElement);
  iceCreamButtonDiv.appendChild(deleteButtonElement);
  iceCreamDivElement.appendChild(ingredientsTitle);
  iceCreamDivElement.appendChild(ingredientsListElement);
}

function renderEditForm(id) {
  const iceCreamDivElement = iceCreamGrid.querySelector(`#ice-cream-${id}`);
  const iceCreamName = iceCreamDivElement.querySelector("h3").innerText;
  const iceCreamIngredients = Array.from(
    iceCreamDivElement.querySelectorAll("li")
  ).map(ing => {
    return Number(ing.dataset.ingredientId);
  });

  iceCreamDivElement.innerHTML = "";

  const editForm = document.createElement("form");
  const iceCreamNameDiv = document.createElement("div");
  const iceCreamNameInput = document.createElement("input");
  const iceCreamImageDiv = document.createElement("div");
  const iceCreamImageElement = document.createElement("img");
  const buttonDiv = document.createElement("div");
  const submitButton = document.createElement("button");
  const ingredientsTitle = document.createElement("h4");
  const ingredientsListElement = document.createElement("ul");

  allIngredients.forEach(i => {
    const ingredientCb = createEditFormIngredient(i);
    ingredientCb.dataset.ingredientId = i.id;
    ingredientsListElement.appendChild(ingredientCb);
  });

  const ingredientIds = allIngredients.map(ing => {
    return ing.id;
  });

  ingredientsListElement.querySelectorAll("li").forEach(li => {
    if (iceCreamIngredients.includes(Number(li.dataset.ingredientId))) {
      li.querySelector("input").checked = true;
    }
  });

  editForm.dataset.formIceCreamId = id;
  iceCreamNameInput.value = iceCreamName;
  iceCreamNameInput.type = "text";
  iceCreamImageElement.src = "./icecream.jpeg";
  submitButton.innerText = "Submit";
  ingredientsTitle.innerText = "Ingredients";

  editForm.addEventListener("submit", e => {
    e.preventDefault();
    editIceCream(e, e.target.dataset.formIceCreamId);
  });

  editForm.appendChild(iceCreamNameInput);
  editForm.appendChild(iceCreamImageDiv);
  iceCreamImageDiv.appendChild(iceCreamImageElement);
  editForm.appendChild(buttonDiv);
  buttonDiv.appendChild(submitButton);
  editForm.appendChild(ingredientsTitle);
  editForm.appendChild(ingredientsListElement);
  iceCreamDivElement.appendChild(editForm);
}

function createIceCreamIngredient(ingredientId) {
  const ingredientLiElement = document.createElement("li");
  ingredientLiElement.innerText = findIngredient(ingredientId).name;
  ingredientLiElement.dataset.ingredientId = ingredientId;
  return ingredientLiElement;
}

function createEditFormIngredient(ingredient) {
  const liElement = document.createElement("li");
  const checkboxInput = document.createElement("input");

  liElement.innerText = ingredient.name;
  checkboxInput.type = "checkbox";

  liElement.appendChild(checkboxInput);
  return liElement;
}

function findIngredient(id) {
  return allIngredients.find(ingredient => ingredient.id === Number(id));
}

function addDeleteListener(button) {
  button.addEventListener("click", e => {
    deleteIceCream(e.target.dataset.deleteIceCreamId, e);
  });
}

function addEditListener(button) {
  button.addEventListener("click", e => {
    renderEditForm(e.target.dataset.editIceCreamId);
  });
}

function grabDataForUpdate(e) {
  const data = {
    name: event.target.querySelector("input").value,
    ingredients: []
  };

  event.target.querySelectorAll("input").forEach(cb => {
    if (cb.checked) {
      data.ingredients.push(cb.parentElement.dataset.ingredientId);
    }
  });

  return data;
}
