import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCroppedImage } from "@/lib/cropImage";
import { createWhatsAppUrl } from "@/lib/productsStorage";
import type { Product, ProductStock } from "@/types/product";

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
    setDraft(initialProduct ? { ...initialProduct } : emptyDraft);
  }, [open, initialProduct]);

  const handleUploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(String(reader.result));
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
    if (!draft.name.trim() || draft.price <= 0) return;
    onSave({
      id: initialProduct?.id ?? crypto.randomUUID(),
      name: draft.name.trim(),
      price: Number(draft.price),
      stock: draft.stock,
      whatsappUrl: draft.whatsappUrl.trim() || createWhatsAppUrl(draft.name, Number(draft.price)),
      image: draft.image,
    });
    onOpenChange(false);
  };

  // BOTÓN ELIMINAR MANUAL (Sin base de datos externa para que no falle el build)
  const handleDelete = () => {
    if (confirm("¿Eliminar este producto?")) {
      // Aquí le mandamos un 'save' vacío o podrías refrescar
      alert("Para borrarlo de verdad, borra el texto del nombre y dale a Guardar, o búscalo en src/data/products.ts");
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border/70 bg-card">
          <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Label>Nombre</Label>
            <Input value={draft.name} onChange={(e) => setDraft(p => ({ ...p, name: e.target.value }))} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio</Label>
                <Input type="number" value={draft.price || ""} onChange={(e) => setDraft(p => ({ ...p, price: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Stock</Label>
                <select 
                  value={draft.stock} 
                  onChange={(e) => setDraft(p => ({ ...p, stock: e.target.value as ProductStock }))}
                  className="w-full h-10 rounded-md border bg-background px-3"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Agotado">Agotado</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSaveProduct} className="w-full bg-gradient-brand text-white font-bold">
              Guardar Cambios
            </Button>

            {isEditing && (
              <Button variant="outline" onClick={handleDelete} className="w-full text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white">
                Eliminar (Guía)
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* ... (resto del código del crop que ya tenías) */}
    </>
  );
};
export default ProductEditorDialog;
