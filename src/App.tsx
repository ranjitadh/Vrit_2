import  { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./App.css";

type Task = {
  id: string;
  content: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const initialData: Column[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      { id: "task-1", content: "Learn React" },
      { id: "task-2", content: "Read TypeScript Docs" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [{ id: "task-3", content: "Build a Kanban Board" }],
  },
  {
    id: "done",
    title: "Done",
    tasks: [{ id: "task-4", content: "Install Dependencies" }],
  },
];

const LOCAL_STORAGE_KEY = "kanban-board-data";

const saveToLocalStorage = (data: any) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const loadFromLocalStorage = (): any | null => {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : null;
};

function App() {
  const [columns, setColumns] = useState<Column[]>(() => {
    const savedData = loadFromLocalStorage();
    return savedData || initialData; // Load saved data or use initial data
  });

  useEffect(() => {
    saveToLocalStorage(columns); // Save to localStorage whenever columns change
  }, [columns]);

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumnIndex = columns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destinationColumnIndex = columns.findIndex(
      (col) => col.id === destination.droppableId
    );

    const sourceColumn = columns[sourceColumnIndex];
    const destinationColumn = columns[destinationColumnIndex];

    const sourceTasks = [...sourceColumn.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // Move within the same column
      sourceTasks.splice(destination.index, 0, movedTask);
      const newColumns = [...columns];
      newColumns[sourceColumnIndex].tasks = sourceTasks;
      setColumns(newColumns);
    } else {
      // Move to a different column
      const destinationTasks = [...destinationColumn.tasks];
      destinationTasks.splice(destination.index, 0, movedTask);

      const newColumns = [...columns];
      newColumns[sourceColumnIndex].tasks = sourceTasks;
      newColumns[destinationColumnIndex].tasks = destinationTasks;

      setColumns(newColumns);
    }
  };

  const resetBoard = () => {
    setColumns(initialData);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div className="App">
      <h1>Kanban Board</h1>
      <button className="reset-button" onClick={resetBoard}>
        Reset Board
      </button>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{column.title}</h2>
                  {column.tasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="task"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          tabIndex={0} // Keyboard navigable
                        >
                          {task.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default App;
