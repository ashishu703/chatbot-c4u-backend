# 📦 Omnichannel-ProMax-BE

This project is a full-featured multi-channel inbox management system designed for businesses to streamline communication across major messaging platforms. It supports seamless integration with Instagram, WhatsApp, and Messenger, allowing users to manage conversations from a single dashboard.

In addition to core messaging capabilities, the system includes

🔁 WhatsApp Broadcasts with support for reusable message templates

🤖 An intuitive chatbot builder powered by React Flow

🔐 Google Sign-In for secure and fast authentication

💳 Plan management with flexible billing options via

PayPal

Razorpay

Stripe

This solution is ideal for customer support, sales teams, and automation-focused businesses looking to scale their messaging infrastructure with modern tools and integrations.

## 🚀 Features

- Node.js with Express
- Sequelize ORM
- Sequelize CLI migrations
- Nodemon for development

## 📁 Project Structure
```
├── api
├── client
├── config
├── controllers
├── docs
├── dtos
├── emails
├── exceptions
├── jobs
├── locales
├── logs
├── messages
├── middlewares
├── migrations
├── models
├── node_modules
├── repositories
├── routes
├── services
├── statics
├── types
├── utils
```



## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/citexsoft/Omnichannel-ProMax-be
cd Omnichannel-ProMax-be
```

### 2. Install Dependencies
```bash
yarn intall
```

### 3. Configure Database
- Copy .env.example as .env
- Fill all the database credentials

### 4. Initialize Sequelize
```bash
yarn  migration:init
```

### 5. Run Migrations
```bash
yarn  migration:migrate
```

### 6. Start the Server
```bash
yarn start
```

## 🏗️ Development Guide
### 1. Initialize Sequelize
```bash
yarn  migration:init
```

### 2. Create Model and Migration
```bash
yarn migration:create ModelName
```

### 3. Run Migrations
```bash
yarn  migration:migrate
```

### 4. Rollback Migrations
```bash
yarn  migration:rollback
```


### 4. Rollback All Migrations
```bash
yarn migration:rollback:all
```