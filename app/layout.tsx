export const metadata = {
  title: "Recall Forge",
  description: "Paste your notes, get an adaptive quiz that hunts down exactly what you don't know yet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0b0d12", color: "#e8e8ec" }}>
        {children}
      </body>
    </html>
  );
}
