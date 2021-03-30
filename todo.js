let latestTodoId = 0
class Todo {
    constructor(name, state, id) {
        this.name = name;
        this.state = state;
        this.id = id ? id : ++latestTodoId;
    }
}

function loadTodosFromLocalStorage(){
    const loaded_todos = JSON.parse( localStorage.getItem("todos") )
    const todos_by_id = {}
    const new_todos_by_state = {
        "active": [],
        "inactive": [],
        "done": [],
        "all": []
    }

    if (loaded_todos === null){
        return new_todos_by_state
    }
    
    loaded_todos.all.forEach(function(todo) { 
        todos_by_id[todo.id] = new Todo(todo.name, todo.state, todo.id)
        new_todos_by_state.all.push(todos_by_id[todo.id])

        latestTodoId = Math.max(latestTodoId, todo.id)
    })
    
    loaded_todos.active.forEach(function(todo) { 
        new_todos_by_state.active.push(todos_by_id[todo.id])
    })
    
    loaded_todos.inactive.forEach(function(todo) { 
        new_todos_by_state.inactive.push(todos_by_id[todo.id])
    })
    
    loaded_todos.done.forEach(function(todo) { 
        new_todos_by_state.done.push(todos_by_id[todo.id])
    })

    return  new_todos_by_state
}

function saveTodos(new_todos){
    localStorage.setItem("todos", JSON.stringify(new_todos))
}

const todosByState = loadTodosFromLocalStorage()

function addTodo(todo){
    todosByState[todo.state].push(todo)
    todosByState.all.push(todo)
    saveTodos(todosByState)
}

 function removeTodo(todo){
     todosByState[todo.state].splice(todosByState[todo.state].indexOf(todo), 1 )
     todosByState.all.splice(todosByState.all.indexOf(todo), 1 )
     saveTodos(todosByState)
 }


function changeTodoItemState(newState, todo){
    var currentState = todo.state
    todo.state = newState
    todosByState[newState].push(todo)
    todosByState[currentState].splice(todosByState[currentState].indexOf(todo), 1 )
    saveTodos(todosByState)
}

function swapItems(index1, index2, currentState){
    var temp = todosByState[currentState][index1]
    todosByState[currentState][index1] = todosByState[currentState][index2]
    todosByState[currentState][index2] = temp
    saveTodos(todosByState)
}

const states = ["active", "inactive", "done"];
const tabs = ["all"].concat(states);
let currentTab = "all";

const form = document.getElementById("new-todo-form");
const input = document.getElementById("new-todo-title");

form.onsubmit = function(event) {
    event.preventDefault();
    if (input.value && input.value.length) {
        addTodo(new Todo(input.value, "active"));
        input.value = "";
        renderTodos();
    }
};

const todoItemActions = [
    {
      title: "Mark as done",
      icon: "ok",
      onClick: (todo, currentState, callback = () => null) => {
        changeTodoItemState("done", todo);
        callback();
      },
      checkIsDisabled: (todo, currentState) => todo.state === "done",
    },
    {
      title: "Mark as active",
      icon: "plus",
      onClick: (todo, currentState, callback = () => null) => {
        changeTodoItemState("active", todo);
        callback();
      },
      checkIsDisabled: (todo, currentState) => todo.state === "active",
    },
    {
      title: "Mark as inactive",
      icon: "minus",
      onClick: (todo, currentState, callback = () => null) => {
        changeTodoItemState("inactive", todo);
        callback();
      },
      checkIsDisabled: (todo, currentState) => todo.state === "inactive",
    },
    {
      title: "Move down",
      icon: "chevron-down",
      onClick: (todo, currentState, callback = () => null) => {
        const currentIndex = todosByState[currentState].indexOf(todo);
        swapItems(currentIndex, currentIndex + 1, currentState);
        callback();
      },
      checkIsDisabled: (todo, currentState) => {
        const currentIndex = todosByState[currentState].indexOf(todo);
        return currentIndex === todosByState[currentState].length - 1;
      },
    },
    {
      title: "Move up",
      icon: "chevron-up",
      onClick: (todo, currentState, callback = () => null) => {
        const currentIndex = todosByState[currentState].indexOf(todo);
        swapItems(currentIndex, currentIndex - 1, currentState);
        callback();
      },
      checkIsDisabled: (todo, currentState) => {
        const currentIndex = todosByState[currentState].indexOf(todo);
        return currentIndex === 0;
      },
    },
    {
      title: "Remove",
      icon: "trash",
      onClick: (todo, currentState, callback = () => null) => {
        const confirmRemove = confirm(
          "Are you sure you want to delete the item titled " + todo.name
        );
        if (confirmRemove) {
            removeTodo(todo);
            callback();
        }
      },
    },
  ];

  
function addItemsNumber(){
    let all_tab = document.querySelector("a  span.badge.all")
    all_tab.textContent = todosByState["all"].length

    let active_tab = document.querySelector("a  span.badge.active")
    active_tab.textContent = todosByState["active"].length

    let inactive_tab = document.querySelector("a  span.badge.inactive")
    inactive_tab.textContent = todosByState["inactive"].length

    let done_tab = document.querySelector("a  span.badge.done")
    done_tab.textContent = todosByState["done"].length
}

const createElement = (type, attributes, events, parent) => {
    const ignoreAttributes = ['textContainer']
    const booelanAttributes = ['disabled']
    const el = document.createElement(type)

    Object.entries(attributes).forEach(([key, value]) => {
        if (ignoreAttributes.includes(key)) {
            return;
        }
    
        const attr = document.createAttribute(key)
        if (!booelanAttributes.includes(key)) {
            attr.value = value
            el.setAttributeNode(attr)  
        } else if(value) {
            el.setAttributeNode(attr)  
        }
    })

    Object.entries(events).forEach(([key, value]) => {
       el[key] = value
    })

    if (attributes.textContent) {
        const text = document.createTextNode(attributes.textContent);
        el.appendChild(text)
    }

    if (parent) {
        parent.appendChild(el)
    }

    return el
}

function renderTodos() {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = "";
    
    const todos = todosByState[currentTab]
    todos.forEach(function(todo, index) {
        const row = createElement('div', {
            class: 'row'
        }, {},  todoList);

        const todoContainer = createElement('div', {
            class: 'col-xs-6 col-sm-9 col-md-10'
        }, {}, row);

        const todoLink = createElement('a', {
            class: 'list-group-item',
            href: '#',
            textContent: todo.name
        },  {}, todoContainer)

        const buttonsContainer = createElement('div', {
            class: 'col-xs-6 col-sm-3 col-md-2 btn-group text-right'
        }, {}, row);
        
        todoItemActions.forEach(function(button) {
            const btn = createElement('button', {
                class: 'btn btn-default btn-xs',
                title: button.title,
                disabled: button.checkIsDisabled ? button.checkIsDisabled(todo, currentTab) : false,
            }, {
                onclick: () => button.onClick(todo, currentTab, renderTodos)
            }, buttonsContainer);
            
            const icon = createElement('i', {
                class: `glyphicon glyphicon-${button.icon}`
            }, {}, btn);
        });
        
    });

    addItemsNumber()
}

renderTodos();

function selectTab(element) {
    currentTab = element.attributes["data-tab-name"].value;
    var todoTabs = document.getElementsByClassName("todo-tab");
    for (var i = 0; i < todoTabs.length; i++) {
        todoTabs[i].classList.remove("active");
    }
    element.classList.add("active");
    renderTodos();
}