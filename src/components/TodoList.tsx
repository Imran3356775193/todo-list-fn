'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Todo {
  id: number;
  task: string;
  dueDate?: string;
  completed: boolean;
  attachment?: any | undefined; // Attachment field for optional file
  attachmentUrl?:  any;
}

const baseURL= 'http://localhost:5000';
const apiKey='sdf332432zxcc34';
const PAGE_SIZE = 5;

export default function TodoList() {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachment, setAttachment] = useState<File | undefined>(undefined); // Track the attachment
  const [todos, setTodos] = useState<Todo[]>([]);  // Fetch todos from API
  const [editId, setEditId] = useState<number | null>(null);
  const [editTask, setEditTask] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editAttachment, setEditAttachment] = useState<File | undefined>(undefined); // Track the attachment during edit
  const [editCompleted, setEditCompleted] = useState(false); // Track the status for edit
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Todos from the Backend API
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(`${baseURL}/api/todos`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setTodos(data); // Set todos data to state
      } catch (error) {
        toast.error('Error fetching todos');
      }
    };

    fetchTodos();
  }, []);

  const filteredTodos = todos.filter(todo =>
    filter === 'All' ? true :
    filter === 'Completed' ? todo.completed :
    !todo.completed
  );

  const totalPages = Math.ceil(filteredTodos.length / PAGE_SIZE);
  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const addTodo = () => {
    if (!task.trim()) {
      toast.error('Task name is required');
      return;
    }

    // Add todo via backend API (POST request)
    const formData = new FormData();
    formData.append('task', task.trim());
    formData.append('dueDate', dueDate || '');
    formData.append('completed', 'false');
    if (attachment) formData.append('attachment', attachment);

    fetch(`${baseURL}/api/todos`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey, // Include API key in the headers
      },
      body: formData,
    })
    .then((response) => response.json())
    .then((data) => {
      setTodos([...todos, data]);
      setTask('');
      setDueDate('');
      setAttachment(undefined); // Reset file input after adding
      toast.success('Task added');
    })
    .catch((error) => {
      toast.error('Error adding task');
    });
  };

  const deleteTodo = (id: number) => {
    fetch(`${baseURL}/api/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'x-api-key': apiKey, // Include API key in the headers
      },
    })
    .then(() => {
      setTodos(todos.filter((todo) => todo.id !== id));
      toast.success('Task deleted');
    })
    .catch((error) => {
      toast.error('Error deleting task');
    });
  };

  const toggleComplete = (id: number) => {
    const todo = todos.find((todo) => todo.id === id);
    if (todo) {
      fetch(`${baseURL}/api/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !todo.completed }),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
      })
      .then((response) => response.json())
      .then(() => {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          )
        );
        toast.success('Status updated');
      })
      .catch(() => {
        toast.error('Error updating status');
      });
    }
  };

  const deleteAll = () => {
    fetch(`${baseURL}/api/todos`, {
      method: 'DELETE', 
      headers: {
        'x-api-key': apiKey, // Include API key in the headers
      },
    })
    .then(() => {
      setTodos([]);
      toast.success('All tasks deleted');
    })
    .catch((error) => {
      toast.error('Error deleting tasks');
    });
  };

  const startEdit = (todo: Todo) => {
    setEditId(todo.id);
    setEditTask(todo.task);
    setEditDate(todo.dueDate || '');
    setEditAttachment(todo.attachment); // Set the attachment for editing
    setEditCompleted(todo.completed); // Set the completion status for editing
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTask('');
    setEditDate('');
    setEditAttachment(undefined);
    setEditCompleted(false);
  };

  const saveEdit = (id: number) => {
    if (!editTask.trim()) {
      toast.error('Task name is required');
      return;
    }

    fetch(`${baseURL}/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        task: editTask.trim(),
        dueDate: editDate || undefined,
        attachment: editAttachment,
        completed: editCompleted,
      }),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    })
    .then((response) => response.json())
    .then(() => {
      setTodos(
        todos.map((todo) =>
          todo.id === id
            ? { ...todo, task: editTask.trim(), dueDate: editDate, attachment: editAttachment, completed: editCompleted }
            : todo
        )
      );
      cancelEdit();
      toast.success('Task updated');
    })
    .catch((error) => {
      toast.error('Error updating task');
    });
  };

  const changePage = (page: number) => setCurrentPage(page);

  return (
    <div className="w-full md:max-w-4xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg text-center">

      <h1 className="text-3xl font-bold mb-6">Todo List</h1>

      <div className="flex gap-2 justify-center mb-4">
        <input
          className="border border-pink-500 rounded-md px-3 py-2 w-1/2 outline-none"
          type="text"
          placeholder="Add a todo . . ."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <input
          className="border border-pink-500 rounded-md px-3 py-2 w-1/3 outline-none"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : undefined)}
          className="border border-pink-500 rounded-md px-3 py-2 w-1/3"
        />
        <button
          onClick={addTodo}
          className="bg-pink-500 text-white px-4 rounded-md text-lg"
        >
          +
        </button>
      </div>

      <div className="flex justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2">
          {['All', 'Pending', 'Completed'].map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded ${
                filter === f ? 'bg-pink-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => {
                setFilter(f as any);
                setCurrentPage(1);
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={deleteAll}
          className="bg-pink-500 text-white px-4 py-2 rounded"
        >
          DELETE ALL
        </button>
      </div>
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
            <tr className="text-gray-700">
            <th className="px-4 py-2 text-left">TASK</th>
            <th className="px-4 py-2 text-left">DUE DATE</th>
            <th className="px-4 py-2 text-left">STATUS</th>
            <th className="px-4 py-2 text-left">ATTACHMENT</th>
            <th className="px-4 py-2 text-right">ACTIONS</th>
            </tr>
        </thead>
        <tbody>
            {paginatedTodos.map((todo) => (
            <tr key={todo.id} className="bg-gray-100 rounded-md h-12">
                <td className="px-4 py-2 align-middle">
                {editId === todo.id ? (
                    <div className="h-8 flex items-center">
                    <input
                        className="border px-2 py-1 rounded w-full h-full text-sm"
                        value={editTask}
                        onChange={(e) => setEditTask(e.target.value)}
                    />
                    </div>
                ) : (
                    <span className="text-sm">{todo.task}</span>
                )}
                </td>
                <td className="px-4 py-2 align-middle">
                  {editId === todo.id ? (
                    <div className="h-8 flex items-center">
                      <input
                        type="date"
                        className="border px-2 py-1 rounded w-full h-full text-sm"
                        value={editDate ? editDate.split('T')[0] : ''}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                    </div>
                  ) : (
                    <span className="text-sm">
                      {todo.dueDate
                        ? format(new Date(todo.dueDate), 'dd/MM/yyyy') // 'dd/MM/yyyy' format
                        : '-'}
                    </span>
                  )}
                </td>

                <td className="px-4 py-2 align-middle">
                {editId === todo.id ? (
                    <div className="h-8 flex items-center">
                    <select
                        className="border px-2 py-1 rounded w-full h-full text-sm"
                        value={editCompleted ? 'Completed' : 'Pending'}
                        onChange={(e) => setEditCompleted(e.target.value === 'Completed')}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>
                    </div>
                ) : (
                    <span className="text-sm">{todo.completed ? 'Completed' : 'Pending'}</span>
                )}
                </td>
                <td className="px-4 py-2 align-middle">
                {editId === todo.id ? (
                  <div className="h-8 flex items-center gap-2">
                    {editAttachment ? (
                      <div className="flex items-center gap-2 max-w-[130px] truncate">
                        <a
                          href={editAttachment ? URL.createObjectURL(editAttachment) : ''}
                          download
                          className="text-xs text-blue-500 underline truncate inline-block max-w-[120px]"
                          title="Download attachment"
                        >
                          {editAttachment.name}
                        </a>
                        <button
                          onClick={() => setEditAttachment(undefined)}
                          className="bg-red-500 text-white text-xs px-1 py-0.5 rounded"
                        >
                          ✖
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        onChange={(e) =>
                          setEditAttachment(e.target.files ? e.target.files[0] : undefined)
                        }
                        className="file:rounded file:border-0 file:py-1 file:px-2 file:text-xs file:bg-gray-200 text-sm"
                      />
                    )}
                  </div>
                ) : todo.attachment ? (
                  <a
                  href={`${todo.attachment}`} // or a /download route if you use res.download
                  download
                  className="text-xs text-blue-500 underline truncate inline-block max-w-[120px]"
                  title="Download attachment"
                >
                  {todo.attachment}
                </a>
                
                ) : (
                  <span className="text-sm">-</span>
                )}
              </td>

                <td className="px-4 py-2 text-right align-middle">
                {editId === todo.id ? (
                    <div className="flex justify-end items-center gap-1 h-8">
                    <button
                        onClick={() => saveEdit(todo.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                        💾
                    </button>
                    <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white px-2 py-1 rounded"
                    >
                        ❌
                    </button>
                    </div>
                ) : (
                    <div className="flex justify-end items-center gap-1 h-8">
                    <button
                        onClick={() => startEdit(todo)}
                        className="bg-yellow-400 px-2 py-1 rounded"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => toggleComplete(todo.id)}
                        className="bg-green-500 px-2 py-1 rounded"
                    >
                        ✔️
                    </button>
                    <button
                        onClick={() => deleteTodo(todo.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                        🗑️
                    </button>
                    </div>
                )}
                </td>
            </tr>
            ))}
        </tbody>
        </table>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {[...Array(totalPages)].map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => changePage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-sm text-gray-600">
        Made with ❤️ by <strong>Imran Abdullah</strong>
      </p>
    </div>
  );
}
