// frontend/src/components/layout/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import ChatIconFooter from '../common/ChatIconFooter';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ChatIconFooter />
    </div>
  );
};

export default MainLayout;