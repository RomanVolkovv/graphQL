import { useEffect, useState } from 'react';
import './app.css';

const App = () => {
  const [addTodoValue, setAddTodoValue] = useState('');
  const [findTodoValue, setFindTodoValue] = useState('');
  const [todosData, setTodosData] = useState([]);

  const url = 'https://graphqlzero.almansi.me/api';

  useEffect(() => {
    getTodos();
  }, []);

  const makeRequest = async (query) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    return await res.json();
  };

  function addTodoValueOnChange(e) {
    setAddTodoValue(e.target.value);
  }
  function findTodoValueOnChange(e) {
    setFindTodoValue(e.target.value);
  }

  async function toggleCheckBox(e, todoId) {
    console.log(e.target.checked);
    const changeStatusQuery = `mutation ChangeStatus {
      updateTodo(id: "${todoId}", input: {completed: ${e.target.checked}}) {
          completed
      }
  }`;
    const data = await makeRequest(changeStatusQuery);

    const arr = todosData.map((todo) => {
      if (todo.id === todoId) {
        todo.completed = data.data.updateTodo.completed;
        return todo;
      } else return todo;
    });
    setTodosData(arr);
  }

  async function getTodos() {
    const res = await makeRequest(`query Todos {
		todos{
			data {
				id
				title
				completed
				user {
					name
				}
			}
		}
	}`).then(({ data }) => data.todos.data);
    setTodosData(res);
  }

  async function addTodo() {
    if (addTodoValue) {
      const newTaskQuery = `mutation CreateTodo {
				createTodo(input:{title: "${addTodoValue}", completed: false}){
					title
					completed
					id
				}
			}`;
      const data = await makeRequest(newTaskQuery);
      //?== возвращает данные ====
      console.log(data.data.createTodo);
      setTodosData((prev) => [...prev, data.data.createTodo]);
      setAddTodoValue('');
    }
  }

  async function searchTodo() {
    if (findTodoValue) {
      const searchQuery = `query searchQuery{
					todos(options:{search:{q: "${findTodoValue}"}, sort:{field: "id", order: ASC}}){
							data {
								id
								title
								completed
								user { name }
							}
						}
			}`;
      const { data } = await makeRequest(searchQuery);
      const res = [];
      data.todos.data.forEach((todo) => res.push(todo));
      setTodosData(res);
      setFindTodoValue('');
    }
  }

  const handleClick = async (todoId) => {
    const delData = `query delTodo{
    todo(id: "${todoId}" ){id
  }
}`;

    const { data } = await makeRequest(delData);
    const newArr = todosData.filter((todo) => todo.id !== data.todo.id);
    setTodosData(newArr);
  };

  return (
    <div className='todo_wrapper'>
      <h1>GraphQL Todos</h1>

      <div className='control_panel'>
        <div className='form_wrapper'>
          <div className='input_wrapper'>
            <label htmlFor='addTodo'>Add Todo</label>
            <input
              type='text'
              id='addTodo'
              onChange={(e) => {
                addTodoValueOnChange(e);
              }}
            />
          </div>
          <button className='btn' onClick={addTodo}>
            Add
          </button>
        </div>

        <div className='form_wrapper'>
          <div className='input_wrapper'>
            <label htmlFor='findTodo'>Add Todo </label>
            <input
              type='text'
              id='findTodo'
              onChange={(e) => {
                findTodoValueOnChange(e);
              }}
            />
          </div>
          <button className='btn' onClick={searchTodo}>
            Add
          </button>
        </div>
      </div>
      <div className='list_wrapper'>
        <ul>
          {todosData.map((el) => {
            return (
              <li key={el.id}>
                <div>{el.id}</div>
                <input
                  type='checkbox'
                  checked={el.completed}
                  onChange={(e) => toggleCheckBox(e, el.id)}
                />
                <p>{el.title}</p>
                {el.user && <div>{el.user.name}</div>}
                <button className='btn_remove' onClick={() => handleClick(el.id)}>
                  X
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default App;
