//BUDGET CONTROLLER
var BudgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var BudgetTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (curr) {
      sum += curr.value;
    });
    data.total[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    total: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, desc, val) {
      var newItem, ID;

      //creating new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on 'inc' or 'exp'
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }

      //push data to data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var IDs, index;

      IDs = data.allItems[type].map(function (curr) {
        return curr.id;
      });

      index = IDs.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (curr) {
        curr.calcPercentage(data.total.inc);
      });
    },

    getPercentages: function () {
      var allPer = data.allItems.exp.map(function (curr) {
        return curr.getPercentage();
      });
      return allPer;
    },

    calculateBudget: function () {
      //calculate total income and expenses
      BudgetTotal("exp");
      BudgetTotal("inc");

      //calculate the budget: income-expenses
      data.budget = data.total.inc - data.total.exp;

      // calculate the percentage of income that we spent
      if (data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalIncome: data.total.inc,
        totalExpenses: data.total.exp,
        percentage: data.percentage,
      };
    },

    //just for testing purpose of retrieving all data.
    testing: function () {
      return data;
    },
  };
})();

//UI CONTROLLER
var UIController = (function () {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensePercLabel: ".item__percentage",
    monthLabel: ".budget__title--month",
  };
  var nodelistForEach = function (list, callbackFunc) {
    for (var i = 0; i < list.length; i++) {
      callbackFunc(list[i], i);
    }
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;

      //create new html string with some placeholder text
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", this.formatNumber(obj.value, type));

      //insert html in DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMStrings.inputDescription + "," + DOMStrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (currentValue, index, inputArray) {
        currentValue.value = "";
      });
      //get out pointer back to add description input field
      fieldsArr[0].focus();
    },

    //it can be public as shown below. or private as... var formantNumber = function(num,type){...}
    formatNumber: function (num, type) {
      var numSplit, int, dec, type;
      num = Math.abs(num);
      num = num.toFixed(2);

      numSplit = num.split(".");
      int = numSplit[0];
      //2345
      if (int.length > 3) {
        int =
          int.substr(0, int.length - 3) +
          "," +
          int.substr(int.length - 3, int.length);
      }
      dec = numSplit[1];
      return (type === "exp" ? "-" : "+") + " " + "₹" + " " + int + "." + dec;
    },

    displayMonth: function () {
      var now, months, month, year;

      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();
      //console.log(now);
      document.querySelector(DOMStrings.monthLabel).textContent =
        months[month] + " " + year;
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensePercLabel);

      // nodelistForEach is declared private so that we can use it in other functions too.
      // var nodelistForEach = function (list, callbackFunc) {
      //   for (var i = 0; i < list.length; i++) {
      //     callbackFunc(list[i], i);
      //   }
      // };

      nodelistForEach(fields, function (curr, index) {
        if (percentages[index] > 0) {
          curr.textContent = percentages[index] + "%";
        } else {
          curr.textContent = "---";
        }
      });
    },

    displayBudget: function (obj) {
      document.querySelector(
        DOMStrings.budgetLabel
      ).textContent = this.formatNumber(
        obj.budget,
        obj.budget > 0 ? "inc" : "exp"
      );
      document.querySelector(
        DOMStrings.incomeLabel
      ).textContent = this.formatNumber(obj.totalIncome, "inc");
      document.querySelector(
        DOMStrings.expenseLabel
      ).textContent = this.formatNumber(obj.totalExpenses, "exp");

      if (obj.budget > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );

      nodelistForEach(fields, function (curr) {
        curr.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    },

    getDOMStrings: function () {
      return DOMStrings;
    },
  };
})();

//GLOBAL APP CONTROLLER
var Controller = (function (BudgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    //event delegation process initiated here
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function () {
    //1. Calculate the budget.
    BudgetCtrl.calculateBudget();

    //2. Return the budget
    var budget = BudgetCtrl.getBudget();

    //3. Display Budget on UI.
    //console.log(budget);
    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function () {
    //1. Calculate percentages
    BudgetCtrl.calculatePercentages();

    //2. Read percentages from Budget controller
    var percentages = BudgetCtrl.getPercentages();

    //3. Update UI with new percentages
    //console.log(percentages);

    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    var input, newItem;

    //1. Get field input data.
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add item to budget controller
      newItem = BudgetCtrl.addItem(input.type, input.description, input.value);
      //console.log(newItem);

      //3. Add item to UI controller
      UICtrl.addListItem(newItem, input.type);

      //4.clear the input fields
      UICtrl.clearFields();

      //5. Calculate and update budget
      updateBudget();

      //6. Update percentages
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemId, splitId, type, ID;

    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    //console.log(itemId);
    if (itemId) {
      // split the id part from itemId
      splitId = itemId.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);
      //console.log(type, ID);

      //1. delete item from data structure
      BudgetCtrl.deleteItem(type, ID);

      //2. delete item from the UI.
      UICtrl.deleteListItem(itemId);

      //3. update and show new budget
      updateBudget();

      //4. update percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started...");
      UICtrl.displayMonth();

      //to reset the values on UI
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: 0,
      });
      setupEventListeners();
    },
  };
})(BudgetController, UIController);

Controller.init();
