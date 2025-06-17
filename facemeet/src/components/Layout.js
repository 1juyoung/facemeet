import React from 'react';
import './Style.css';
import Feed from './Feed';

const Layout = (props) => {
    return (
        <>
            <div id='box'></div>
            <div id='boxright'></div>
            <div id='boxbottom'></div>
            <Feed />
            <main id="main" role="main">
                {props.children}
            </main>
        </>
    );
}

export default Layout;