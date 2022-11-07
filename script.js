var RECIPE_BASE_API_URL = "https://api.edamam.com/api/";
var RECIPE_API_ID = "73024dfd";
var RECIPE_API_KEY = "0f3ec99c5316290dd1c55ca13fd54d91";
var button = document.querySelector("#button-submit");
var add = document.querySelector("#add-submit");
var ingredients = document.querySelector("#search-input");
var results = document.querySelector("#results");
var ingredientsArray = [];
var ingredientsList = document.querySelector("#ingredients-list");
var mealType = document.querySelector("#mealType");
var cuisineType = document.querySelector("#cuisineType");
var health = document.querySelector("#health");

var addIngredients = function (event) {
  event.preventDefault();
  //store ingredients search value in variable
  var ingredient = ingredients.value;
  //if ingredient already exists
  if (ingredientsArray.includes(ingredient)) {
    //warn user
    alert("Ingredient already exists");
    //if ingredient doesnt exist
  } else {
    //push ingredient to array
    ingredientsArray.push(ingredient);
    ingredientsArray.toString();
    console.log(ingredientsArray);
    //create list of items a deduct 1 from the lenght to set index "idx"
    ingredientsList.innerHTML += `<li idx="${
      ingredientsArray.length - 1
    }">${ingredient}</li>`;
  }
  //clear input value
  ingredients.value = "";
};

var deleteIngredient = function (event) {
  //detect click on list item
  var btn = event.target;
  //get index as an integer
  var index = parseInt(btn.parentElement.getAttribute("idx"), 10);
  //delete item by item with splice
  ingredientsArray.splice(index, 1);
  //display the current list after deleting item
  ingredientsList.innerHTML = ingredientsArray
    .map((ingredient, i) => {
      return `<li idx="${i}">${ingredient}</li>`;
    })
    //delete coma from array
    .join(" ");
};

ingredientsList.addEventListener("click", deleteIngredient);

var formSubitHandler = function (event) {
  event.preventDefault();
  //coonvert array into string
  var search = ingredientsArray.toString();

  //if string exists call function
  if (search) {
    searchRecipe(search);
  } else {
    alert("Select and ingredient");
  }
};

var searchRecipe = function (search) {
  console.log(search);
  var apiURL = `${RECIPE_BASE_API_URL}recipes/v2?type=public&q=${search}&app_id=${RECIPE_API_ID}&app_key=${RECIPE_API_KEY}`;
  if (mealType.value !== "") {
    apiURL += `&mealType=${mealType.value}`;
  }
  if (cuisineType.value !== "") {
    apiURL += `&cuisineType=${cuisineType.value}`;
  }
  if (health.value !== "") {
    apiURL += `&health=${health.value}`;
  }
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  console.log(apiURL);

  fetch(apiURL, requestOptions)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          results.innerHTML = "";
          renderResults(data);
        });
      }
    })
    .then((results) => console.log(results))
    .catch((error) => console.log("error", error));
};

var nextPage = function (element) {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  fetch(element, requestOptions)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          console.log(data);
          results.innerHTML = "";
          renderResults(data);
        });
      }
    })
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};

var renderResults = function (element) {
  window.scrollTo(0, 0);
  var caloriesValue = 1000;
  var recipeArray;
  var recipes = element.hits;
  for (var i = 0; i < recipes.length; i++) {
    var container = document.createElement("div");
    recipeArray = recipes[i].recipe.ingredientLines;
    var recipeList = "<ul>";
    recipeArray.forEach((element) => {
      recipeList += "<li>" + element + "</li>";
    });
    if (caloriesValue) {
      recipes.map((item) => {
        console.log(item.calories <= caloriesValue);
      });
    }
    recipeList += "</ul>";
    container.innerHTML = `
        <img id="food" src="${recipes[i].recipe.images.SMALL.url}"></img>
        <ul>
        <li>${recipes[i].recipe.mealType[0]}</li>
        <li>${recipes[i].recipe.label}</li>
        <li>${Math.round(
          recipes[i].recipe.calories / recipes[i].recipe.yield
        )}Kcal</li>
        <li>${recipes[i].recipe.cuisineType[0]}</li>
        ${recipeList}
        </ul>
    `;
    results.appendChild(container);
  }
  var nextURL = element._links.next.href;
  var nextButton = document.createElement("div");
  nextButton.innerHTML = "Next";
  nextButton.addEventListener("click", function () {
    nextPage(nextURL);
  });
  results.appendChild(nextButton);
};

button.addEventListener("click", formSubitHandler);
add.addEventListener("click", addIngredients);
