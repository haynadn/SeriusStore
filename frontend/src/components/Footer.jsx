export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <p className="footer-text">
                    © {new Date().getFullYear()} SeriusStore. All rights reserved.
                </p>
                <p className="footer-text">
                    Made with ❤️ in Indonesia
                </p>
            </div>
        </footer>
    );
}
