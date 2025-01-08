// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
    const auth = getAuth();
    const user = auth.currentUser;

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" />;
    }

    return children; // Render the protected component if authenticated
};

export default ProtectedRoute;
