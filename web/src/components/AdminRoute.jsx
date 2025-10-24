/*
TO KEEP A ROUTE PRIVATE FOR NOT LOGGED IN USERS

- ARSENY
*/

import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { AuthContextAdmin, AuthProviderAdmin } from '../contexts/AuthAdminProvider';


// const PrivateRoute = ({ children }) => {
//   const { user, loading } = useContext(AuthContext);

//   if (loading) {
//     return <div>Loading...</div>;  // or a spinner component if you have one
//   }

//   return user ? children : <Navigate to="/login" replace />;
// };


const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContextAdmin);
  const location = useLocation();
 
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export default AdminRoute;