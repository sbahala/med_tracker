import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './authContext';


export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser } = useContext(AuthContext);

    if (!currentUser) {
        //no login
        return <Navigate to="/" />;
    } else if (allowedRoles.includes(currentUser.role)) {
        // roles are the same
        return children;
    } else {
        // roles different
        return <Navigate to="/login" />;
    }
};