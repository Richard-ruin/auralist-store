# AURALIST-STORE

A comprehensive e-commerce platform developed as a project for International Logistics and Business University (Universitas Logistik dan Bisnis Internasional).

## Project Overview

AURALIST-STORE is a full-stack e-commerce application designed to provide a complete online shopping experience. The platform includes user authentication, product management, shopping cart functionality, order processing, payment integration, community features, and admin dashboard.

## Features

### User Features
- **Authentication**: Register, login, password recovery
- **Product Browsing**: Browse products by category, brand, or search
- **Shopping Cart**: Add products, manage quantities, checkout
- **Wishlist**: Save products for later
- **Order Management**: View order history, track shipments
- **Payment Processing**: Multiple payment methods
- **User Profile**: Manage addresses, view order history
- **Reviews**: Rate and review products
- **Chat Support**: Real-time chat with customer service
- **Community Features**: Participate in community channels and chats

### Admin Features
- **Dashboard**: Analytics and reporting
- **Product Management**: Add, edit, and delete products
- **Category Management**: Create and manage product categories
- **Brand Management**: Manage product brands
- **Order Management**: Process orders, manage returns
- **User Management**: View and manage user accounts
- **Chat Management**: Respond to customer inquiries
- **Report Generation**: Export sales and product reports

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **Passport.js**: OAuth integration
- **Socket.io**: Real-time communication
- **Multer**: File uploads

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **Context API**: State management
- **Axios**: HTTP client
- **Socket.io-client**: Real-time communication
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled UI components
- **Recharts**: Data visualization
- **Date-fns**: Date manipulation

## Project Structure

### Backend
```
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── public/
├── routes/
├── utils/
├── .env
├── package.json
└── server.js
```

### Frontend
```
frontend/
├── build/
├── public/
├── src/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── tailwind.config.js
```

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd auralist-store
   ```

2. **Backend Setup**
   ```
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory with necessary environment variables (see sample in `.env`).

3. **Frontend Setup**
   ```
   cd frontend
   npm install
   ```

   Create a `.env` file in the frontend directory with necessary environment variables (see sample in `.env`).

### Running the Application

1. **Start Backend Server**
   ```
   cd backend
   npm start
   ```
   The server will run on http://localhost:5000

2. **Start Frontend Development Server**
   ```
   cd frontend
   npm start
   ```
   The application will run on http://localhost:3000

## Deployment

### Backend
- Update the `.env` file with production variables
- Set `NODE_ENV=production`
- Use a process manager like PM2 for Node.js applications

### Frontend
- Create a production build: `npm run build`
- Serve the static files from the `build` directory

## Contributors

- Richard Johannes Pakpahan(Me)
- Robby Rivaldy(Partner)
- Supriady(Mentor)

## License

This project is part of academic coursework for International Logistics and Business University.

## Acknowledgements

Special thanks to our professors and advisors at International Logistics and Business University (Universitas Logistik dan Bisnis Internasional) for their guidance and support throughout the development of this project.
