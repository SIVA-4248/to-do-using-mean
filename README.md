# MEAN Stack To-Do Application

A complete To-Do List application built with MongoDB, Express.js, Angular, and Node.js.

## Prerequisites
- Node.js (v14+)
- MongoDB (running on localhost:27017)
- Angular CLI (`npm install -g @angular/cli`)

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:3000

### 2. Frontend Setup
```bash
cd frontend
npm install
ng serve
```
Application runs on http://localhost:4200

### 3. Database
Ensure MongoDB is running on localhost:27017
Database name: `todoapp`

## Features
- ✅ Create new todos
- ✅ View all todos
- ✅ Mark todos as complete/incomplete
- ✅ Delete todos
- ✅ Real-time updates

## API Endpoints
- GET `/api/todos` - Get all todos
- POST `/api/todos` - Create new todo
- PUT `/api/todos/:id` - Update todo
- DELETE `/api/todos/:id` - Delete todo

## Tech Stack
- **Frontend**: Angular 16, TypeScript, HTML, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **HTTP Client**: Angular HttpClient