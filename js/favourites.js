var favourite = JSON.parse(localStorage.getItem("favourite") || []);
var favouriteContainer = document.getElementById("favourites");
var results = document.getElementById("results");

var renderFavourite = function () {
  //clear container for new recipe
  favouriteContainer.innerHTML = "";
  for (i = 0; i < favourite.length; i++) {
    //create card
    var card = document.createElement("div");
    var cardBody = document.createElement("div");
    cardBody.style.cssText = "position:relative;";
    cardBody.addEventListener("click", loadRecipe);
    //insert recipe link into card element
    cardBody.setAttribute("href", favourite[i].link);
    //populate card
    cardBody.innerHTML = `
        <img id="recipe-image" src="${favourite[i].image}"/>
        <p style="position:absolute; top: 10px; left: 10px; z-index: 2;">${favourite[i].name}</p>
    `;
    card.appendChild(cardBody);
    favouriteContainer.appendChild(card);
    var icon = document.createElement("div");
    icon.innerHTML = `<i class="fa-solid fa-trash" style="width: 100%; height:30px; background-color:red; text-align:center;"></i>`;
    icon.addEventListener("click", removeRecipe);
    card.appendChild(icon);
  }
};

function removeRecipe(e) {
  //get recipe name
  var recipeName = e.target.parentElement.parentElement.children[1].innerHTML;
  //find the recipename in the array
  var recipeExists = favourite.find((search) => search.name == recipeName);
  //remove the item from the array
  favourite.splice(favourite.indexOf(recipeExists), 1);
  //replace the array in local storage without the removed element
  localStorage.setItem("favourite", JSON.stringify(favourite));
  //rend the favourites again without the removed element
  renderFavourite();
}

var loadRecipe = function (e) {
  results.innerHTML = "";
  var recipeLink = e.target.parentElement.getAttribute("href");
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  fetch(recipeLink, requestOptions).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        var container = document.createElement("div");
        //initiate array
        var recipeArray = [];
        recipeArray = data.recipe.ingredientLines;
        var recipeList = "<ul>";
        recipeArray.forEach((element) => {
          recipeList += "<li>" + element + "</li>";
        });
        recipeList += "</ul>";
        container.innerHTML = `
        <div class="recipeCard">
          <div class="header">
            <img id="food" src="${
              data.recipe.images.SMALL.url
            }" style="width: 300px; height: 300px;"></img>
          </div>
          <div class="text">
            <h2 class="food">${data.recipe.label}</h2>
            <i class="fa fa-users">Serves: ${data.recipe.yield}</i>
            <p>Meal Type: ${data.recipe.mealType[0]}</p> 
            <p>Calories per serving: ${Math.round(
              data.recipe.calories / data.recipe.yield
            )}Kcal</p> 
            <p>Cuisine Type: ${data.recipe.cuisineType[0]}</p>
            ${recipeList}
          </div>
        </div>
    `;
        results.appendChild(container);
      });
    }
  });
};

renderFavourite();
