var RECIPE_BASE_API_URL = "https://api.edamam.com/api/";
var RECIPE_API_ID = "73024dfd";
var RECIPE_API_KEY = "0f3ec99c5316290dd1c55ca13fd54d91";
var button = document.querySelector("#search");
var add = document.querySelector("#add-submit");
var ingredients = document.querySelector("#search-input");
var results = document.querySelector(".results");
var ingredientsArray = [];
var ingredientsList = document.querySelector("#ingredients-list");
var mealType = document.querySelector("#mealType");
var cuisineType = document.querySelector("#cuisineType");
var health = document.querySelector("#health");
//local storage key index
var keyIndex = 0;
var nextButton;

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
  //get idx attribute as an integer
  var index = parseInt(btn.getAttribute("idx"), 10);
  //delete item by item with splice
  ingredientsArray.splice(index, 1);
  //display the current list after deleting item
  ingredientsList.innerHTML = ingredientsArray
    .map((ingredient, i) => {
      return `<li idx="${i}">${ingredient}</li>`;
    })
    //delete coma from array;
    .join("");
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
  var apiURL = `${RECIPE_BASE_API_URL}recipes/v2?type=public&q=${search}&app_id=${RECIPE_API_ID}&app_key=${RECIPE_API_KEY}`;
  //increase key index
  keyIndex++;
  //save api url in local storage witha index of 1
  localStorage.setItem(keyIndex, JSON.stringify(apiURL));
  //if mealtype input has been selected then concatenate mealtype value to api call
  if (mealType.value !== "") {
    apiURL += `&mealType=${mealType.value}`;
    //if cuisineType input has been selected then concatenate cuisineType value to api call
  }
  if (cuisineType.value !== "") {
    apiURL += `&cuisineType=${cuisineType.value}`;
    //if health input has been selected then concatenate health value to api call
  }
  if (health.value !== "") {
    apiURL += `&health=${health.value}`;
  }
  //deal with cors
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  console.log(apiURL);
  //call API
  fetch(apiURL, requestOptions)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          //clear the
          results.innerHTML = "";
          renderResults(data);
        });
      }
    })
    .then((results) => console.log(results))
    .catch((error) => console.log("error", error));
};

var loadPage = function (element) {
  console.log(element);
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  fetch(element, requestOptions)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          results.innerHTML = "";
          renderResults(data);
          console.log(data);
          //previous button will only be crated if key index is greater than 1
          if (keyIndex > 1) {
            //create previous button
            prevButton = document.createElement("div");
            prevButton.innerHTML = "prev";
            prevButton.addEventListener("click", function () {
              //get previous url from local storage and save it in variable
              var prevLink = JSON.parse(localStorage.getItem(keyIndex - 1));
              console.log(prevLink);
              //call previous set of results
              loadPage(prevLink);
              //decrease key index if prev button is clicked
              keyIndex--;
            });
            //append previous button to results container
            results.appendChild(prevButton);
          }
        });
      }
    })
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};

var renderResults = function (element) {
  window.scrollTo(0, 0);
  var recipeArray;
  var recipes = element.hits;
  for (var i = 0; i < recipes.length; i++) {
    var container = document.createElement("div");
    recipeArray = recipes[i].recipe.ingredientLines;
    var recipeList = "<ul>";
    recipeArray.forEach((element) => {
      recipeList += "<li>" + element + "</li>";
    });
    recipeList += "</ul>";
    container.innerHTML = `
        <div class="recipeCard">
          <div class="header">
            <img id="food" src="${recipes[i].recipe.images.SMALL.url}"></img>
          </div>
          <div class="text">
            <h2 class="food">${recipes[i].recipe.label}</h2>
            <i class="fa fa-users">Serves: ${recipes[i].recipe.yield}</i>
            <i class="fa fa-heart" href="${
              recipes[i]._links.self.href
            }"onclick="saveRecipe"></i>
            <p>Meal Type: ${recipes[i].recipe.mealType[0]}</p> 
            <p>Calories per serving: ${Math.round(
              recipes[i].recipe.calories / recipes[i].recipe.yield
            )}Kcal</p> 
            <p>Cuisine Type: ${recipes[i].recipe.cuisineType[0]}</p>
            ${recipeList}
          </div>
        </div>
    `;
    results.appendChild(container);
  }
  //API next page link
  var nextURL = element._links.next.href;
  //create API next page button
  nextButton = document.createElement("div");
  nextButton.innerHTML = "Next";
  //cal API's next page
  nextButton.addEventListener("click", function () {
    loadPage(nextURL);
    //increase key index if next button is clicked
    keyIndex++;
    //save url in local storage with keyindex
    localStorage.setItem(keyIndex, JSON.stringify(nextURL));
  });

  //apend API's next page to results container
  results.appendChild(nextButton);
};

button.addEventListener("click", formSubitHandler);
add.addEventListener("click", addIngredients);
