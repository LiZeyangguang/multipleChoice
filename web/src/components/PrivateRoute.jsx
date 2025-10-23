/*
TO KEEP A ROUTE PRIVATE FOR NOT LOGGED IN USERS

- ARSENY
*/

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthContext, AuthProvider } from '../contexts/AuthProvider';


const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;  // or a spinner component if you have one
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;