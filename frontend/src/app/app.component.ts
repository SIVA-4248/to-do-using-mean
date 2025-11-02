import { Component, OnInit } from '@angular/core';
import { TodoService, Todo } from './services/todo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  todos: Todo[] = [];
  newTodoTitle = '';
  editingId: string | null = null;
  editingTitle = '';

  constructor(private todoService: TodoService) {}

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
    });
  }

  addTodo() {
    if (this.newTodoTitle.trim()) {
      const todo: Todo = { title: this.newTodoTitle, completed: false };
      this.todoService.createTodo(todo).subscribe(() => {
        this.newTodoTitle = '';
        this.loadTodos();
      });
    }
  }

  toggleTodo(todo: Todo) {
    todo.completed = !todo.completed;
    this.todoService.updateTodo(todo._id!, todo).subscribe();
  }

  startEdit(todo: Todo) {
    this.editingId = todo._id!;
    this.editingTitle = todo.title;
  }

  saveEdit(todo: Todo) {
    if (this.editingTitle.trim()) {
      todo.title = this.editingTitle;
      this.todoService.updateTodo(todo._id!, todo).subscribe(() => {
        this.editingId = null;
        this.editingTitle = '';
      });
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editingTitle = '';
  }

  deleteTodo(id: string) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.loadTodos();
    });
  }
}