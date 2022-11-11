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
var deleteUserSearch = document.querySelector("#delete-search");
//local storage key index
var keyIndex = 0;
var nextButton;
var alertUser = document.getElementById("alertUser");
var favouriteArray = JSON.parse(localStorage.getItem("favourite")) || [];
var anch = document.getElementById("favourites-page");

fetch("https://bootcamp-food-api.herokuapp.com/api/foods")
  .then((response) => response.json())
  .then((data) => loadFoodList(data))
  .catch((error) => console.log("error", error));
function loadFoodList(foods) {
  // Autocomplete widget
  $(function () {
    $("#search-input").autocomplete({
      source: foods,
    });
  });
}

anch.addEventListener("click", function () {
  results.innerHTML = "";
});

fetch("https://bootcamp-food-api.herokuapp.com/api/foods")
  .then((response) => response.json())
  .then((data) => loadFoodList(data))
  .catch((error) => console.log("error", error));

function loadFoodList(foods) {
  // Autocomplete widget
  $(function () {
    $("#search-input").autocomplete({
      source: foods,
    });
  });
}
var addIngredients = function (event) {
  event.preventDefault();
  //store ingredients search value in variable

  var ingredient = ingredients.value;
  //if ingredient already exists
  deleteUserSearch.innerHTML = `<i onclick="deleteSearch">Click Here to Clear Search</>`;
  if (ingredientsArray.includes(ingredient)) {
    //warn user if ingredient was already added
     alertUser.style.display = "block";
     alertUser.innerHTML = "Select Ingredient";
     setTimeout(function () {
       alertUser.style.display = "none";
       alertUser.innerHTML = "";
     }, 5000);
    //if ingredient doesnt exist
  } else {
    if (ingredient !== "") {
      //push ingredient to array
      ingredientsArray.push(ingredient);
      ingredientsArray.toString();
      //create list of items a deduct 1 from the lenght to set index "idx"
      ingredientsList.innerHTML += `<li idx="${
        ingredientsArray.length - 1
      }">${ingredient}</li>`;
    }
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
    alertUser.style.display = "block";
    alertUser.innerHTML = "Select Ingredient";
    setTimeout(function () {
      alertUser.style.display = "none";
      alertUser.innerHTML = "";
    }, 5000);
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
  //call API
  fetch(apiURL, requestOptions)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          //clear the results conatiner
          results.innerHTML = "";
          renderResults(data);
        });
      }
    })
    .then((results) => console.log(results))
    .catch((error) => console.log("error", error));
};

var loadPage = function (element) {
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
          //previous button will only be crated if key index is greater than 1
          if (keyIndex > 1) {
            //create previous button
            prevButton = document.createElement("div");
            prevButton.innerHTML = "prev";
            prevButton.addEventListener("click", function () {
              //get previous url from local storage and save it in variable
              var prevLink = JSON.parse(localStorage.getItem(keyIndex - 1));
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
  var recipeArray;
  //
  var recipes = element.hits;
  //iterate through each object returned by the API
  for (var i = 0; i < recipes.length; i++) {
    var container = document.createElement("div");
    //get recipe label to compare with favourites
    var recipeLabel = recipes[i].recipe.label;
    //find if any recipe rendered is in the favourites in the local storage
    var recipeFavourite = favouriteArray.find(
      (search) => search.name == recipeLabel
    );
    //create favourite icon
    var favouriteIcon = "<i";
    //if the recipe is in the favourites
    if (recipeFavourite) {
      //give it a colored "heart"
      favouriteIcon += ` class="fa-solid fa-heart"></i>`;
    } else {
      //if not give it a empty "heart"
      favouriteIcon += ` class="fa-regular fa-heart"></i>`;
    }
    //store every ingredient in an array
    recipeArray = recipes[i].recipe.ingredientLines;
    //create an unoredered list
    var recipeList = "<ul>";
    //for each element in the array add the element rendered to the unoredered list
    recipeArray.forEach((element) => {
      recipeList += "<li>" + element + "</li>";
    });
    recipeList += "</ul>";
    //populate the container
    container.innerHTML = `
        <div class="result-card" href="${recipes[i]._links.self.href}">
          <div>
            <img id="food" src="${recipes[i].recipe.images.SMALL.url}"></img>
          </div>
          <div class="text">
            <h2 class="result-header">${recipeLabel}</h2>
            <i class="fa fa-users">Serves: ${recipes[i].recipe.yield}</i>
            ${favouriteIcon}
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
  var nextURL = element._links.next?.href;
  if (nextURL !== undefined) {
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
  }
  //scroll into results container
  results.scrollIntoView();
};

var deleteSearch = function () {
  deleteUserSearch.innerHTML = "";
  ingredientsList.innerHTML = "";
  ingredientsArray = [];
};

results.addEventListener("click", function (e) {
  //coloured heart fontawesome icon
  var solidHert = "fa-solid fa-heart";
  //empty heart fontawesome icon
  var regularHeart = "fa-regular fa-heart";
  //target h2 and get recipe label
  var recipeName = e.target.parentElement.children[0].textContent;
  //target image and get src
  var recipeImage =
    e.target.parentElement.parentElement.children[0].children[0].currentSrc;
  //target recipeCard and get href
  var recipeLink = e.target.parentElement.parentElement.getAttribute("href");
  //check if the recipe already exists in the favouriteArray
  var recipeExists = favouriteArray.find((search) => search.name == recipeName);
  //if the icon has a empty heart
  if (e.target.className == regularHeart) {
    //change it to colored heart icon on click
    e.target.className = solidHert;
    //if the recipe exists in the array
    if (recipeExists) {
      //log already exists
      console.log("Already exists");
      //if the recipe does not exist
    } else {
      //create object with the following elements
      var favourite = {
        name: recipeName,
        link: recipeLink,
        value: solidHert,
        image: recipeImage,
        status: "favourite",
      };
      //push the object into the array
      favouriteArray.push(favourite);
      //save the array in local storage
      localStorage.setItem("favourite", JSON.stringify(favouriteArray));
    }
    //if the icon has a coloured heart
  } else if (e.target.className == solidHert) {
    //change it to empty heart icon on click
    e.target.className = regularHeart;
    //remove the element from the arrray
    favouriteArray.splice(favouriteArray.indexOf(recipeExists), 1);
    //replace the array in local storage without the removed element
    localStorage.setItem("favourite", JSON.stringify(favouriteArray));
  }
});

button.addEventListener("click", formSubitHandler);
add.addEventListener("click", addIngredients);
deleteUserSearch.addEventListener("click", deleteSearch);
