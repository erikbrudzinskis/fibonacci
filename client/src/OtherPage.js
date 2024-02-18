import React from 'react';
import { Link } from 'react-router-dom';

export default() => {
    return (
        <div>
            Fictitious page, only purpose of which is to add routing to the application! You will find absolutely nothing here! =)
            <Link to="/">Go home</Link>
        </div>
    );
};