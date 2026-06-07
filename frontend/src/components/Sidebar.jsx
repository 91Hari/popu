export default function Sidebar({ children }) {
  return (
    <aside style={{ width: 220, padding: 12, borderRight: "1px solid #eee" }}>
      <div style={{ marginBottom: 12 }}>Sidebar</div>
      {children}
    </aside>
  );
}
