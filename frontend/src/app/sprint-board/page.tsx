"use client";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const initialData = {
  columns: [
    { id: "backlog", title: "Backlog", taskIds: ["t1", "t2"] },
    { id: "inprogress", title: "In Progress", taskIds: ["t3"] },
    { id: "review", title: "Review", taskIds: ["t4"] },
    { id: "done", title: "Done", taskIds: ["t5"] },
  ],
  tasks: {
    t1: { id: "t1", content: "Design login page" },
    t2: { id: "t2", content: "Set up database schema" },
    t3: { id: "t3", content: "Implement OAuth" },
    t4: { id: "t4", content: "Write unit tests" },
    t5: { id: "t5", content: "Deploy to production" },
  },
};

export default function SprintBoardPage() {
  const [data, setData] = useState(initialData);

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    // Column drag
    if (type === "column") {
      const newColumns = Array.from(data.columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      setData({ ...data, columns: newColumns });
      return;
    }
    // Task drag
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    const startColIdx = data.columns.findIndex((c) => c.id === source.droppableId);
    const endColIdx = data.columns.findIndex((c) => c.id === destination.droppableId);
    const startCol = data.columns[startColIdx];
    const endCol = data.columns[endColIdx];
    // Moving within same column
    if (startCol === endCol) {
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      const newCol = { ...startCol, taskIds: newTaskIds };
      const newColumns = Array.from(data.columns);
      newColumns[startColIdx] = newCol;
      setData({ ...data, columns: newColumns });
    } else {
      // Moving to different column
      const startTaskIds = Array.from(startCol.taskIds);
      startTaskIds.splice(source.index, 1);
      const endTaskIds = Array.from(endCol.taskIds);
      endTaskIds.splice(destination.index, 0, draggableId);
      const newStartCol = { ...startCol, taskIds: startTaskIds };
      const newEndCol = { ...endCol, taskIds: endTaskIds };
      const newColumns = Array.from(data.columns);
      newColumns[startColIdx] = newStartCol;
      newColumns[endColIdx] = newEndCol;
      setData({ ...data, columns: newColumns });
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sprint Board</h1>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition">New Task</Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div
              className="flex gap-6 overflow-x-auto pb-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <AnimatePresence initial={false}>
                {data.columns.map((column, colIdx) => (
                  <Draggable draggableId={column.id} index={colIdx} key={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="h-full flex flex-col"
                      >
                        <motion.div
                          layout
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className={`w-72 min-w-[18rem] bg-gray-50 rounded-xl shadow-md flex flex-col p-4 border-2 transition-colors
                            ${snapshot.isDragging ? "border-purple-400 bg-purple-50" : "border-transparent"}`}
                        >
                          <div className="font-semibold text-lg mb-4 text-purple-700 flex items-center gap-2">
                            <span className="cursor-move" {...provided.dragHandleProps}>☰</span> {column.title}
                          </div>
                          <Droppable droppableId={column.id} type="task">
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`flex flex-col gap-3 min-h-[40px] transition-colors ${snapshot.isDraggingOver ? "bg-purple-100/60" : ""}`}
                              >
                                <AnimatePresence initial={false}>
                                  {column.taskIds.map((taskId, taskIdx) => {
                                    const task = data.tasks[taskId as keyof typeof data.tasks];
                                    return (
                                      <Draggable draggableId={task.id} index={taskIdx} key={task.id}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                          >
                                            <motion.div
                                              layout
                                              initial={{ scale: 0.95, opacity: 0 }}
                                              animate={{ scale: 1, opacity: 1 }}
                                              exit={{ scale: 0.9, opacity: 0 }}
                                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                              className={`bg-white rounded-lg shadow p-3 border-l-4 border-purple-400 font-medium text-gray-800 cursor-pointer transition-colors
                                                ${snapshot.isDragging ? "bg-purple-50 border-purple-600" : ""}`}
                                            >
                                              {task.content}
                                            </motion.div>
                                          </div>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                </AnimatePresence>
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </motion.div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 