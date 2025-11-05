require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const Todo = require('./models/Todo');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URL || process.env.DATABASE_URL || 'mongodb://localhost:27017/todoapp';

console.log('🔍 Environment check:');
console.log('PORT:', PORT);
console.log('All MongoDB env vars:');
Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('DATABASE')).forEach(key => {
  console.log(`${key}:`, process.env[key] ? 'Set ✅' : 'Not set ❌');
});
console.log('MONGODB_URI:', MONGODB_URI ? 'Set ✅' : 'Not set ❌');
console.log('MongoDB URI (masked):', MONGODB_URI ? MONGODB_URI.replace(/:\/\/.*@/, '://***@') : 'None');

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}).catch(err => {
  console.log('❌ Initial MongoDB connection failed:', err.message);
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// GET all todos
app.get('/api/todos', async (req, res) => {
  console.log('📋 GET /api/todos called');
  try {
    const todos = await Todo.find();
    console.log('📊 Found todos:', todos.length);
    res.json(todos);
  } catch (error) {
    console.log('❌ Error fetching todos:', error.message);
    res.json([]);
  }
});

// POST new todo
app.post('/api/todos', async (req, res) => {
  console.log('📝 POST /api/todos called with:', req.body);
  
  try {
    const todo = new Todo({ title: req.body.title });
    console.log('💾 Saving todo:', todo);
    await todo.save();
    console.log('✅ Todo saved successfully:', todo);
    res.status(201).json(todo);
  } catch (error) {
    console.log('❌ Error creating todo:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// PUT update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API Status endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo API is running!', 
    endpoints: {
      'GET /api/todos': 'Get all todos',
      'POST /api/todos': 'Create new todo',
      'PUT /api/todos/:id': 'Update todo',
      'DELETE /api/todos/:id': 'Delete todo'
    }
  });
});

// Handle 404 for non-API routes
app.get('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});isplay = 'none';
          list.innerHTML = todos.map(todo => {
            return '<li class="todo-item' + (todo.completed ? ' completed' : '') + '">' +
              '<div class="todo-content">' +
                '<input type="checkbox" class="todo-checkbox" ' + (todo.completed ? 'checked' : '') + ' onchange="toggleTodo(\'' + todo._id + '\')"/>' +
                '<div class="todo-text"><span class="todo-title">' + todo.title + '</span></div>' +
              '</div>' +
              '<div class="todo-actions">' +
                '<button class="delete-btn" onclick="deleteTodo(\'' + todo._id + '\')">Delete</button>' +
              '</div>' +
            '</li>';
          }).join('');
        }

        function updateStats() {
          const total = todos.length;
          const completed = todos.filter(t => t.completed).length;
          const pending = total - completed;
          
          document.getElementById('totalCount').textContent = total;
          document.getElementById('completedCount').textContent = completed;
          document.getElementById('pendingCount').textContent = pending;
        }

        document.getElementById('todoInput').addEventListener('keypress', function(e) {
          if (e.key === 'Enter') addTodo();
        });

        loadTodos();
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});