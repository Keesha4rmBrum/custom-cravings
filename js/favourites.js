var favourite = JSON.parse(localStorage.getItem("favourite") || []);
var favouriteContainer = document.getElementById("favourites");
var results = document.getElementById("recipe-result");
var renderFavourite = function () {
  //clear container for new recipe
  favouriteContainer.innerHTML = "";
  for (i = 0; i < favourite.length; i++) {
    //create card
    var card = document.createElement("div");
    card.classList.add("favourites-card");
    var cardBody = document.createElement("div");
    cardBody.classList.add("favourites-card-body");
    cardBody.style.cssText = "position:relative;";
    cardBody.addEventListener("click", loadRecipe);
    //insert recipe link into element
    cardBody.setAttribute("href", favourite[i].link);
    //populate card
    cardBody.innerHTML = `
        <img id="recipe-image" src="${favourite[i].image}"/>
        <span>${favourite[i].name}</span>
    `;
    card.appendChild(cardBody);
    favouriteContainer.appendChild(card);
    var icon = document.createElement("div");
    icon.classList.add("favourites-icon");
    icon.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    icon.addEventListener("click", removeRecipe);
    card.appendChild(icon);
  }
};

function removeRecipe(e) {
  //get recipe name
  var recipeName =
    e.target.parentElement.parentElement.children[0].children[1].innerHTML;
  //find the recipename in the array
  var recipeExists = favourite.find((search) => search.name == recipeName);
  //remove the item from the array
  favourite.splice(favourite.indexOf(recipeExists), 1);
  //replace the array in local storage without the removed element
  localStorage.setItem("favourite", JSON.stringify(favourite));
  //render the favourites again without the removed element
  renderFavourite();
}

var loadRecipe = function (e) {
  results.innerHTML = "";
  results.style.display = "block";
  var recipeLink = e.target.parentElement.getAttribute("href");
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  fetch(recipeLink, requestOptions).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        //initiate array
        var recipeArray = [];
        recipeArray = data.recipe.ingredientLines;
        var recipeList = "<ul>";
        recipeArray.forEach((element) => {
          recipeList += "<li>" + element + "</li>";
        });
        recipeList += "</ul>";
        results.innerHTML = `  
        <div class="recipe-result-card" href="${data._links.self.href}">
         <span onclick="closeModal()" class="close">&times;</span>
          <img class="result-img" id="food" src="${
            data.recipe.images.SMALL.url
          }"></img>
          <div class="result-body">
            <h2 class="result-header">${data.recipe.label}</h2>
            <i class="fa fa-users">Serves: ${data.recipe.yield}</i>
            <span class="type-h"><b>Meal Type</b>: ${
              data.recipe.mealType[0]
            }</span> 
            <span class="type-h"><b>Calories per serving:</b> ${Math.round(
              data.recipe.calories / data.recipe.yield
            )}Kcal</span> 
            <span class="type-h"><b>Cuisine Type:</b> ${
              data.recipe.cuisineType[0]
            }</span>
            <span class="type-h"><b>Ingredients:</b></span>
            ${recipeList}
          </div>
        </div>
    `;
      });
    }
  });
};

window.onclick = function (event) {
  if (event.target == results) {
    console.log(event.target);
    results.style.display = "none";
  }
};

var closeModal = function (e) {
  results.style.display = "none";
};

renderFavourite();
