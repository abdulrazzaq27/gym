import React from 'react';

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-dark text-light text-center py-3 mt-auto">
            <small>© {year} GYM</small>
        </footer>
    );
}

export default Footer;
