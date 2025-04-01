import React from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/DefaultLayout.scss';
import Header from '../components/Header';
import Footer from '../components/Footer';
function DefaultLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default DefaultLayout;