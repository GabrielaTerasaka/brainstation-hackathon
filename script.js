// Fill the Radio Inputs with Categories from API
axios
  .get(`https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list`)
  .then((result) => {
    const categoryWrapper = document.querySelector(".form__category-wrapper");
    result.data.drinks.forEach((category) => {
      const label = document.createElement("span");
      label.classList.add("form__label-category");
      label.innerText = category.strCategory;
      categoryWrapper.append(label);

      const radio = document.createElement("input");
      radio.setAttribute("type", "radio");
      radio.setAttribute("name", "category");
      radio.setAttribute("value", category.strCategory);
      label.prepend(radio);
    });
  })
  .catch((error) => {
    console.log(error);
  });

// Event Listener - Forms Submit: search if there is any drink that matches the seearch
const form = document.querySelector(".body__form");
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const drinkName = e.target.drinkName.value;
  const category = e.target.category.value;
  const alcoholic = e.target.alcoholic.value;

  const cardWrapper = document.querySelector(".body__cards-wrapper");
  cardWrapper.innerHTML = "";
  cardWrapper.classList.remove("body__title");

  // Guard: check if there is at least 1 option selected
  if (!alcoholic && !category && !drinkName) {
    cardWrapper.innerText = "Choose at least 1 of the options above !!!";
    cardWrapper.classList.add("body__title");
    return;

    // if a drink name has been entered
  } else if (drinkName) {
    axios
      .get(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkName}`
      )
      .then((result) => {
        let drinksArr = result.data.drinks;

        if (drinksArr && category) {
          drinksArr = drinksArr.filter(
            (drink) => drink.strCategory === category
          );
        }

        if (drinksArr && alcoholic) {
          const newAlcoholic =
            alcoholic.replace("_", " ").toUpperCase()[0] +
            alcoholic.replace("_", " ").toLowerCase().slice(1);
          drinksArr = drinksArr.filter(
            (drink) => drink.strAlcoholic === newAlcoholic
          );
        }

        if (drinksArr === null || drinksArr.length === 0) {
          cardWrapper.innerHTML = "";

          cardWrapper.innerText = "Drink NOT FOUND\n Try again!";
          cardWrapper.classList.add("body__title");
          form.reset();
          return;
        }

        drinksArr.forEach((drink) => {
          displayCard(drink);
        });
        form.reset();

        return;
      })
      .catch((error) => {
        console.log(error);
      });

    // if there is a category selected when there is no drink name
  } else if (category) {
    const newCategory = category.replace(" ", "_");
    axios
      .get(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=${newCategory}`
      )
      .then((result) => {
        let drinksArr = result.data.drinks;

        if (drinksArr === null || drinksArr.length === 0 || alcoholic) {
          cardWrapper.innerHTML = "";

          cardWrapper.innerText =
            "Choose either Category or Alcoholic\n Try again!";

          cardWrapper.classList.add("body__title");
          form.reset();
          return;
        }

        drinksArr.forEach((drink) => {
          drink.strCategory = newCategory.replace("_", " ");
          displayCard(drink);
        });
        form.reset();

        return;
      })
      .catch((error) => {
        console.log(error);
      });

    // if there is an alcoholic option but none of the two other options (drink name and category) has been selected
  } else if (alcoholic) {
    axios
      .get(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${alcoholic}`
      )
      .then((result) => {
        let drinksArr = result.data.drinks;

        if (drinksArr === null || drinksArr.length === 0) {
          cardWrapper.innerHTML = "";

          cardWrapper.innerText =
            "Choose either Category or Alcoholic\n Try again!";

          cardWrapper.classList.add("body__title");
          form.reset();
          return;
        }

        drinksArr.forEach((drink) => {
          const newAlcoholic = alcoholic.replace("_", " ");
          drink.strAlcoholic = newAlcoholic;
          displayCard(drink);
        });
        form.reset();

        return;
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

// function to create a new card for each individual drink
function displayCard(cardObj) {
  const cardsWrapper = document.querySelector(".body__cards-wrapper");

  const card = document.createElement("article");
  card.classList.add("card");
  cardsWrapper.append(card);

  const image = document.createElement("img");
  image.setAttribute("src", cardObj.strDrinkThumb);
  image.setAttribute("alt", cardObj.strDrink);
  image.classList.add("card__image");
  card.append(image);

  const cardTitle = document.createElement("h3");
  cardTitle.innerText = cardObj.strDrink;
  cardTitle.classList.add("card__title");
  card.append(cardTitle);

  if (cardObj.strCategory) {
    const category = document.createElement("p");
    category.innerText = cardObj.strCategory;
    category.classList.add("card__category");
    card.append(category);
  }

  if (cardObj.strAlcoholic) {
    const alcoholic = document.createElement("p");
    alcoholic.innerText = cardObj.strAlcoholic;
    alcoholic.classList.add("card__alcoholic");
    card.append(alcoholic);
  }

  // Event Listener: display modal that contains the ingredients and instructions to prepare the selected drink card
  card.addEventListener("click", (e) => {
    console.log(cardObj.idDrink);

    axios
      .get(
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cardObj.idDrink}`
      )
      .then((result) => {
        console.log(result.data.drinks);
        const modalElem = document.querySelector(".modal");
        modalElem.classList.remove("modal__hidden");
        const modalTitle = document.querySelector(".modal__title");
        modalTitle.innerText = result.data.drinks[0].strDrink;
        const modalContent = document.querySelector(".modal__content");
        modalContent.innerText = result.data.drinks[0].strInstructions;

        const modalBox = document.querySelector(".modal__box");
        modalBox.style.top = `${window.pageYOffset + 20}px`;

        const modalIngredients = document.querySelector(".modal__ingredients");
        modalIngredients.innerHTML = "";
        for (let i = 1; i <= 15; i++) {
          if (
            result.data.drinks[0][`strMeasure${i}`] === null ||
            result.data.drinks[0][`strMeasure${i}`] === ""
          )
            break;
          const liElem = document.createElement("li");
          liElem.classList.add("modal__ingredient");
          modalIngredients.append(liElem);
          liElem.innerText =
            result.data.drinks[0][`strMeasure${i}`] +
            " " +
            result.data.drinks[0][`strIngredient${i}`];
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

function addHiddenClass() {
  const modalElem = document.querySelector(".modal");
  modalElem.classList.add("modal__hidden");
}

// Event Listener: hide
const modalOverlay = document.querySelector(".modal__overlay");
modalOverlay.addEventListener("click", addHiddenClass);
const modalCloseIcon = document.querySelector(".modal__close-icon");
modalCloseIcon.addEventListener("click", addHiddenClass);
