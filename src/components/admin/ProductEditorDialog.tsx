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

const emptyDraft = { name: "", price: 0, stock: "Disponible" as ProductStock, whatsappUrl: "", image: "" };

const ProductEditorDialog = ({ open, onOpenChange, initialProduct, onSave }: ProductEditorDialogProps) => {
  const isEditing = Boolean(initialProduct);
  const [draft, setDraft] = useState(emptyDraft);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (open) setDraft(initialProduct ? { ...initialProduct } : emptyDraft);
  }, [open, initialProduct]);

  const handleUploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setCropImage(String(reader.result)); setCropOpen(true); };
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-card border-border/70">
          <DialogHeader><DialogTitle>{isEditing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Label>Nombre</Label>
            <Input value={draft.name} onChange={(e) => setDraft(p => ({ ...p, name: e.target.value }))} />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio (S/)</Label>
                <Input type="number" value={draft.price || ""} onChange={(e) => setDraft(p => ({ ...p, price: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Stock</Label>
                <select value={draft.stock} onChange={(e) => setDraft(p => ({ ...p, stock: e.target.value as ProductStock }))} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="Disponible">Disponible</option>
                  <option value="Agotado">Agotado</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagen</Label>
              <Input type="file" accept="image/*" onChange={handleUploadImage} />
              {draft.image && <img src={draft.image} className="mt-2 h-32 w-full rounded-lg object-cover" />}
            </div>

            <Button onClick={handleSaveProduct} className="w-full bg-gradient-brand text-white font-bold">
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </Button>
            
            {isEditing && (
              <Button 
                variant="outline" 
                onClick={() => alert("Para borrar: Limpia el nombre y dale a Guardar, o búscalo en src/data/products.ts")} 
                className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold"
              >
                ELIMINAR (VER INSTRUCCIONES)
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent>
          <div className="relative h-64 w-full bg-background overflow-hidden rounded-xl">
            <Cropper image={cropImage} crop={crop} zoom={zoom} aspect={4 / 3} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, ap) => setCroppedAreaPixels(ap)} />
          </div>
          <Button onClick={handleCropSave} className="w-full bg-gradient-brand text-white">Guardar Recorte</Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductEditorDialog;
