import { type FormEvent, useEffect, useMemo, useState } from "react";
import ProductEditorDialog from "@/components/admin/ProductEditorDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadAnnouncement, loadProducts, saveAnnouncement, saveProducts } from "@/lib/productsStorage";
import type { Product } from "@/types/product";

const ADMIN_USER = "Guss81";
const ADMIN_PASS = "Gustavo81@";
const ADMIN_AUTH_KEY = "gusstore_admin_auth";

const Admin = () => {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [announcement, setAnnouncement] = useState(() => loadAnnouncement());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(ADMIN_AUTH_KEY) === "ok");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveAnnouncement(announcement);
  }, [announcement]);

  const totalStock = useMemo(
    () => products.filter((product) => product.stock === "Disponible").length,
    [products],
  );

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      localStorage.setItem(ADMIN_AUTH_KEY, "ok");
      setIsAuthenticated(true);
    }
  };

  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      return exists ? prev.map((item) => (item.id === product.id ? product : item)) : [product, ...prev];
    });
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen bg-background px-4 py-16">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Ruta oculta</p>
          <h1 className="font-display mt-2 text-3xl text-foreground">Panel Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ingresa la contraseña para gestionar Gusstore.lat.</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-user">Usuario</Label>
              <Input
                id="admin-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Guss81"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Contraseña</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground shadow-neon">
              Entrar
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-10">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="glass-card rounded-2xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Gestión interna</p>
              <h1 className="font-display text-3xl">Dashboard Gusstore.lat</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {products.length} productos · {totalStock} disponibles
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setActiveProduct(null);
                  setDialogOpen(true);
                }}
                className="bg-gradient-brand text-primary-foreground shadow-neon"
              >
                Nuevo producto
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Salir
              </Button>
            </div>
          </div>
        </header>

        <section className="glass-card rounded-2xl p-5">
          <div className="space-y-2">
            <Label htmlFor="announcement">Texto del banner de ofertas</Label>
            <Input
              id="announcement"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Escribe el mensaje que se mostrará en el banner"
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-20 w-20 rounded-lg border border-border/60 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted-foreground">S/ {product.price.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{product.stock}</p>
                </div>
              </div>

              <p className="mt-3 truncate text-xs text-muted-foreground">{product.whatsappUrl}</p>

              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => {
                  setActiveProduct(product);
                  setDialogOpen(true);
                }}
              >
                Editar producto
              </Button>
            </article>
          ))}
        </section>
      </section>

      <ProductEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialProduct={activeProduct}
        onSave={handleSaveProduct}
      />
    </main>
  );
};

export default Admin;
