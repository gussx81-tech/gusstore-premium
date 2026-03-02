import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCroppedImage } from "@/lib/cropImage";
import { createWhatsAppUrl } from "@/lib/productsStorage";
import type { Product, ProductStock } from "@/types/product";
import { supabase } from "@/integrations/supabase/client"; // Conexión a DB
import { Trash2 } from "lucide-react"; // Icono de basura

interface ProductEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProduct?: Product | null;
  onSave: (product: Product) => void;
}

interface ProductDraft {
  name: string;
  price: number;
  stock: ProductStock;
  whatsappUrl: string;
  image: string;
}

const emptyDraft: ProductDraft = {
  name: "",
  price: 0,
  stock: "Disponible",
  whatsappUrl: "",
  image: "",
};

const ProductEditorDialog = ({ open, onOpenChange, initialProduct, onSave }: ProductEditorDialogProps) => {
  const isEditing = Boolean(initialProduct);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const dialogTitle = useMemo(() => (isEditing ? "Editar producto" : "Nuevo producto"), [isEditing]);

  useEffect(() => {
    if (!open) return;
    setDraft(
      initialProduct
        ? {
            name: initialProduct.name,
            price: initialProduct.price,
            stock: initialProduct.stock,
            whatsappUrl: initialProduct.whatsappUrl,
            image: initialProduct.image,
          }
        : emptyDraft,
    );
  }, [open, initialProduct]);

  const handleUploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(String(reader.result));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    const cropped = await getCroppedImage(cropImage, croppedAreaPixels);
    setDraft((prev) => ({ ...prev, image: cropped }));
    setCropOpen(false);
  };

  const handleSaveProduct = () => {
    const cleanName = draft.name.trim();
    if (!cleanName || draft.price <= 0) return;
    onSave({
      id: initialProduct?.id ?? crypto.randomUUID(),
      name: cleanName,
      price: Number(draft.price),
      stock: draft.stock,
      whatsappUrl: draft.whatsappUrl.trim() || createWhatsAppUrl(cleanName, Number(draft.price)),
      image: draft.image,
    });
    onOpenChange(false);
  };

  // --- FUNCIÓN PARA ELIMINAR ---
  const handleDeleteProduct = async () => {
    if (!initialProduct?.id) return;
    
    const confirmDelete = confirm(`¿Estás seguro de eliminar "${draft.name}"? Esta acción no se puede deshacer.`);
    
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', initialProduct.id);

        if (error) throw error;
        
        alert("Producto eliminado.");
        onOpenChange(false);
        window.location.reload(); // Recarga para que desaparezca de la lista
      } catch (err) {
        console.error(err);
        alert("Error al eliminar el producto. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/70 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{dialogTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ej. Netflix 4K"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (S/)</Label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  value={draft.price || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <select
                  id="stock"
                  value={draft.stock}
                  onChange={(e) => setDraft((prev) => ({ ...prev, stock: e.target.value as ProductStock }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Agotado">Agotado</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">URL de WhatsApp</Label>
              <Input
                id="whatsapp"
                value={draft.whatsappUrl}
                onChange={(e) => setDraft((prev) => ({ ...prev, whatsappUrl: e.target.value }))}
                placeholder="https://codesperu.lat/pay?item=..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagen del producto</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleUploadImage} />
              {draft.image && (
                <img
                  src={draft.image}
                  alt="Preview"
                  className="mt-2 h-40 w-full rounded-lg border border-border/50 object-cover"
                />
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={handleSaveProduct} className="w-full bg-gradient-brand text-primary-foreground shadow-neon font-bold">
                {isEditing ? "Guardar cambios" : "Crear producto"}
              </Button>
              
              {isEditing && (
                <Button 
                  variant="outline" 
                  onClick={handleDeleteProduct}
                  className="w-full border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex gap-2 items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar permanentemente
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="border-border/70 bg-card">
          <DialogHeader>
            <DialogTitle>Recortar imagen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative h-72 w-full overflow-hidden rounded-xl bg-background">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>
            <Button onClick={handleCropSave} className="w-full bg-gradient-brand text-primary-foreground">
              Guardar recorte
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductEditorDialog;
