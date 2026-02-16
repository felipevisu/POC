import "./globals.css";

export const metadata = {
  title: "Price Tracker",
  description: "Extract product prices from any URL",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
